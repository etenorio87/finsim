/**
 * Formulario de amortización parcial.
 *
 * Las validaciones dependen del préstamo de origen (número de cuotas y
 * capital pendiente en cada cuota), así que el formulario se crea para un
 * origen concreto. Mensajes idénticos a los de la v1.
 */

import { FormControl, FormGroup, type AbstractControl, type ValidationErrors, type ValidatorFn } from '@angular/forms';
import type { Condiciones, EstrategiaAmortizacion, Resultado } from '@finsim/core';
import { formatearMoneda } from '@finsim/core';
import { AMORTIZACION_INICIAL, type ParametrosAmortizacionFormulario } from '../valores-iniciales';

export interface OrigenAmortizacion {
  condiciones: Condiciones;
  /** Resultado con cuadro de amortización (`incluirCuadro: true`). */
  resultado: Resultado;
}

export type AmortizacionParcialForm = FormGroup<{
  capitalAmortizado: FormControl<number>;
  cuotaAmortizacion: FormControl<number>;
  estrategia: FormControl<EstrategiaAmortizacion>;
}>;

const capitalPositivo: ValidatorFn = (c: AbstractControl<number>): ValidationErrors | null =>
  typeof c.value === 'number' && c.value > 0
    ? null
    : { mensaje: 'El capital a amortizar debe ser mayor que 0' };

function cuotaEnRango(numeroCuotas: number): ValidatorFn {
  return (c: AbstractControl<number>): ValidationErrors | null =>
    Number.isInteger(c.value) && c.value >= 1 && c.value <= numeroCuotas
      ? null
      : { mensaje: `La cuota debe estar entre 1 y ${numeroCuotas}` };
}

function capitalNoSuperaPendiente(resultado: Resultado): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const { capitalAmortizado, cuotaAmortizacion } = (grupo as AmortizacionParcialForm).getRawValue();
    const fila = resultado.cuadro?.[cuotaAmortizacion - 1];
    if (!fila) return null; // lo cubre el validador de rango de la cuota
    return capitalAmortizado > fila.capitalPendiente
      ? {
          mensaje:
            'El capital a amortizar no puede ser mayor que el capital pendiente ' +
            `en esa cuota (${formatearMoneda(fila.capitalPendiente)} €)`,
        }
      : null;
  };
}

export function crearAmortizacionParcialForm(
  origen: OrigenAmortizacion,
  valores: ParametrosAmortizacionFormulario = AMORTIZACION_INICIAL,
): AmortizacionParcialForm {
  if (!origen.resultado.cuadro) {
    throw new Error('La amortización parcial necesita el cuadro de amortización del préstamo de origen');
  }
  return new FormGroup(
    {
      capitalAmortizado: new FormControl(valores.capitalAmortizado, {
        nonNullable: true,
        validators: [capitalPositivo],
      }),
      cuotaAmortizacion: new FormControl(valores.cuotaAmortizacion, {
        nonNullable: true,
        validators: [cuotaEnRango(origen.condiciones.numeroCuotas)],
      }),
      estrategia: new FormControl(valores.estrategia, { nonNullable: true }),
    },
    { validators: [capitalNoSuperaPendiente(origen.resultado)] },
  );
}
