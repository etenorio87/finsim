/**
 * Avisos para el lector de pantalla (VoiceOver / TalkBack). El resultado de un
 * cálculo aparece debajo del botón, fuera de donde está el usuario: sin el
 * aviso, quien usa el lector no sabe que ha cambiado nada.
 */

import { Frame } from '@nativescript/core';
import { formatearMoneda, formatearPorcentaje } from '@finsim/core';

const AVISO_ERRORES = 'Revisa los datos: hay campos con errores';

/** Lee el mensaje si hay un lector de pantalla activo (si no, no hace nada). */
export function anunciar(mensaje: string | null): void {
  Frame.topmost()?.currentPage?.accessibilityAnnouncement(mensaje ?? AVISO_ERRORES);
}

export const porcentaje = (valor: number): string => `${formatearPorcentaje(valor)} %`;
export const moneda = (valor: number): string => `${formatearMoneda(valor)} €`;
