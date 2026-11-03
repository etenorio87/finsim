import { describe, it, expect } from 'vitest';
import type { ComparacionFinanciaciones, Condiciones } from '@finsim/core';
import {
  OPCIONES_FRECUENCIA,
  TEXTO_PERIODO,
  duracionEnMeses,
  formatearDuracion,
  tituloComparacion,
  textoAvisoPlazos,
} from './textos';

const cond = (numeroCuotas: number, frecuencia: Condiciones['frecuencia'] = 'mensual'): Condiciones => ({
  importe: 10000,
  numeroCuotas,
  frecuencia,
  tin: 0.05,
  comisiones: [],
});

const comparacion = (parcial: Partial<ComparacionFinanciaciones>) =>
  ({ ganadora: 'b', criterio: 'tae', diferenciaTae: 0.01, avisoPlazosDistintos: false, ...parcial }) as ComparacionFinanciaciones;

describe('textos', () => {
  it('ofrece las tres frecuencias en orden', () => {
    expect(OPCIONES_FRECUENCIA.map((o) => o.valor)).toEqual(['mensual', 'trimestral', 'anual']);
  });

  it('el periodo depende de la frecuencia, no del número de cuotas', () => {
    expect(TEXTO_PERIODO.trimestral).toBe('trimestre');
    expect(TEXTO_PERIODO.anual).toBe('año');
  });

  it('issue #5: "Mejor oferta" solo cuando los plazos coinciden', () => {
    expect(tituloComparacion(comparacion({ avisoPlazosDistintos: false }))).toBe('🏆 Mejor oferta: B');
    expect(tituloComparacion(comparacion({ avisoPlazosDistintos: true }))).toBe('💰 Dinero más barato: B');
  });

});

describe('duración de un préstamo', () => {
  it('en meses según la frecuencia', () => {
    expect(duracionEnMeses(cond(24))).toBe(24);
    expect(duracionEnMeses(cond(8, 'trimestral'))).toBe(24);
    expect(duracionEnMeses(cond(5, 'anual'))).toBe(60);
  });

  it('formato legible con plurales', () => {
    expect(formatearDuracion(48)).toBe('4 años');
    expect(formatearDuracion(12)).toBe('1 año');
    expect(formatearDuracion(1)).toBe('1 mes');
    expect(formatearDuracion(6)).toBe('6 meses');
    expect(formatearDuracion(18)).toBe('1 año y 6 meses');
  });
});

describe('aviso de plazos distintos', () => {
  const aviso = (ganadora: 'a' | 'b') => comparacion({ ganadora, avisoPlazosDistintos: true });

  it('issue #5: la más barata tiene el plazo más largo → texto del issue con la diferencia', () => {
    // Caso reproducido en #5: A 12 cuotas, B 60 cuotas, gana B por TAE
    expect(textoAvisoPlazos(aviso('b'), cond(12), cond(60))).toBe(
      'Son decisiones distintas: B es dinero más barato, pero estarás endeudado 4 años más. ' +
        'Depende de qué hagas con la liquidez que liberas.',
    );
  });

  it('la más barata tiene el plazo más corto → además terminas antes', () => {
    expect(textoAvisoPlazos(aviso('a'), cond(12), cond(60))).toBe(
      'A es dinero más barato y además terminas 4 años antes.',
    );
    expect(textoAvisoPlazos(aviso('b'), cond(30), cond(24))).toBe(
      'B es dinero más barato y además terminas 6 meses antes.',
    );
  });

  it('distinto número de cuotas pero misma duración → solo cambia la frecuencia', () => {
    expect(textoAvisoPlazos(aviso('a'), cond(24), cond(8, 'trimestral'))).toBe(
      'A es dinero más barato. Las dos duran lo mismo (2 años); solo cambia la frecuencia de pago.',
    );
  });
});
