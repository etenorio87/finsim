/**
 * Motor de cálculo principal
 *
 * Implementa el cálculo de financiaciones con amortización francesa.
 */

import type { Condiciones, Resultado, FilaCuadro, Comision } from './types';
import {
  tipoDelPeriodo,
  calcularInteres,
  calcularCapitalAmortizado,
  siguienteCapitalPendiente,
  periodosPorAnio,
} from './amortizacion';

/**
 * Calcula los indicadores de una financiación.
 *
 * @param c - Condiciones de la financiación
 * @param opts - Opciones: incluirCuadro genera el cuadro completo de amortización
 * @returns Resultado con todos los indicadores (y opcionalmente el cuadro)
 */
export function calcular(
  c: Condiciones,
  opts?: { incluirCuadro: boolean }
): Resultado {
  // 1. Calcular la cuota usando amortización francesa
  const cuota = calcularCuota(c.importe, c.numeroCuotas, c.tin, c.frecuencia);

  // 2. Generar el cuadro de amortización (si se solicita o si necesitamos calcular TAE)
  const cuadro = generarCuadro(c.importe, cuota, c.numeroCuotas, c.tin, c.frecuencia);

  // 3. Calcular costes
  const totalComisiones = calcularTotalComisiones(c.comisiones, c.importe);
  const costeTotal = cuota * c.numeroCuotas + totalComisiones;
  const costeFinanciero = costeTotal - c.importe;

  // 4. Calcular saldo medio
  const saldoMedio = calcularSaldoMedio(cuadro);

  // 5. Calcular TAE real (incluye comisiones)
  const tae = calcularTAE(c);

  return {
    cuota,
    costeTotal,
    costeFinanciero,
    saldoMedio,
    tin: c.tin,
    tae,
    cuadro: opts?.incluirCuadro ? cuadro : undefined,
  };
}

/**
 * Calcula la cuota constante usando la fórmula de amortización francesa.
 *
 * Fórmula: cuota = P · i / (1 − (1 + i)^(−n))
 *
 * donde:
 * - P = importe (principal)
 * - i = tipo del periodo (tin / periodos por año)
 * - n = número de cuotas
 */
function calcularCuota(
  importe: number,
  numeroCuotas: number,
  tin: number,
  frecuencia: Condiciones['frecuencia']
): number {
  // Caso especial: TIN = 0 (sin intereses)
  if (tin === 0) {
    return importe / numeroCuotas;
  }

  const i = tipoDelPeriodo(tin, frecuencia);
  const cuota = (importe * i) / (1 - Math.pow(1 + i, -numeroCuotas));

  return cuota;
}

/**
 * Genera el cuadro completo de amortización.
 *
 * Usa las funciones del núcleo (§7.1) para encadenar los cálculos:
 * - Interés se calcula sobre el capital vivo
 * - Capital amortizado = cuota - interés
 * - Capital vivo baja en cada periodo
 *
 * La retroalimentación genera el comportamiento del sistema:
 * capital vivo baja → interés baja → (cuota constante) → más capital
 */
function generarCuadro(
  importeInicial: number,
  cuota: number,
  numeroCuotas: number,
  tin: number,
  frecuencia: Condiciones['frecuencia']
): FilaCuadro[] {
  const cuadro: FilaCuadro[] = [];
  const tipoPeriodo = tipoDelPeriodo(tin, frecuencia);
  let capitalPendiente = importeInicial;

  for (let i = 1; i <= numeroCuotas; i++) {
    // Calcular interés del periodo (sobre el capital vivo)
    const interes = calcularInteres(capitalPendiente, tipoPeriodo);

    // Calcular capital amortizado en este periodo
    const capital = calcularCapitalAmortizado(cuota, interes);

    // Reducir el capital vivo
    const nuevoCapitalPendiente = siguienteCapitalPendiente(
      capitalPendiente,
      capital
    );

    cuadro.push({
      numero: i,
      cuota,
      interes,
      capital,
      capitalPendiente: nuevoCapitalPendiente,
    });

    capitalPendiente = nuevoCapitalPendiente;
  }

  return cuadro;
}

/**
 * Calcula el saldo medio del préstamo.
 *
 * Es la media de los saldos vivos al INICIO de cada periodo.
 *
 * ⚠️ NO es importe/2: al final del último periodo todavía se debe una cuota de capital.
 *
 * Para TIN=0, un préstamo de 600€ en 10 cuotas:
 * - Inicio 1: 600€
 * - Inicio 2: 540€
 * - ...
 * - Inicio 10: 60€
 * Media = (600+540+...+60)/10 = 330€ (NO 300€)
 */
function calcularSaldoMedio(cuadro: FilaCuadro[]): number {
  // Saldo al inicio de cada periodo = capital pendiente ANTES de pagar esa cuota
  // Para la primera cuota, es el capital pendiente + lo que se va a amortizar
  // Para las demás, es el capitalPendiente de la cuota anterior

  let sumaSaldos = 0;

  for (let i = 0; i < cuadro.length; i++) {
    if (i === 0) {
      // Primera cuota: saldo al inicio = capital pendiente después + capital amortizado
      sumaSaldos += cuadro[i]!.capitalPendiente + cuadro[i]!.capital;
    } else {
      // Resto: saldo al inicio = capital pendiente de la cuota anterior
      sumaSaldos += cuadro[i - 1]!.capitalPendiente;
    }
  }

  return sumaSaldos / cuadro.length;
}

