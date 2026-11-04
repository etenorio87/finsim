/**
 * Campo numérico nativo. La lógica (texto libre al escribir, formato al
 * salir, coma o punto decimal) está en CampoDecimalBase (@finsim/shared);
 * aquí solo va la vista.
 */

import { Component, NO_ERRORS_SCHEMA, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { isIOS, type EventData, type TextField } from '@nativescript/core';
import { CampoDecimalBase } from '@finsim/shared';

@Component({
  selector: 'fs-campo-decimal',
  template: `
    <TextField
      [text]="texto()"
      [hint]="placeholder()"
      [isEnabled]="!deshabilitado()"
      [keyboardType]="modo() === 'entero' ? 'integer' : 'number'"
      (loaded)="alCargar($any($event))"
      (focus)="enfocar($any($event))"
      (textChange)="alCambiar($any($event))"
      (blur)="alSalir()"
      returnKeyType="done"
      (returnPress)="confirmar($any($event))"
      [class]="clases()"
    ></TextField>
  `,
  schemas: [NO_ERRORS_SCHEMA],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CampoDecimalComponent), multi: true }],
})
export class CampoDecimalComponent extends CampoDecimalBase {
  readonly placeholder = input('');
  readonly invalido = input(false);
  /** Estilo compacto para campos secundarios (comisiones). */
  readonly compacto = input(false);

  protected clases(): string {
    return `campo${this.compacto() ? ' campo-compacto' : ''}${this.invalido() ? ' campo-invalido' : ''}`;
  }

  protected alCargar({ object }: EventData): void {
    const campo = object as TextField;
    if (this.modo() === 'entero') return;
    if (isIOS) {
      // Teclado decimal: dígitos y el separador del idioma ("," en español)
      campo.ios.keyboardType = UIKeyboardType.DecimalPad;
    } else {
      // El filtro del teclado numérico de Android descarta la coma aunque el
      // teclado la muestre: se admiten las dos y se mantiene el teclado numérico.
      const nativo = campo.android as android.widget.EditText;
      nativo.setKeyListener(android.text.method.DigitsKeyListener.getInstance('0123456789.,'));
      nativo.setRawInputType(android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL);
    }
  }

  /** Igual que en la web: el texto editable se escribe ya, sin esperar al render. */
  protected enfocar({ object }: EventData): void {
    const campo = object as TextField;
    this.alEnfocar();
    campo.text = this.texto();
    // Seleccionar todo (después de cambiar el texto, que pierde la selección)
    // para que lo que se escriba sustituya al valor
    setTimeout(() => {
      if (isIOS) {
        const nativo = campo.ios as UITextField;
        nativo.selectedTextRange = nativo.textRangeFromPositionToPosition(nativo.beginningOfDocument, nativo.endOfDocument);
      } else {
        (campo.android as android.widget.EditText).selectAll();
      }
    });
  }

  /**
   * Se comunica cada pulsación al formulario: en Android, cerrar el teclado
   * (atrás) no quita el foco, y sin esto el resultado no se actualizaría.
   */
  protected alCambiar({ object }: EventData): void {
    if (this.enFoco()) this.alEscribir((object as TextField).text ?? '', true);
  }

  /** "Hecho" en el teclado: lo cierra y sale del campo (se aplica el formato). */
  protected confirmar({ object }: EventData): void {
    (object as TextField).dismissSoftInput();
    this.alSalir();
  }
}
