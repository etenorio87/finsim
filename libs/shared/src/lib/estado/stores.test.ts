import { describe, it, expect } from 'vitest';
import { Injector, type ProviderToken } from '@angular/core';
import { calcular, compararConContado } from '@finsim/core';
import { SimuladorStore } from './simulador.store';
import { ComparadorStore } from './comparador.store';
import { ContadoStore } from './contado.store';
import { AmortizacionParcialStore } from './amortizacion-parcial.store';
import { CONDICIONES_SIMULADOR } from '../valores-iniciales';

function crear<T>(token: ProviderToken<T>): T {
  return Injector.create({ providers: [token as never] }).get(token);
}

describe('SimuladorStore', () => {
  it('no calcula hasta pulsar "Simular"', () => {
    const store = crear(SimuladorStore);
    expect(store.resultado()).toBeNull();
    store.simular();
    expect(store.resultado()?.cuota).toBeCloseTo(443.21, 2);
    expect(store.resultado()?.cuadro).toHaveLength(24);
  });

  it('tras simular, recalcula con cada cambio del formulario', () => {
    const store = crear(SimuladorStore);
    store.simular();
    store.formulario.controls.numeroCuotas.setValue(12);
    expect(store.resultado()?.cuadro).toHaveLength(12);
  });

  it('con datos inválidos no simula y oculta el resultado', () => {
    const store = crear(SimuladorStore);
    store.formulario.controls.importe.setValue(0);
    store.simular();
    expect(store.resultado()).toBeNull();
    expect(store.formulario.controls.importe.touched).toBe(true);

    store.formulario.controls.importe.setValue(10000);
    store.simular();
    expect(store.resultado()).not.toBeNull();
    store.formulario.controls.importe.setValue(0);
    expect(store.resultado()).toBeNull();
  });

  it('la amortización parcial solo se abre con resultado', () => {
    const store = crear(SimuladorStore);
    store.abrirAmortizacion();
    expect(store.amortizacionAbierta()).toBe(false);
    store.simular();
    store.abrirAmortizacion();
    expect(store.amortizacionAbierta()).toBe(true);
  });
});

describe('ComparadorStore', () => {
  it('compara A (6 %) y B (8 %) con el mismo plazo: gana A, "Mejor oferta"', () => {
    const store = crear(ComparadorStore);
    expect(store.comparacion()).toBeNull();
    store.comparar();
    expect(store.comparacion()?.ganadora).toBe('a');
    expect(store.titulo()).toBe('🏆 Mejor oferta: A');
    expect(store.avisoPlazos()).toBeNull();
    expect(store.resultadoA()?.cuadro).toHaveLength(24);
  });

  it('con plazos distintos avisa y habla de "Dinero más barato"', () => {
    const store = crear(ComparadorStore);
    store.formularioB.controls.numeroCuotas.setValue(60);
    store.comparar();
    expect(store.comparacion()?.avisoPlazosDistintos).toBe(true);
    expect(store.titulo()).toMatch(/^💰 Dinero más barato/);
    expect(store.avisoPlazos()).toContain('Son decisiones distintas');
  });
});

describe('ContadoStore', () => {
  it('equivale a compararConContado con la inversión en decimal (10 % bruto, 19 % impuestos)', () => {
    const store = crear(ContadoStore);
    store.calcular();
    expect(store.decision()).toEqual(compararConContado(store.condiciones(), 0.1, 0.19));
    expect(store.decision()?.recomendacion).toBe('financiar'); // TAE ~4 % < 8,1 % neto
  });
});

describe('AmortizacionParcialStore', () => {
  const origen = {
    condiciones: CONDICIONES_SIMULADOR,
    resultado: calcular(CONDICIONES_SIMULADOR, { incluirCuadro: true }),
  };

  it('simula con los valores por defecto (1.000 € en la cuota 6, reducir plazo)', () => {
    const store = crear(AmortizacionParcialStore);
    store.abrir(origen);
    expect(store.resultado()).toBeNull();
    store.simular();
    const r = store.resultado();
    expect(r?.estrategia).toBe('reducirPlazo');
    expect(r?.ahorro.intereses).toBeGreaterThan(0);
    expect(r?.ahorro.cuotasEliminadas).toBeGreaterThan(0);
  });

  it('cambiar de estrategia tras simular recalcula al momento', () => {
    const store = crear(AmortizacionParcialStore);
    store.abrir(origen);
    store.simular();
    store.formulario()!.controls.estrategia.setValue('reducirCuota');
    expect(store.resultado()?.ahorro.reduccionCuota).toBeGreaterThan(0);
  });

  it('corrige la v1: con datos inválidos tras simular muestra el error y no calcula', () => {
    const store = crear(AmortizacionParcialStore);
    store.abrir(origen);
    store.simular();
    store.formulario()!.controls.cuotaAmortizacion.setValue(30);
    expect(store.resultado()).toBeNull();
    expect(store.error()).toBe('La cuota debe estar entre 1 y 24');
  });

  it('el error no aparece antes de pulsar "Simular"', () => {
    const store = crear(AmortizacionParcialStore);
    store.abrir(origen);
    store.formulario()!.controls.capitalAmortizado.setValue(0);
    expect(store.error()).toBeNull();
  });
});
