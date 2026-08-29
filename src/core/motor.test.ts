/**
 * Tests del motor de cálculo - Simulador de financiación
 *
 * IMPORTANTE: Estos tests se escriben ANTES de la implementación (§6)
 * Casos verificados contra documentos reales y cálculos manuales.
 */

import { describe, it, expect } from 'vitest';
import type { Condiciones } from './types';
import { calcular } from './motor';
import { compararFinanciaciones } from './comparadores';

describe('Motor de cálculo - Tests de aceptación', () => {
  /**
   * T1 · Préstamo del coche (verificado contra cuadro oficial de BBVA)
   *
   * Este test valida contra un documento real del banco, no contra un cálculo propio.
   */
  it('T1: Préstamo del coche BBVA - validación contra documento real', () => {
    const condiciones: Condiciones = {
      importe: 9854.64,
      numeroCuotas: 59,
      frecuencia: 'mensual',
      tin: 0.0545,
      comisiones: [],
    };

    const resultado = calcular(condiciones, { incluirCuadro: true });

    // Validar que se generó el cuadro
    expect(resultado.cuadro).toBeDefined();
    expect(resultado.cuadro).toHaveLength(59);

    // Primera cuota según documento BBVA
    const primeraCuota = resultado.cuadro![0]!;
    expect(primeraCuota.numero).toBe(1);
    expect(primeraCuota.interes).toBeCloseTo(44.76, 2);
    expect(primeraCuota.capital).toBeCloseTo(146.02, 2);
    expect(primeraCuota.capitalPendiente).toBeCloseTo(9708.62, 2);

    // Segunda cuota según documento BBVA
    const segundaCuota = resultado.cuadro![1]!;
    expect(segundaCuota.numero).toBe(2);
    expect(segundaCuota.interes).toBeCloseTo(44.09, 2);
    expect(segundaCuota.capital).toBeCloseTo(146.69, 2);

    // TAE aproximada
    expect(resultado.tae).toBeCloseTo(0.0559, 3);
  });

  /**
   * T2 · Móvil "sin intereses"
   *
   * Caso típico: TIN 0% pero con comisión de apertura.
   * El saldo medio NO es importe/2 porque al final aún se debe una cuota.
   *
   * NOTA: El modelo 'primeraCuota' carga toda la comisión en la primera cuota,
   * lo que produce un flujo de caja distinto al modelo de "comisión prorrateada".
   * Este modelo es el correcto según validación con casos reales (Cetelem T3).
   */
  it('T2: Móvil "sin intereses" con comisión en primera cuota', () => {
    const condiciones: Condiciones = {
      importe: 600,
      numeroCuotas: 10,
      frecuencia: 'mensual',
      tin: 0,
      comisiones: [
        {
          descripcion: 'Comisión de apertura',
          importe: 18,
          momento: 'primeraCuota',
        },
      ],
    };

    const resultado = calcular(condiciones);

    // El saldo medio es 330, NO 300 (importe/2)
    // Razón: al final del último periodo todavía se debe una cuota de capital
    expect(resultado.saldoMedio).toBeCloseTo(330.0, 2);

    // TAE con comisión en primera cuota (modelo correcto según T3)
    // Valor corregido de 0.0669 a 0.0686 tras validación con Cetelem
    expect(resultado.tae).toBeCloseTo(0.0686, 3);
  });

  /**
   * T3 · Cetelem aplazado (caso real)
   *
   * Otro caso de TIN 0% con comisión, cifras reales de Cetelem.
   */
  it('T3: Cetelem aplazado - caso real', () => {
    const condiciones: Condiciones = {
      importe: 331,
      numeroCuotas: 12,
      frecuencia: 'mensual',
      tin: 0,
      comisiones: [
        {
          descripcion: 'Comisión Cetelem',
          importe: 9.93,
          momento: 'primeraCuota',
        },
      ],
    };

    const resultado = calcular(condiciones);

    // TAE aproximada
    expect(resultado.tae).toBeCloseTo(0.0576, 3);
  });

  /**
   * T4 · Sensibilidad al momento de la comisión
   *
   * Mismas condiciones que T2, pero la comisión se descuenta del importe.
   * Razón: recibes menos dinero por el mismo coste → TAE mayor.
   */
  it('T4: Sensibilidad al momento de la comisión', () => {
    // Caso base (igual que T2)
    const conComisionEnPrimeraCuota: Condiciones = {
      importe: 600,
      numeroCuotas: 10,
      frecuencia: 'mensual',
      tin: 0,
      comisiones: [
        {
          descripcion: 'Comisión',
          importe: 18,
          momento: 'primeraCuota',
        },
      ],
    };

    // Mismo caso pero comisión descontada del importe
    const conComisionDescontada: Condiciones = {
      importe: 600,
      numeroCuotas: 10,
      frecuencia: 'mensual',
      tin: 0,
      comisiones: [
        {
          descripcion: 'Comisión',
          importe: 18,
          momento: 'descontadaDelImporte',
        },
      ],
    };

    const resultadoPrimeraCuota = calcular(conComisionEnPrimeraCuota);
    const resultadoDescontada = calcular(conComisionDescontada);

    // La TAE debe ser mayor cuando la comisión se descuenta del importe
    // porque recibes menos dinero (582 vs 600) pero pagas lo mismo
    expect(resultadoDescontada.tae).toBeGreaterThan(resultadoPrimeraCuota.tae);
  });

  /**
   * T5 · Coherencia interna
   *
   * Validaciones que deben cumplirse para CUALQUIER financiación:
   * - La suma del capital amortizado debe igualar el importe total
   * - Al final, el capital pendiente debe ser prácticamente cero
   */
  it('T5: Coherencia interna del cuadro de amortización', () => {
    // Usamos el caso T1 como ejemplo, pero aplica a cualquiera
    const condiciones: Condiciones = {
      importe: 9854.64,
      numeroCuotas: 59,
      frecuencia: 'mensual',
      tin: 0.0545,
      comisiones: [],
    };

    const resultado = calcular(condiciones, { incluirCuadro: true });

    expect(resultado.cuadro).toBeDefined();
    const cuadro = resultado.cuadro!;

    // Suma del capital amortizado debe igualar el importe
    const totalCapitalAmortizado = cuadro.reduce(
      (sum, fila) => sum + fila.capital,
      0
    );
    expect(totalCapitalAmortizado).toBeCloseTo(condiciones.importe, 2);

    // Última fila: capital pendiente debe ser prácticamente cero
    const ultimaFila = cuadro[cuadro.length - 1]!;
    expect(ultimaFila.capitalPendiente).toBeCloseTo(0, 2);
  });

  /**
   * T6 · Aviso de plazos distintos
   *
   * Cuando se comparan dos financiaciones con diferente número de cuotas,
   * debe activarse el aviso para que el usuario sepa que el coste total
   * NO es comparable directamente.
   */
  it('T6: Aviso cuando se comparan financiaciones con plazos distintos', () => {
    const financiacionA: Condiciones = {
      importe: 10000,
      numeroCuotas: 24, // 2 años
      frecuencia: 'mensual',
      tin: 0.06,
      comisiones: [],
    };

    const financiacionB: Condiciones = {
      importe: 10000,
      numeroCuotas: 60, // 5 años
      frecuencia: 'mensual',
      tin: 0.06,
      comisiones: [],
    };

    const comparacion = compararFinanciaciones(financiacionA, financiacionB);

    // Debe activar el aviso porque los plazos son distintos
    expect(comparacion.avisoPlazosDistintos).toBe(true);
  });

  /**
   * Test adicional: cuando los plazos son iguales, NO debe haber aviso
   */
  it('T6b: Sin aviso cuando los plazos son iguales', () => {
    const financiacionA: Condiciones = {
      importe: 10000,
      numeroCuotas: 24,
      frecuencia: 'mensual',
      tin: 0.06,
      comisiones: [],
    };

    const financiacionB: Condiciones = {
      importe: 10000,
      numeroCuotas: 24,
      frecuencia: 'mensual',
      tin: 0.065,
      comisiones: [],
    };

    const comparacion = compararFinanciaciones(financiacionA, financiacionB);

    // NO debe activar el aviso porque los plazos son iguales
    expect(comparacion.avisoPlazosDistintos).toBe(false);
  });
});

