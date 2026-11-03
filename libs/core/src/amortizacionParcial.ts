/**
 * Lógica de amortización parcial
 *
 * Implementa el cálculo de amortización parcial con estrategias:
 * - reducirCuota: Mantiene el plazo, reduce la cuota mensual
 * - reducirPlazo: Mantiene la cuota, reduce el número de cuotas
 */

import type {
  ParametrosAmortizacionParcial,
  ResultadoAmortizacionParcial,
  Condiciones,
  Resultado,
  Frecuencia,
} from './types';
import { calcular } from './motor';
import { tipoDelPeriodo } from './amortizacion';

/**
 * Simula una amortización parcial
 */
export function simularAmortizacionParcial(
  params: ParametrosAmortizacionParcial
): ResultadoAmortizacionParcial {
  const { condicionesOriginales, capitalAmortizado, cuotaAmortizacion, estrategia } = params;

  // 1. Calcular escenario original completo
  const escenarioOriginal = calcular(condicionesOriginales, { incluirCuadro: true });

  // 2. Obtener capital pendiente en la cuota de amortización
  const filaAmortizacion = escenarioOriginal.cuadro![cuotaAmortizacion - 1]!;
  const capitalPendiente = filaAmortizacion.capitalPendiente;

  // 3. Calcular nuevo capital pendiente
  const nuevoCapitalPendiente = capitalPendiente - capitalAmortizado;

  // 4. Calcular cuotas restantes (desde la cuota de amortización hasta el final)
  const cuotasRestantes = condicionesOriginales.numeroCuotas - cuotaAmortizacion;

  // 5. Calcular "escenario original restante" (sin amortizar)
  // Esto representa seguir pagando las cuotas restantes sin amortizar
  const condicionesOriginalesRestantes: Condiciones = {
    importe: capitalPendiente,
    numeroCuotas: cuotasRestantes,
    frecuencia: condicionesOriginales.frecuencia,
    tin: condicionesOriginales.tin,
    comisiones: [], // Ya se pagaron en las cuotas anteriores
  };
  const escenarioOriginalRestante = calcular(condicionesOriginalesRestantes, { incluirCuadro: true });

  // 6. Calcular nuevas condiciones según estrategia
  let condicionesNuevas: Condiciones;

  if (estrategia === 'reducirCuota') {
    condicionesNuevas = calcularReducirCuota(
      nuevoCapitalPendiente,
      cuotasRestantes,
      condicionesOriginales.tin,
      condicionesOriginales.frecuencia
    );
  } else {
    // Para reducirPlazo, usar la cuota del escenario original COMPLETO
    // porque queremos mantener la misma cuota mensual que pagábamos
    condicionesNuevas = calcularReducirPlazo(
      nuevoCapitalPendiente,
      escenarioOriginal.cuota,
      condicionesOriginales.tin,
      condicionesOriginales.frecuencia
    );
  }

  // 7. Calcular escenario nuevo
  // Caso especial: si no quedan cuotas (amortización total), crear resultado vacío
  let escenarioNuevo: Resultado;
  if (condicionesNuevas.numeroCuotas === 0) {
    escenarioNuevo = {
      cuota: 0,
      costeTotal: 0,
      costeFinanciero: 0,
      saldoMedio: 0,
      tin: condicionesNuevas.tin,
      tae: 0,
      cuadro: [],
    };
  } else {
    escenarioNuevo = calcular(condicionesNuevas, { incluirCuadro: true });
  }

  // 8. Calcular métricas de ahorro
  const ahorro = calcularAhorro(
    escenarioOriginalRestante,
    escenarioNuevo,
    estrategia,
    condicionesOriginalesRestantes,
    condicionesNuevas
  );

  return {
    escenarioOriginal,
    escenarioNuevo,
    condicionesNuevas,
    ahorro,
    capitalAmortizado,
    cuotaAmortizacion,
    estrategia,
  };
}

/**
 * Calcula el nuevo escenario con estrategia REDUCIR CUOTA
 *
 * Mantiene el número de cuotas restantes y recalcula la cuota con el nuevo capital
 */
function calcularReducirCuota(
  nuevoCapitalPendiente: number,
  cuotasRestantes: number,
  tin: number,
  frecuencia: Frecuencia
): Condiciones {
  return {
    importe: nuevoCapitalPendiente,
    numeroCuotas: cuotasRestantes,
    frecuencia,
    tin,
    comisiones: [], // No hay comisiones adicionales
  };
}

/**
 * Calcula el nuevo escenario con estrategia REDUCIR PLAZO
 *
 * Usa búsqueda binaria para encontrar el nuevo número de cuotas
 * manteniendo la cuota original
 */
