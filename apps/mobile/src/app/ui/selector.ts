/**
 * Selector de opciones (frecuencia, momento de la comisión…) con el mismo
 * aspecto en iOS y Android. Sustituye a SegmentedBar, que en Android sale en
 * azul, en mayúsculas y corta las etiquetas largas.
 */

import { Component, NO_ERRORS_SCHEMA, computed, forwardRef, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import type { Opcion } from '@finsim/shared';

@Component({
  selector: 'fs-selector',
  template: `
    <GridLayout [columns]="columnas()" class="selector">
      @for (opcion of opciones(); track opcion.valor; let i = $index) {
        <Label
          [col]="i"
          [text]="opcion.etiqueta"
          (tap)="elegir(opcion.valor)"
          [class]="opcion.valor === valor() ? 'opcion opcion-activa' : 'opcion'"
          [accessible]="true"
          accessibilityRole="button"
          [accessibilityState]="opcion.valor === valor() ? 'selected' : 'unselected'"
        ></Label>
      }
    </GridLayout>
  `,
  schemas: [NO_ERRORS_SCHEMA],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectorComponent), multi: true }],
})
export class SelectorComponent implements ControlValueAccessor {
  readonly opciones = input.required<Opcion<string>[]>();

  protected readonly valor = signal<string | null>(null);
  protected readonly columnas = computed(() => this.opciones().map(() => '*').join(','));

  private onChange: (valor: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected elegir(valor: string): void {
    this.valor.set(valor);
    this.onChange(valor);
    this.onTouched();
  }

  writeValue(valor: string | null): void {
    this.valor.set(valor);
  }
  registerOnChange(fn: (valor: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