/**
 * Calcula el total de comisiones.
 */
function calcularTotalComisiones(comisiones: Comision[], importe: number): number {
  return comisiones.reduce((total, comision) => {
    let importeComision = 0;

    if (comision.importe !== undefined) {
      importeComision = comision.importe;
    }

    if (comision.porcentaje !== undefined) {
      importeComision += importe * comision.porcentaje;
    }

    return total + importeComision;
  }, 0);
}

/**
 * Calcula la TAE real usando búsqueda iterativa.
 *
 * La TAE real no se puede despejar algebraicamente cuando hay comisiones.
 * Se busca el tipo i que satisface:
 *
 * importeRecibido = Σ cuota / (1 + i)^t     para t = 1..n
 *
 * donde importeRecibido descuenta las comisiones de tipo 'descontadaDelImporte',
 * y las de tipo 'primeraCuota' se suman al flujo de la primera cuota.
 *
 * Después se anualiza: TAE = (1 + i)^periodosPorAño − 1
 *
 * Método: búsqueda binaria entre 0 y 0.5 (50% anual, más que suficiente)
 */
function calcularTAE(c: Condiciones): number {
  const totalComisiones = calcularTotalComisiones(c.comisiones, c.importe);

  // Caso especial: sin comisiones, la TAE es simplemente la tasa efectiva anual
  if (totalComisiones === 0) {
    const tipoPeriodo = tipoDelPeriodo(c.tin, c.frecuencia);
    const periodosAnio = periodosPorAnio(c.frecuencia);
    return Math.pow(1 + tipoPeriodo, periodosAnio) - 1;
  }

  // 1. Calcular importe efectivamente recibido
  const comisionesDescontadas = c.comisiones
    .filter((com) => com.momento === 'descontadaDelImporte')
    .reduce((total, com) => {
      let importe = 0;
      if (com.importe !== undefined) importe += com.importe;
      if (com.porcentaje !== undefined) importe += c.importe * com.porcentaje;
      return total + importe;
    }, 0);

  const importeRecibido = c.importe - comisionesDescontadas;

  // 2. Calcular cuota y comisiones en primera cuota
  const cuota = calcularCuota(c.importe, c.numeroCuotas, c.tin, c.frecuencia);

  const comisionesPrimeraCuota = c.comisiones
    .filter((com) => com.momento === 'primeraCuota')
    .reduce((total, com) => {
      let importe = 0;
      if (com.importe !== undefined) importe += com.importe;
      if (com.porcentaje !== undefined) importe += c.importe * com.porcentaje;
      return total + importe;
    }, 0);

  // 3. Búsqueda binaria del tipo del periodo que equilibra la ecuación
  const tipoPeriodo = buscarTipoPeriodoTAE(
    importeRecibido,
    cuota,
    comisionesPrimeraCuota,
    c.numeroCuotas
  );

  // 4. Anualizar: TAE = (1 + i)^periodosPorAño − 1
  const periodosAnio = periodosPorAnio(c.frecuencia);
  const tae = Math.pow(1 + tipoPeriodo, periodosAnio) - 1;

  return tae;
}

/**
 * Busca el tipo del periodo que equilibra la ecuación de la TAE.
 *
 * Ecuación a resolver:
 * importeRecibido = (cuota + comisionPrimeraCuota) / (1 + i) + Σ cuota / (1 + i)^t
 *
 * Búsqueda binaria entre 0 y 1.0 (100% por periodo es más que suficiente).
 */
function buscarTipoPeriodoTAE(
  importeRecibido: number,
  cuota: number,
  comisionPrimeraCuota: number,
  numeroCuotas: number
): number {
  const EPSILON = 1e-10; // Alta precisión
  const MAX_ITERACIONES = 200;

  let min = 0;
  let max = 1.0; // 100% por periodo

  for (let iter = 0; iter < MAX_ITERACIONES; iter++) {
    const i = (min + max) / 2;

    // Calcular el valor presente de todos los flujos
    let valorPresente = 0;

    // Todos los flujos (cuota + comisión en primera cuota)
    for (let t = 1; t <= numeroCuotas; t++) {
      const flujo = t === 1 ? cuota + comisionPrimeraCuota : cuota;
      valorPresente += flujo / Math.pow(1 + i, t);
    }

    // Diferencia con el importe recibido
    const diferencia = valorPresente - importeRecibido;

    if (Math.abs(diferencia) < EPSILON) {
      return i; // Convergió
    }

    // Ajustar búsqueda
    if (diferencia > 0) {
      // Valor presente muy alto → tipo muy bajo → subir mínimo
      min = i;
    } else {
      // Valor presente muy bajo → tipo muy alto → bajar máximo
      max = i;
    }
  }

  // Retornar el mejor valor encontrado
  return (min + max) / 2;
}
