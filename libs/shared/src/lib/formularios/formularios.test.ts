import { describe, it, expect } from 'vitest';
import { calcular } from '@finsim/core';
import {
  anadirComision,
  condicionesDesdeFormulario,
  crearCondicionesForm,
  crearInversionForm,
  eliminarComision,
} from './condiciones.form';
import { crearAmortizacionParcialForm } from './amortizacion-parcial.form';
import { mensajeError } from './validadores';
import { CONDICIONES_SIMULADOR, INVERSION_INICIAL } from '../valores-iniciales';

describe('formulario de condiciones', () => {
  it('ida y vuelta: condiciones → formulario → condiciones', () => {
    const condiciones = {
      ...CONDICIONES_SIMULADOR,
      comisiones: [{ descripcion: 'Apertura', importe: 18, momento: 'primeraCuota' as const }],
    };
    expect(condicionesDesdeFormulario(crearCondicionesForm(condiciones))).toEqual(condiciones);
  });

  it('añade comisiones con los valores por defecto de la v1 y las elimina', () => {
    const form = crearCondicionesForm(CONDICIONES_SIMULADOR);
    anadirComision(form);
    expect(condicionesDesdeFormulario(form).comisiones).toEqual([
      { descripcion: 'Comisión', importe: 0, momento: 'primeraCuota' },
    ]);
    eliminarComision(form, 0);
    expect(form.controls.comisiones.length).toBe(0);
  });

  it('rechaza importe 0, cuotas no enteras o < 1 y TIN negativo', () => {
    const form = crearCondicionesForm(CONDICIONES_SIMULADOR);
    expect(form.valid).toBe(true);

    form.controls.importe.setValue(0);
    expect(mensajeError(form.controls.importe.errors)).toBe('Debe ser mayor que 0');

    form.controls.numeroCuotas.setValue(0);
    expect(form.controls.numeroCuotas.invalid).toBe(true);
    form.controls.numeroCuotas.setValue(12.5);
    expect(mensajeError(form.controls.numeroCuotas.errors)).toBe('Debe ser un número entero');

    form.controls.tin.setValue(-0.01);
    expect(form.controls.tin.invalid).toBe(true);
  });

  it('acepta TIN 0 ("sin intereses")', () => {
    const form = crearCondicionesForm({ ...CONDICIONES_SIMULADOR, tin: 0 });
    expect(form.valid).toBe(true);
  });
});

describe('formulario de inversión', () => {
  it('tipo impositivo entre 0 y 1 (decimal)', () => {
    const form = crearInversionForm(INVERSION_INICIAL);
    expect(form.valid).toBe(true);
    form.controls.tipoImpositivo.setValue(1.5);
    expect(form.invalid).toBe(true);
  });
});

describe('formulario de amortización parcial', () => {
  const condiciones = CONDICIONES_SIMULADOR; // 10.000 € · 24 cuotas · 6 %
  const origen = { condiciones, resultado: calcular(condiciones, { incluirCuadro: true }) };

  it('es válido con los valores por defecto de la v1 (1.000 € en la cuota 6)', () => {
    expect(crearAmortizacionParcialForm(origen).valid).toBe(true);
  });

  it('mensajes de la v1: capital <= 0 y cuota fuera de rango', () => {
    const form = crearAmortizacionParcialForm(origen);
    form.controls.capitalAmortizado.setValue(0);
    expect(mensajeError(form.controls.capitalAmortizado.errors)).toBe('El capital a amortizar debe ser mayor que 0');
    form.controls.cuotaAmortizacion.setValue(25);
    expect(mensajeError(form.controls.cuotaAmortizacion.errors)).toBe('La cuota debe estar entre 1 y 24');
  });

  it('no permite amortizar más que el capital pendiente en esa cuota', () => {
    const form = crearAmortizacionParcialForm(origen);
    const pendiente = origen.resultado.cuadro![5]!.capitalPendiente;
    form.controls.capitalAmortizado.setValue(pendiente + 1);
    expect(mensajeError(form.errors)).toMatch(/no puede ser mayor que el capital pendiente en esa cuota \(.+ €\)/);
  });

  it('exige el cuadro de amortización del origen', () => {
    expect(() =>
      crearAmortizacionParcialForm({ condiciones, resultado: calcular(condiciones) }),
    ).toThrow(/cuadro/);
  });
});
