/**
 * Tests de los comparadores
 *
 * Validan las dos funciones de comparación:
 * - compararFinanciaciones: ¿cuál de estas dos ofertas es mejor?
 * - compararConContado: ¿financiar o pagar al contado?
 */

import { describe, it, expect } from 'vitest';
import type { Condiciones } from './types';
import { compararFinanciaciones, compararConContado } from './comparadores';

describe('compararFinanciaciones', () => {
  it('Elige la financiación con menor TAE', () => {
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
      tin: 0.08, // Peor
      comisiones: [],
    };

    const comparacion = compararFinanciaciones(financiacionA, financiacionB);

    expect(comparacion.ganadora).toBe('a');
    expect(comparacion.criterio).toBe('tae');
    expect(comparacion.diferenciaTae).toBeGreaterThan(0);
  });

  it('Incluye los resultados detallados de ambas financiaciones', () => {
    const financiacionA: Condiciones = {
      importe: 5000,
      numeroCuotas: 12,
      frecuencia: 'mensual',
      tin: 0.05,
      comisiones: [],
    };

    const financiacionB: Condiciones = {
      importe: 5000,
      numeroCuotas: 12,
      frecuencia: 'mensual',
      tin: 0.07,
      comisiones: [],
    };

    const comparacion = compararFinanciaciones(financiacionA, financiacionB);

    expect(comparacion.detalle.a).toBeDefined();
    expect(comparacion.detalle.b).toBeDefined();
    expect(comparacion.detalle.a.tae).toBeDefined();
    expect(comparacion.detalle.b.tae).toBeDefined();
  });

  it('Activa aviso cuando los plazos difieren', () => {
    const financiacionA: Condiciones = {
      importe: 10000,
      numeroCuotas: 24,
      frecuencia: 'mensual',
      tin: 0.06,
      comisiones: [],
    };

    const financiacionB: Condiciones = {
      importe: 10000,
      numeroCuotas: 60, // Plazo diferente
      frecuencia: 'mensual',
      tin: 0.06,
      comisiones: [],
    };

    const comparacion = compararFinanciaciones(financiacionA, financiacionB);

    expect(comparacion.avisoPlazosDistintos).toBe(true);
  });

  it('Compara correctamente con comisiones', () => {
    // Financiación A: TIN bajo pero con comisión alta
    const financiacionA: Condiciones = {
      importe: 1000,
      numeroCuotas: 12,
      frecuencia: 'mensual',
      tin: 0.02,
      comisiones: [
        {
          descripcion: 'Comisión alta',
          importe: 100,
          momento: 'primeraCuota',
        },
      ],
    };

    // Financiación B: TIN más alto pero sin comisiones
    const financiacionB: Condiciones = {
      importe: 1000,
      numeroCuotas: 12,
      frecuencia: 'mensual',
      tin: 0.05,
      comisiones: [],
    };

    const comparacion = compararFinanciaciones(financiacionA, financiacionB);

    // La TAE real debe reflejar la comisión, no solo el TIN
    expect(comparacion.detalle.a.tae).toBeGreaterThan(financiacionA.tin);
  });
});

describe('compararConContado', () => {
  it('Recomienda financiar cuando TAE < rentabilidad neta', () => {
    const financiacion: Condiciones = {
      importe: 10000,
      numeroCuotas: 24,
      frecuencia: 'mensual',
      tin: 0.04, // 4% TAE
      comisiones: [],
    };

    const rentabilidadBruta = 0.10; // 10% bruto
    const tipoImpositivo = 0.19; // 19%
    // rentabilidadNeta = 0.10 * (1 - 0.19) = 0.081 = 8.1%

    const comparacion = compararConContado(
      financiacion,
      rentabilidadBruta,
      tipoImpositivo
    );

    // 4% TAE < 8.1% neto → conviene financiar
    expect(comparacion.recomendacion).toBe('financiar');
    expect(comparacion.rentabilidadNeta).toBeCloseTo(0.081, 3);
    expect(comparacion.diferenciaTipos).toBeGreaterThan(0);
  });

  it('Recomienda pagar al contado cuando TAE > rentabilidad neta', () => {
    const financiacion: Condiciones = {
      importe: 10000,
      numeroCuotas: 24,
      frecuencia: 'mensual',
      tin: 0.12, // 12% TAE
      comisiones: [],
    };

    const rentabilidadBruta = 0.05; // 5% bruto
    const tipoImpositivo = 0.19; // 19%
    // rentabilidadNeta = 0.05 * (1 - 0.19) = 0.0405 = 4.05%

    const comparacion = compararConContado(
      financiacion,
      rentabilidadBruta,
      tipoImpositivo
    );

    // 12% TAE > 4.05% neto → conviene pagar al contado
    expect(comparacion.recomendacion).toBe('pagarAlContado');
    expect(comparacion.diferenciaTipos).toBeLessThan(0);
  });

  it('Calcula la rentabilidad neta correctamente', () => {
    const financiacion: Condiciones = {
      importe: 5000,
      numeroCuotas: 12,
      frecuencia: 'mensual',
      tin: 0.06,
      comisiones: [],
    };

    const rentabilidadBruta = 0.08;
    const tipoImpositivo = 0.21;

    const comparacion = compararConContado(
      financiacion,
      rentabilidadBruta,
      tipoImpositivo
    );

    // rentabilidadNeta = 0.08 * (1 - 0.21) = 0.0632
    expect(comparacion.rentabilidadNeta).toBeCloseTo(0.0632, 4);
  });

  it('Incluye información de coste estimado', () => {
    const financiacion: Condiciones = {
      importe: 10000,
      numeroCuotas: 24,
      frecuencia: 'mensual',
      tin: 0.08,
      comisiones: [],
    };

    const comparacion = compararConContado(financiacion, 0.05, 0.19);

    // Debe incluir un coste estimado en euros
    expect(comparacion.costeEstimadoEuros).toBeDefined();
    expect(comparacion.costeEstimadoEuros).toBeGreaterThan(0);
  });

  it('Incluye la TAE real de la financiación', () => {
    const financiacion: Condiciones = {
      importe: 1000,
      numeroCuotas: 12,
      frecuencia: 'mensual',
      tin: 0,
      comisiones: [
        {
          descripcion: 'Comisión',
          importe: 50,
          momento: 'primeraCuota',
        },
      ],
    };

    const comparacion = compararConContado(financiacion, 0.05, 0.19);

    // La TAE debe reflejar la comisión, no ser 0
    expect(comparacion.taeFinanciacion).toBeGreaterThan(0);
  });
});
