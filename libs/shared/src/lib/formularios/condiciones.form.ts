/**
 * Formularios tipados de condiciones de financiación e inversión.
 *
 * Son funciones puras (sin FormBuilder inyectado): se pueden crear en un
 * store, en un componente o en un test sin contexto de inyección.
 */

import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import type { Comision, Condiciones, Frecuencia, MomentoComision } from '@finsim/core';
import { COMISION_NUEVA, type Inversion } from '../valores-iniciales';
import { entero, mayorQueCero } from './validadores';

export type ComisionForm = FormGroup<{
  descripcion: FormControl<string>;
  importe: FormControl<number>;
  momento: FormControl<MomentoComision>;
}>;

export type CondicionesForm = FormGroup<{
  importe: FormControl<number>;
  numeroCuotas: FormControl<number>;
  frecuencia: FormControl<Frecuencia>;
  tin: FormControl<number>;
  comisiones: FormArray<ComisionForm>;
}>;

export type InversionForm = FormGroup<{
  rentabilidadBruta: FormControl<number>;
  tipoImpositivo: FormControl<number>;
}>;

export function crearComisionForm(comision: Comision = COMISION_NUEVA): ComisionForm {
  return new FormGroup({
    descripcion: new FormControl(comision.descripcion, { nonNullable: true }),
    importe: new FormControl(comision.importe ?? 0, {
      nonNullable: true,
      validators: [Validators.min(0)],
    }),
    momento: new FormControl(comision.momento, { nonNullable: true }),
  });
}

export function crearCondicionesForm(condiciones: Condiciones): CondicionesForm {
  return new FormGroup({
    importe: new FormControl(condiciones.importe, {
      nonNullable: true,
      validators: [mayorQueCero],
    }),
    numeroCuotas: new FormControl(condiciones.numeroCuotas, {
      nonNullable: true,
      validators: [entero, Validators.min(1)],
    }),
    frecuencia: new FormControl(condiciones.frecuencia, { nonNullable: true }),
    tin: new FormControl(condiciones.tin, {
      nonNullable: true,
      validators: [Validators.min(0)],
    }),
    comisiones: new FormArray(condiciones.comisiones.map((c) => crearComisionForm(c))),
  });
}

export function anadirComision(form: CondicionesForm): void {
  form.controls.comisiones.push(crearComisionForm());
}

export function eliminarComision(form: CondicionesForm, indice: number): void {
  form.controls.comisiones.removeAt(indice);
}

/** Convierte el valor del formulario en las Condiciones del dominio. */
export function condicionesDesdeFormulario(form: CondicionesForm): Condiciones {
  const valor = form.getRawValue();
  return {
    importe: valor.importe,
    numeroCuotas: valor.numeroCuotas,
    frecuencia: valor.frecuencia,
    tin: valor.tin,
    comisiones: valor.comisiones.map((c) => ({
      descripcion: c.descripcion,
      importe: c.importe,
      momento: c.momento,
    })),
  };
}

export function crearInversionForm(inversion: Inversion): InversionForm {
  return new FormGroup({
    rentabilidadBruta: new FormControl(inversion.rentabilidadBruta, {
      nonNullable: true,
      validators: [Validators.min(0)],
    }),
    tipoImpositivo: new FormControl(inversion.tipoImpositivo, {
      nonNullable: true,
      validators: [Validators.min(0), Validators.max(1)],
    }),
  });
}
