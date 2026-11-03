/**
 * Validadores y mensajes de error compartidos.
 */

import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** El valor debe ser estrictamente mayor que 0. */
export const mayorQueCero: ValidatorFn = (control: AbstractControl<number>): ValidationErrors | null =>
  typeof control.value === 'number' && control.value > 0 ? null : { mayorQueCero: true };

/** El valor debe ser un número entero. */
export const entero: ValidatorFn = (control: AbstractControl<number>): ValidationErrors | null =>
  Number.isInteger(control.value) ? null : { entero: true };

/**
 * Devuelve el mensaje del primer error de un control, o null si es válido.
 * Los errores con mensaje propio (`{ mensaje: '...' }`) tienen prioridad.
 */
export function mensajeError(errores: ValidationErrors | null | undefined): string | null {
  if (!errores) return null;
  if (typeof errores['mensaje'] === 'string') return errores['mensaje'];
  if (errores['required']) return 'Campo obligatorio';
  if (errores['mayorQueCero']) return 'Debe ser mayor que 0';
  if (errores['entero']) return 'Debe ser un número entero';
  if (errores['min']) return `Debe ser como mínimo ${errores['min'].min}`;
  if (errores['max']) return `Debe ser como máximo ${errores['max'].max}`;
  return 'Valor no válido';
}
