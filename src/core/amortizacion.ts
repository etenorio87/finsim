/**
 * Núcleo de amortización francesa
 *
 * ⚠️ NO REESCRIBIR - Derivado por el usuario (§7.1)
 *
 * Estas funciones implementan el sistema de amortización francesa.
 * La retroalimentación que generan explica todo el comportamiento:
 *
 *   capital vivo baja → interés baja → (cuota constante) → más capital
 *        ↑                                                        │
 *        └────────────────────────────────────────────────────────┘
 */

import type { Frecuencia } from './types';

const PERIODOS_POR_ANIO: Record<Frecuencia, number> = {
  mensual: 12,
  trimestral: 4,
  anual: 1,
};

/** Tipo aplicable en cada periodo, a partir del TIN anual (decimal). */
export function tipoDelPeriodo(tin: number, frecuencia: Frecuencia): number {
  return tin / PERIODOS_POR_ANIO[frecuencia];
}

/** Interés devengado en un periodo. Se calcula sobre el CAPITAL VIVO. */
export function calcularInteres(capitalPendiente: number, tipoPeriodo: number): number {
  return capitalPendiente * tipoPeriodo;
}

/** Parte de la cuota que reduce deuda. */
export function calcularCapitalAmortizado(cuota: number, interes: number): number {
  return cuota - interes;
}

/** Capital vivo al inicio del periodo siguiente. */
export function siguienteCapitalPendiente(
  capitalPendiente: number,
  capitalAmortizado: number
): number {
  return capitalPendiente - capitalAmortizado;
}

/** Número de periodos por año según la frecuencia de pago. */
export function periodosPorAnio(frecuencia: Frecuencia): number {
  return PERIODOS_POR_ANIO[frecuencia];
}
