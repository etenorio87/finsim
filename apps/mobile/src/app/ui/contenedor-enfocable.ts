/**
 * Android: al cerrar el teclado, el foco pasa a la primera vista enfocable.
 * Si no es el contenedor, sería el primer campo, que se quedaría en modo
 * edición sin formato. Se aplica al contenedor raíz de cada pantalla.
 */

import { Directive, HostListener } from '@angular/core';
import { isAndroid, type EventData, type View } from '@nativescript/core';

@Directive({ selector: '[fsContenedorEnfocable]' })
export class ContenedorEnfocableDirective {
  @HostListener('loaded', ['$event'])
  protected alCargar(evento: unknown): void {
    const { object } = evento as EventData;
    if (!isAndroid) return;
    const nativo = (object as View).android as android.view.View;
    nativo.setFocusable(true);
    nativo.setFocusableInTouchMode(true);
  }
}
