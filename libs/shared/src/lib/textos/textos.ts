/**
 * Textos de presentación compartidos por web y móvil.
 */

import { periodosPorAnio } from '@finsim/core';
import type {
  ComparacionFinanciaciones,
  Condiciones,
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

/** Duración de un préstamo en meses, según el número de cuotas y la frecuencia. */
export function duracionEnMeses(condiciones: Condiciones): number {
  return Math.round((condiciones.numeroCuotas * 12) / periodosPorAnio(condiciones.frecuencia));
}

/** 48 → "4 años" · 6 → "6 meses" · 18 → "1 año y 6 meses" */
export function formatearDuracion(meses: number): string {
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  const partes: string[] = [];
  if (anios > 0) partes.push(`${anios} ${anios === 1 ? 'año' : 'años'}`);
  if (resto > 0) partes.push(`${resto} ${resto === 1 ? 'mes' : 'meses'}`);
  return partes.join(' y ');
}

/**
 * Explicación del aviso de plazos distintos (issue #5).
 *
 * Depende de si la oferta más barata es también la más larga:
 * - más larga  → "…pero estarás endeudado 4 años más" (texto del issue)
 * - más corta  → "…y además terminas 4 años antes"
 * - misma duración con distinta frecuencia (24 mensuales vs 8 trimestrales)
 */
export function textoAvisoPlazos(
  comparacion: ComparacionFinanciaciones,
  a: Condiciones,
  b: Condiciones,
): string {
  const letra = letraOferta(comparacion.ganadora);
  const [ganadora, otra] = comparacion.ganadora === 'a' ? [a, b] : [b, a];
  const diferencia = duracionEnMeses(ganadora) - duracionEnMeses(otra);

  if (diferencia > 0) {
    return (
      `Son decisiones distintas: ${letra} es dinero más barato, ` +
      `pero estarás endeudado ${formatearDuracion(diferencia)} más. ` +
      'Depende de qué hagas con la liquidez que liberas.'
    );
  }
  if (diferencia < 0) {
    return `${letra} es dinero más barato y además terminas ${formatearDuracion(-diferencia)} antes.`;
  }
  return (
    `${letra} es dinero más barato. Las dos duran lo mismo ` +
    `(${formatearDuracion(duracionEnMeses(ganadora))}); solo cambia la frecuencia de pago.`
  );
}
