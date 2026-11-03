/**
 * Textos de presentación compartidos por web y móvil.
 */

import type {
  ComparacionFinanciaciones,
  EstrategiaAmortizacion,
  Frecuencia,
  MomentoComision,
} from '@finsim/core';

export interface Opcion<T> {
  valor: T;
  etiqueta: string;
}

export const TEXTO_FRECUENCIA: Record<Frecuencia, string> = {
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  anual: 'Anual',
};

/** Unidad de periodo para textos del tipo "443,21 € cada mes". */
export const TEXTO_PERIODO: Record<Frecuencia, string> = {
  mensual: 'mes',
  trimestral: 'trimestre',
  anual: 'año',
};

export const TEXTO_MOMENTO_COMISION: Record<MomentoComision, string> = {
  primeraCuota: '1ª cuota',
  descontadaDelImporte: 'Descontada',
};

export const TEXTO_ESTRATEGIA: Record<EstrategiaAmortizacion, string> = {
  reducirCuota: 'Reducir cuota',
  reducirPlazo: 'Reducir plazo',
};

function opciones<T extends string>(textos: Record<T, string>): Opcion<T>[] {
  return (Object.keys(textos) as T[]).map((valor) => ({ valor, etiqueta: textos[valor] }));
}

export const OPCIONES_FRECUENCIA = opciones(TEXTO_FRECUENCIA);
export const OPCIONES_MOMENTO_COMISION = opciones(TEXTO_MOMENTO_COMISION);
export const OPCIONES_ESTRATEGIA = opciones(TEXTO_ESTRATEGIA);

/** Letra de la oferta ganadora ("A" / "B"). */
export function letraOferta(ganadora: ComparacionFinanciaciones['ganadora']): 'A' | 'B' {
  return ganadora === 'a' ? 'A' : 'B';
}

/**
 * Titular de la comparación (issue #5): con plazos distintos no son el mismo
 * producto, así que no se habla de "mejor oferta" sino de "dinero más barato".
 */
export function tituloComparacion(comparacion: ComparacionFinanciaciones): string {
  const prefijo = comparacion.avisoPlazosDistintos ? '💰 Dinero más barato' : '🏆 Mejor oferta';
  return `${prefijo}: ${letraOferta(comparacion.ganadora)}`;
}

/** Explicación del aviso de plazos distintos (texto de la v1). */
export function textoAvisoPlazos(comparacion: ComparacionFinanciaciones): string {
  const letra = letraOferta(comparacion.ganadora);
  return (
    `Son decisiones distintas: la oferta ${letra} es dinero más barato, ` +
    'pero estarás endeudado durante más tiempo. Depende de qué hagas con la liquidez que liberas. ' +
    'Compara el coste financiero total en las tarjetas de abajo.'
  );
}
