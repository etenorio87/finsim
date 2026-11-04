/**
 * Modo captura: abre cada pantalla con su resultado ya calculado para hacer
 * las capturas de las tiendas (tools/capturas.sh). Solo se activa si la app
 * arranca con FINSIM_CAPTURA=<pantalla>; sin la variable no hace nada.
 *
 * En cada plantilla, `id="captura"` marca el elemento que debe quedar arriba.
 */

import { ScrollView, type View } from '@nativescript/core';
import { argumentoArranque } from './plataforma/arranque';

export const CAPTURAS = ['formulario', 'simular', 'cuadro', 'amortizacion', 'comparar', 'contado'] as const;
export type Captura = (typeof CAPTURAS)[number];

export function modoCaptura(): Captura | null {
  const valor = argumentoArranque('FINSIM_CAPTURA');
  return CAPTURAS.find((c) => c === valor) ?? null;
}

/** Pestaña en la que arranca la app en modo captura. */
export function pestanaCaptura(): number {
  const modo = modoCaptura();
  return modo === 'comparar' ? 1 : modo === 'contado' ? 2 : 0;
}

/**
 * Si el modo es uno de `pantallas`, ejecuta la acción (simular, comparar…) y
 * desplaza la pantalla hasta el elemento `captura` dentro de `raiz`.
 */
export function prepararCaptura(pantallas: readonly Captura[], accion: (modo: Captura) => void, raiz: () => View): void {
  setTimeout(() => {
    const modo = modoCaptura();
    if (!modo || !pantallas.includes(modo)) return;
    accion(modo);
    setTimeout(() => desplazarA(raiz()), 800);
  }, 500);
}

function desplazarA(raiz: View): void {
  const objetivo = raiz.getViewById<View>('captura');
  if (!objetivo) return;
  let scroll: View | undefined = objetivo.parent as View | undefined;
  while (scroll && !(scroll instanceof ScrollView)) scroll = scroll.parent as View | undefined;
  if (!(scroll instanceof ScrollView) || !scroll.content) return;
  const y = objetivo.getLocationRelativeTo(scroll.content)?.y ?? 0;
  scroll.scrollToVerticalOffset(Math.max(0, y - 12), false);
}
