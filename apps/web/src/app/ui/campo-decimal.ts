/**
 * Campo numérico de la web. La lógica (texto libre al escribir, formato al
 * salir, coma o punto decimal) está en CampoDecimalBase (@finsim/shared);
 * aquí solo va la vista.
 */

import { Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CampoDecimalBase } from '@finsim/shared';

@Component({
  selector: 'fs-campo-decimal',
  template: `
    <input
      type="text"
      [attr.inputmode]="modo() === 'entero' ? 'numeric' : 'decimal'"
      [attr.id]="idCampo()"
      [attr.placeholder]="placeholder()"
      [attr.aria-invalid]="invalido()"
      [value]="texto()"
      [disabled]="deshabilitado()"
      (focus)="alEnfocar(); $any($event.target).select()"
      (input)="alEscribir($any($event.target).value)"
      (blur)="alSalir()"
      [class]="clases()"
    />
  `,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CampoDecimalComponent), multi: true }],
})
export class CampoDecimalComponent extends CampoDecimalBase {
  readonly idCampo = input<string>();
  readonly placeholder = input('');
  readonly invalido = input(false);
  /** Estilo compacto para campos secundarios (comisiones). */
  readonly compacto = input(false);

  protected clases(): string {
    const base = this.compacto()
      ? 'w-full bg-white border rounded-lg px-3 py-2 text-sm'
      : 'w-full bg-white border-2 rounded-xl px-4 py-3 text-secondary transition-all';
    return `${base} ${this.invalido() ? 'border-negative' : 'border-gray-200'}`;
  }
}
