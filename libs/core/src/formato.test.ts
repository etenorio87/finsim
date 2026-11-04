/**
 * Tests de formato y parseo — compartidos por todas las interfaces (web y móvil)
 */

import { describe, it, expect } from 'vitest';
import {
  normalizarDecimal,
  parseDecimal,
  formatearMoneda,
  formatearPorcentaje,
  formatearNumero,
  formatearFecha,
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

  it('separador de miles: con punto y coma, el último es el decimal', () => {
    expect(parseDecimal('1.234,56')).toBe(1234.56);
    expect(parseDecimal('1,234.56')).toBe(1234.56);
    expect(parseDecimal('12.345.678,9')).toBe(12345678.9);
  });

  it('separador de miles: un separador repetido son miles', () => {
    expect(parseDecimal('1.234.567')).toBe(1234567);
    expect(parseDecimal('1,234,567')).toBe(1234567);
  });

  it('acepta el texto que muestra el campo al salir ("10.000,00")', () => {
    expect(parseDecimal('10.000,00')).toBe(10000);
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

describe('formato sin Intl (NativeScript)', () => {
  const intl = (valor: number, decimales: number) =>
    valor.toLocaleString('es-ES', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

  it('da el mismo texto que Intl es-ES', () => {
    const valores = [
      0, 1, 5.925, 9999.995, 10000, 12345.6, 1234.567, 0.005, 0.015, 1.005, 2.675, 99999.999,
      443.2061025275781, 1_000_000, 123_456_789.126, -1, -1234.5, -12345.678, -0.5,
    ];
    // Valores pseudoaleatorios reproducibles de varias magnitudes
    let semilla = 42;
    const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 5000; i++) valores.push((azar() - 0.2) * 10 ** Math.floor(azar() * 9));

    for (const v of valores) {
      for (const d of [0, 2]) {
        const esperado = intl(v, d);
        if (/^-0(,0+)?$/.test(esperado)) continue; // ver el test de "-0,00"
        expect(formatearNumero(v, d), `${v} con ${d} decimales`).toBe(esperado);
      }
    }
  });

  it('agrupa miles solo a partir de 5 cifras (como es-ES)', () => {
    expect(formatearMoneda(1234.5)).toBe('1234,50');
    expect(formatearMoneda(12345)).toBe('12.345,00');
    expect(formatearMoneda(1234567.891)).toBe('1.234.567,89');
  });

  it('no muestra "-0,00" para negativos que se redondean a cero', () => {
    expect(formatearMoneda(-0.001)).toBe('0,00');
    expect(formatearMoneda(-0)).toBe('0,00');
  });

  it('formatea fechas como es-ES corto', () => {
    expect(formatearFecha(new Date(2026, 10, 4))).toBe('4/11/2026');
    expect(formatearFecha(new Date(2026, 0, 31))).toBe(new Date(2026, 0, 31).toLocaleDateString('es-ES'));
  });
});