function calcularReducirPlazo(
  nuevoCapitalPendiente: number,
  cuotaOriginal: number,
  tin: number,
  frecuencia: Frecuencia
): Condiciones {
  // Edge case: si el capital es 0 o negativo, no hay más cuotas
  if (nuevoCapitalPendiente <= 0) {
    return {
      importe: 0,
      numeroCuotas: 0,
      frecuencia,
      tin,
      comisiones: [],
    };
  }

  // Buscar el número de cuotas usando búsqueda binaria
  const numeroCuotas = buscarNumeroCuotas(
    nuevoCapitalPendiente,
    cuotaOriginal,
    tin,
    frecuencia
  );

  return {
    importe: nuevoCapitalPendiente,
    numeroCuotas,
    frecuencia,
    tin,
    comisiones: [],
  };
}

/**
 * Busca el número de cuotas necesario para amortizar el capital
 * con la cuota dada, usando la fórmula matemática directa
 */
function buscarNumeroCuotas(
  capital: number,
  cuota: number,
  tin: number,
  frecuencia: Frecuencia
): number {
  // Caso especial: TIN = 0
  if (tin === 0) {
    return Math.ceil(capital / cuota);
  }

  const tipoPeriodo = tipoDelPeriodo(tin, frecuencia);

  // Fórmula para calcular número de cuotas:
  // n = -log(1 - (P * i / cuota)) / log(1 + i)
  //
  // Derivada de la fórmula de amortización francesa:
  // P = cuota * (1 - (1 + i)^(-n)) / i

  const ratio = (capital * tipoPeriodo) / cuota;

  // Caso especial: si ratio >= 1, la cuota no es suficiente para pagar ni los intereses
  if (ratio >= 1) {
    // Retornar un número muy alto de cuotas
    return 999;
  }

  const numeroCuotasExacto = -Math.log(1 - ratio) / Math.log(1 + tipoPeriodo);

  // Probar con floor y ceil para ver cuál da la cuota más cercana a la deseada
  const nFloor = Math.floor(numeroCuotasExacto);
  const nCeil = Math.ceil(numeroCuotasExacto);

  // Calcular cuotas con ambas opciones
  const cuotaConFloor = calcularCuotaParaNCuotas(capital, nFloor, tipoPeriodo);
  const cuotaConCeil = calcularCuotaParaNCuotas(capital, nCeil, tipoPeriodo);

  // Elegir la que da cuota más cercana a la deseada
  const diffFloor = Math.abs(cuotaConFloor - cuota);
  const diffCeil = Math.abs(cuotaConCeil - cuota);

  return diffFloor < diffCeil ? nFloor : nCeil;
}

/**
 * Calcula la cuota necesaria para amortizar un capital en n cuotas
 */
function calcularCuotaParaNCuotas(
  capital: number,
  numeroCuotas: number,
  tipoPeriodo: number
): number {
  // Fórmula de amortización francesa:
  // cuota = P * i / (1 - (1 + i)^(-n))

  if (numeroCuotas === 0) {
    return 0;
  }

  if (tipoPeriodo === 0) {
    return capital / numeroCuotas;
  }

  return (capital * tipoPeriodo) / (1 - Math.pow(1 + tipoPeriodo, -numeroCuotas));
}

/**
 * Calcula las métricas de ahorro
 */
function calcularAhorro(
  original: Resultado,
  nuevo: Resultado,
  estrategia: 'reducirCuota' | 'reducirPlazo',
  condicionesOriginales: Condiciones,
  condicionesNuevas: Condiciones
): ResultadoAmortizacionParcial['ahorro'] {
  // Calcular cuotas que quedaban en el escenario original
  const cuotasOriginalesRestantes = condicionesOriginales.numeroCuotas;

  // Ahorro en intereses: comparar solo las cuotas restantes
  // En el escenario original, calcular el coste financiero desde la cuota de amortización
  const costeFinancieroOriginalRestante = original.costeFinanciero;
  const costeFinancieroNuevo = nuevo.costeFinanciero;

  const ahorroIntereses = costeFinancieroOriginalRestante - costeFinancieroNuevo;

  // Ahorro en coste total
  const costeTotalOriginalRestante = original.costeTotal;
  const costeTotalNuevo = nuevo.costeTotal;
  const ahorroCosteTotal = costeTotalOriginalRestante - costeTotalNuevo;

  // Diferencia de TAE
  const diferenciaAhorroTAE = original.tae - nuevo.tae;

  // Métricas específicas de la estrategia
  let cuotasEliminadas: number | undefined;
  let reduccionCuota: number | undefined;

  if (estrategia === 'reducirPlazo') {
    cuotasEliminadas = cuotasOriginalesRestantes - condicionesNuevas.numeroCuotas;
  } else {
    reduccionCuota = original.cuota - nuevo.cuota;
  }

  return {
    intereses: ahorroIntereses,
    costeTotal: ahorroCosteTotal,
    diferenciaAhorroTAE,
    cuotasEliminadas,
    reduccionCuota,
  };
}
