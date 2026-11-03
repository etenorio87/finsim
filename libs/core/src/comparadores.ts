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
import { periodosPorAnio } from './amortizacion';

/**
 * Duración de una financiación en meses: el tiempo de deuda viva (§5).
 * 24 cuotas mensuales y 8 trimestrales duran lo mismo: 24 meses.
 */
export function duracionEnMeses(c: Condiciones): number {
  return (c.numeroCuotas * 12) / periodosPorAnio(c.frecuencia);
}

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

  // Activar aviso si los plazos difieren (§5). El plazo es la DURACIÓN, no el
  // número de cuotas: 12 mensuales (1 año) y 12 anuales (12 años) no son comparables.
  const avisoPlazosDistintos = duracionEnMeses(a) !== duracionEnMeses(b);

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
