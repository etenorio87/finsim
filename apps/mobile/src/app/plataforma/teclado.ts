/**
 * Teclado en iOS (IQKeyboardManager):
 * - desplaza la pantalla para que el teclado no tape el campo enfocado
 *   (Android lo hace solo; iOS no);
 * - barra sobre el teclado con "Hecho" y anterior/siguiente: el teclado
 *   decimal de iOS no tiene tecla para cerrarse;
 * - tocar fuera de un campo cierra el teclado.
 */

import { isIOS } from '@nativescript/core';

export function configurarTeclado(): void {
  if (!isIOS) return;
  const teclado = IQKeyboardManager.shared;
  teclado.isEnabled = true;
  teclado.keyboardDistance = 24;
  teclado.resignOnTouchOutside = true;
  IQKeyboardToolbarManager.shared.isEnabled = true;
}
