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
import { calcular } from './motor';

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
  // Calcular resultados de ambas financiaciones
  const resultadoA = calcular(a);
  const resultadoB = calcular(b);

  // Comparar por TAE
  const ganadora = resultadoA.tae <= resultadoB.tae ? 'a' : 'b';
  const diferenciaTae = Math.abs(resultadoA.tae - resultadoB.tae);

  // Activar aviso si los plazos difieren (§5)
  const avisoPlazosDistintos = a.numeroCuotas !== b.numeroCuotas;

  return {
    ganadora,
    criterio: 'tae',
    diferenciaTae,
    avisoPlazosDistintos,
    detalle: {
      a: resultadoA,
      b: resultadoB,
    },
  };
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
  // Calcular la TAE real de la financiación
  const resultado = calcular(financiacion);
  const taeFinanciacion = resultado.tae;

  // Calcular rentabilidad neta
  const rentabilidadNeta = rentabilidadBruta * (1 - tipoImpositivo);

  // Decisión: financiar solo si TAE < rentabilidad neta
  const recomendacion =
    taeFinanciacion < rentabilidadNeta ? 'financiar' : 'pagarAlContado';

  // Diferencia de tipos (positiva si conviene financiar)
  const diferenciaTipos = rentabilidadNeta - taeFinanciacion;

  // Coste estimado: el coste financiero total
  const costeEstimadoEuros = resultado.costeFinanciero;

  return {
    recomendacion,
    taeFinanciacion,
    rentabilidadNeta,
    diferenciaTipos,
    costeEstimadoEuros,
  };
}
