/**
 * Formulario de condiciones de una financiación (importe, cuotas, frecuencia,
 * TIN y comisiones). Recibe un CondicionesForm de @finsim/shared.
 */

import { Component, NO_ERRORS_SCHEMA, input } from '@angular/core';
import { ReactiveFormsModule, type AbstractControl } from '@angular/forms';
import { NativeScriptFormsModule } from '@nativescript/angular';
import {
  OPCIONES_FRECUENCIA,
  OPCIONES_MOMENTO_COMISION,
  anadirComision,
  eliminarComision,
  mensajeError,
  type CondicionesForm,
} from '@finsim/shared';
import { CampoDecimalComponent } from './campo-decimal';
import { EtiquetaAccesibleDirective } from './etiqueta-accesible';
import { SelectorComponent } from './selector';

export type Acento = 'primary' | 'accent';

@Component({
  selector: 'fs-formulario-condiciones',
  imports: [ReactiveFormsModule, NativeScriptFormsModule, CampoDecimalComponent, EtiquetaAccesibleDirective, SelectorComponent],
  templateUrl: './formulario-condiciones.html',
  schemas: [NO_ERRORS_SCHEMA],
})
export class FormularioCondicionesComponent {
  readonly formulario = input.required<CondicionesForm>();
  readonly titulo = input.required<string>();
  /** Letra del distintivo: "A", "B" o "F" (financiación). */
  readonly letra = input('F');
  readonly acento = input<Acento>('primary');

  protected readonly frecuencias = OPCIONES_FRECUENCIA;
  protected readonly momentos = OPCIONES_MOMENTO_COMISION;

  protected error(control: AbstractControl): string | null {
    return control.touched ? mensajeError(control.errors) : null;
  }

  protected anadirComision(): void {
    anadirComision(this.formulario());
  }

  protected eliminarComision(indice: number): void {
    eliminarComision(this.formulario(), indice);
  }
}
