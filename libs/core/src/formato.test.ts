/**
 * Tests de formato y parseo — compartidos por todas las interfaces (web y móvil)
 */

import { describe, it, expect } from 'vitest';
import {
  normalizarDecimal,
  parseDecimal,
  formatearMoneda,
  formatearPorcentaje,
} from './formato';

describe('normalizarDecimal', () => {
  it('convierte la coma decimal en punto', () => {
    expect(normalizarDecimal('14,95')).toBe('14.95');
  });

  it('deja intacto un valor con punto', () => {
    expect(normalizarDecimal('9854.64')).toBe('9854.64');
  });
});

describe('parseDecimal', () => {
  it('regresión #1: "14,95" → 14.95 (TIN con decimales y dos cifras)', () => {
    expect(parseDecimal('14,95')).toBe(14.95);
  });

  it('regresión #2: "9854.64" → 9854.64 (importe con punto decimal)', () => {
    expect(parseDecimal('9854.64')).toBe(9854.64);
  });

  it('acepta enteros', () => {
    expect(parseDecimal('600')).toBe(600);
  });

  it('devuelve 0 si el texto no es numérico', () => {
    expect(parseDecimal('')).toBe(0);
    expect(parseDecimal('abc')).toBe(0);
  });
});

describe('formatearMoneda', () => {
  it('usa formato es-ES con dos decimales', () => {
    expect(formatearMoneda(9854.64)).toBe('9854,64');
    expect(formatearMoneda(12345.6)).toBe('12.345,60');
  });
});

describe('formatearPorcentaje', () => {
  it('convierte el decimal del dominio a porcentaje es-ES', () => {
    expect(formatearPorcentaje(0.1495)).toBe('14,95');
    expect(formatearPorcentaje(0.0686)).toBe('6,86');
  });
});
