import { describe, it, expect } from 'vitest';
import { MonedaPipe, PorcentajePipe } from './pipes';

describe('pipes', () => {
  it('moneda', () => {
    expect(new MonedaPipe().transform(443.2128)).toBe('443,21 €');
    expect(new MonedaPipe().transform(10636.95)).toBe('10.636,95 €');
    expect(new MonedaPipe().transform(null)).toBe('');
  });

  it('porcentaje', () => {
    expect(new PorcentajePipe().transform(0.0617)).toBe('6,17 %');
    expect(new PorcentajePipe().transform(undefined)).toBe('');
  });
});