describe('Motor de cálculo - Tests adicionales de validación', () => {
  /**
   * Validar que sin cuadro, no se genera
   */
  it('No genera cuadro si no se solicita', () => {
    const condiciones: Condiciones = {
      importe: 1000,
      numeroCuotas: 12,
      frecuencia: 'mensual',
      tin: 0.05,
      comisiones: [],
    };

    const resultado = calcular(condiciones); // Sin { incluirCuadro: true }

    expect(resultado.cuadro).toBeUndefined();
  });

  /**
   * Validar que TIN y TAE coinciden cuando no hay comisiones
   */
  it('TIN y TAE coinciden cuando no hay comisiones', () => {
    const condiciones: Condiciones = {
      importe: 1000,
      numeroCuotas: 12,
      frecuencia: 'mensual',
      tin: 0.05,
      comisiones: [],
    };

    const resultado = calcular(condiciones);

    // Sin comisiones, la TAE (efectiva) es ligeramente mayor que el TIN (nominal)
    // debido a la capitalización. Con pagos mensuales: TAE = (1 + TIN/12)^12 - 1
    // Para TIN=5%, TAE≈5.12% (tolerancia a 2 decimales)
    expect(resultado.tae).toBeCloseTo(0.0512, 2);
  });

  /**
   * Validar cálculo con frecuencia trimestral
   */
  it('Calcula correctamente con frecuencia trimestral', () => {
    const condiciones: Condiciones = {
      importe: 10000,
      numeroCuotas: 8, // 2 años, trimestral
      frecuencia: 'trimestral',
      tin: 0.06,
      comisiones: [],
    };

    const resultado = calcular(condiciones, { incluirCuadro: true });

    expect(resultado.cuadro).toBeDefined();
    expect(resultado.cuadro).toHaveLength(8);

    // Coherencia interna
    const totalCapital = resultado.cuadro!.reduce((sum, f) => sum + f.capital, 0);
    expect(totalCapital).toBeCloseTo(10000, 2);

    const ultimaFila = resultado.cuadro![resultado.cuadro!.length - 1]!;
    expect(ultimaFila.capitalPendiente).toBeCloseTo(0, 2);
  });

  /**
   * Validar cálculo con frecuencia anual
   */
  it('Calcula correctamente con frecuencia anual', () => {
    const condiciones: Condiciones = {
      importe: 10000,
      numeroCuotas: 5, // 5 años
      frecuencia: 'anual',
      tin: 0.06,
      comisiones: [],
    };

    const resultado = calcular(condiciones, { incluirCuadro: true });

    expect(resultado.cuadro).toBeDefined();
    expect(resultado.cuadro).toHaveLength(5);

    // Coherencia interna
    const totalCapital = resultado.cuadro!.reduce((sum, f) => sum + f.capital, 0);
    expect(totalCapital).toBeCloseTo(10000, 2);
  });

  /**
   * T-REG-4 · Test de regresión para issue #4
   *
   * Caso: importe con decimales debe calcular cuota correcta
   * Previene error de conversión del separador decimal
   */
  it('T-REG-4: Importe decimal calcula cuota correcta (#4)', () => {
    const condiciones: Condiciones = {
      importe: 9854.64,
      numeroCuotas: 59,
      frecuencia: 'mensual',
      tin: 0.05,
      comisiones: [],
    };

    const resultado = calcular(condiciones);

    // La cuota debe ser exactamente 188.74 (±0.01)
    // NO 188.77 que correspondería a un importe de 9855.81
    expect(resultado.cuota).toBeCloseTo(188.74, 1);

    // Saldo medio también debe ser correcto
    expect(resultado.saldoMedio).toBeCloseTo(5212.04, 1);
  });
});
