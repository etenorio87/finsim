/**
 * Funciones de comparación
 *
 * Dos funciones distintas, deliberadamente (§4):
 * - compararFinanciaciones: ¿cuál de estas dos es mejor?
 * - compararConContado: ¿financiar o pagar al contado?
 */

import type {
  Condiciones,
  ComparacionFinanciaciones,
  ComparacionContado,
} from './types';

/**
 * Compara dos ofertas de financiación.
 *
 * Criterio de decisión: TAE (el precio del dinero).
 * Incluye aviso si los plazos difieren (§5).
 */
export function compararFinanciaciones(
  a: Condiciones,
  b: Condiciones
): ComparacionFinanciaciones {
  // TODO: Implementar
  throw new Error('compararFinanciaciones() no implementado');
}

/**
 * Compara financiar vs. pagar al contado con dinero que está rindiendo.
 *
 * Regla: financiar solo si TAE < rentabilidad neta.
 * Se comparan TIPOS, no importes (§4).
 */
export function compararConContado(
  financiacion: Condiciones,
  rentabilidadBruta: number,
  tipoImpositivo: number
): ComparacionContado {
  // TODO: Implementar
  throw new Error('compararConContado() no implementado');
}
