/**
 * Motor de cálculo principal
 *
 * Implementa el cálculo de financiaciones con amortización francesa.
 */

import type { Condiciones, Resultado } from './types';

/**
 * Calcula los indicadores de una financiación.
 *
 * @param c - Condiciones de la financiación
 * @param opts - Opciones: incluirCuadro genera el cuadro completo de amortización
 * @returns Resultado con todos los indicadores (y opcionalmente el cuadro)
 */
export function calcular(
  c: Condiciones,
  opts?: { incluirCuadro: boolean }
): Resultado {
  // TODO: Implementar
  throw new Error('calcular() no implementado');
}
