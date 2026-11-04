/**
 * Campo numérico con "texto libre mientras escribes, formato al salir" (issues #1 y #2).
 *
 * - `ModoCampo`: lógica pura de conversión entre valor del dominio y texto.
 * - `CampoDecimalBase`: ControlValueAccessor sin plantilla. Cada plataforma
 *   la extiende y solo aporta la vista:
 *     web   → <input inputmode="decimal" (focus) (input) (blur)>
 *     móvil → <TextField keyboardType="number" (focus) (textChange) (blur)>
 */

import { Directive, computed, input, signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { formatearMoneda, formatearPorcentaje, parseDecimal } from '@finsim/core';

/**
 * - `importe`: euros, se muestra "10.000,00"
 * - `porcentaje`: decimal del dominio (0.0545), se edita y muestra como "5,45"
 * - `entero`: número de cuotas, se muestra "24"
 */
export type ModoCampo = 'importe' | 'porcentaje' | 'entero';

/** Texto formateado cuando el campo NO tiene el foco. */
export function textoFormateado(valor: number, modo: ModoCampo): string {
  switch (modo) {
    case 'importe':
      return formatearMoneda(valor);
    case 'porcentaje':
      return formatearPorcentaje(valor);
    case 'entero':
      return String(valor);
  }
}

/** Texto editable al recibir el foco: sin separador de miles, coma decimal. */
export function textoEditable(valor: number, modo: ModoCampo): string {
  const visible = modo === 'porcentaje' ? valor * 100 : valor;
  return visible.toString().replace('.', ',');
}

/** Valor del dominio a partir de lo que ha escrito el usuario (acepta coma y punto). */
export function valorDesdeTexto(texto: string, modo: ModoCampo): number {
  const numero = parseDecimal(texto);
  switch (modo) {
    case 'importe':
      return numero;
    case 'porcentaje':
      return numero / 100;
    case 'entero':
      return Math.trunc(numero);
  }
}

@Directive()
export abstract class CampoDecimalBase implements ControlValueAccessor {
  readonly modo = input<ModoCampo>('importe');

  protected readonly valor = signal(0);
  protected readonly enFoco = signal(false);
  protected readonly textoEnEdicion = signal('');
  protected readonly deshabilitado = signal(false);

  /** Lo que la vista debe mostrar en cada momento. */
  readonly texto = computed(() =>
    this.enFoco() ? this.textoEnEdicion() : textoFormateado(this.valor(), this.modo()),
  );

  private onChange: (valor: number) => void = () => {};
  private onTouched: () => void = () => {};

  alEnfocar(): void {
    this.textoEnEdicion.set(textoEditable(this.valor(), this.modo()));
    this.enFoco.set(true);
  }

  /**
   * Guarda lo escrito. Con `notificar`, además lo comunica al formulario sin
   * esperar a salir del campo (el texto no se reformatea hasta alSalir).
   * El móvil lo necesita: en Android, cerrar el teclado no quita el foco.
   */
  alEscribir(texto: string, notificar = false): void {
    this.textoEnEdicion.set(texto);
    if (notificar) this.onChange(valorDesdeTexto(texto, this.modo()));
  }

  /** Al salir se interpreta el texto y se notifica al formulario. */
  alSalir(): void {
    if (!this.enFoco()) return;
    const nuevo = valorDesdeTexto(this.textoEnEdicion(), this.modo());
    this.enFoco.set(false);
    this.valor.set(nuevo);
    this.onChange(nuevo);
    this.onTouched();
  }

  writeValue(valor: number | null): void {
    this.valor.set(valor ?? 0);
  }

  registerOnChange(fn: (valor: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }
}
