/**
 * Formulario de condiciones de una financiación (importe, cuotas, frecuencia,
 * TIN y comisiones). Recibe un CondicionesForm de @finsim/shared.
 */

import { Component, computed, input } from '@angular/core';
import { ReactiveFormsModule, type AbstractControl } from '@angular/forms';
import {
  OPCIONES_FRECUENCIA,
  OPCIONES_MOMENTO_COMISION,
  anadirComision,
  eliminarComision,
  mensajeError,
  type CondicionesForm,
} from '@finsim/shared';
import { CampoDecimalComponent } from './campo-decimal';

export type Acento = 'primary' | 'accent';

const ESTILOS: Record<Acento, { borde: string; texto: string; degradado: string }> = {
  primary: { borde: 'border-primary', texto: 'text-primary', degradado: 'from-primary/5' },
  accent: { borde: 'border-accent', texto: 'text-accent', degradado: 'from-accent/5' },
};

let siguienteId = 0;

@Component({
  selector: 'fs-formulario-condiciones',
  imports: [ReactiveFormsModule, CampoDecimalComponent],
  templateUrl: './formulario-condiciones.html',
})
export class FormularioCondicionesComponent {
  readonly formulario = input.required<CondicionesForm>();
  readonly titulo = input.required<string>();
  /** Letra del distintivo: "A", "B" o "F" (financiación). */
  readonly letra = input('F');
  readonly acento = input<Acento>('primary');

  protected readonly estilos = computed(() => ESTILOS[this.acento()]);
  protected readonly id = `condiciones-${siguienteId++}`;
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
