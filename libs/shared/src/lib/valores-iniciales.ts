/**
 * Valores con los que arranca cada pantalla (los mismos que la v1).
 *
 * Todos los tipos en DECIMAL, como en el dominio.
 */

import type { Comision, Condiciones, EstrategiaAmortizacion } from '@finsim/core';

const BASE: Condiciones = {
  importe: 10000,
  numeroCuotas: 24,
  frecuencia: 'mensual',
  tin: 0.06,
  comisiones: [],
};

export const CONDICIONES_SIMULADOR: Condiciones = { ...BASE };
export const CONDICIONES_OFERTA_A: Condiciones = { ...BASE };
export const CONDICIONES_OFERTA_B: Condiciones = { ...BASE, tin: 0.08 };
export const CONDICIONES_CONTADO: Condiciones = { ...BASE, tin: 0.04 };

export interface Inversion {
  rentabilidadBruta: number; // decimal
  tipoImpositivo: number; // decimal
}

export const INVERSION_INICIAL: Inversion = {
  rentabilidadBruta: 0.1,
  tipoImpositivo: 0.19,
};

export const COMISION_NUEVA: Comision = {
  descripcion: 'Comisión',
  importe: 0,
  momento: 'primeraCuota',
};

export interface ParametrosAmortizacionFormulario {
  capitalAmortizado: number;
  cuotaAmortizacion: number;
  estrategia: EstrategiaAmortizacion;
}

export const AMORTIZACION_INICIAL: ParametrosAmortizacionFormulario = {
  capitalAmortizado: 1000,
  cuotaAmortizacion: 6,
  estrategia: 'reducirPlazo',
};
