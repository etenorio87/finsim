/**
 * @finsim/core — motor de cálculo del simulador de financiación
 *
 * Funciones puras, sin dependencias ni acceso a DOM/plataforma.
 * Lo consumen todas las interfaces: web y móvil.
 */

export * from './types';
export { calcular } from './motor';
export { compararFinanciaciones, compararConContado, duracionEnMeses } from './comparadores';
export { simularAmortizacionParcial } from './amortizacionParcial';
export {
  tipoDelPeriodo,
  calcularInteres,
  calcularCapitalAmortizado,
  siguienteCapitalPendiente,
  periodosPorAnio,
} from './amortizacion';
export {
  normalizarDecimal,
  parseDecimal,
  formatearMoneda,
  formatearPorcentaje,
  formatearNumero,
  formatearFecha,
} from './formato';
