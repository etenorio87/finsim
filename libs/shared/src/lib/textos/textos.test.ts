import { describe, it, expect } from 'vitest';
import type { ComparacionFinanciaciones } from '@finsim/core';
import {
  OPCIONES_FRECUENCIA,
  TEXTO_PERIODO,
  tituloComparacion,
  textoAvisoPlazos,
} from './textos';

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

  it('el aviso de plazos nombra a la ganadora', () => {
    expect(textoAvisoPlazos(comparacion({ ganadora: 'a', avisoPlazosDistintos: true }))).toContain('la oferta A es dinero más barato');
  });
});
