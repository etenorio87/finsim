/**
 * Formato y parseo de valores — compartido por todas las interfaces (web y móvil)
 *
 * El dominio trabaja en DECIMALES (0.0545); estas funciones son el único
 * puente con la representación que ve el usuario ("5,45").
 */

/**
 * Normaliza separadores decimales: convierte coma a punto
 */
export function normalizarDecimal(valor: string): string {
  return valor.replace(',', '.');
}

/**
 * Parsea un string a número aceptando coma o punto como separador decimal
 */
export function parseDecimal(valor: string): number {
  const normalizado = normalizarDecimal(valor);
  const numero = parseFloat(normalizado);
  return isNaN(numero) ? 0 : numero;
}

/**
 * Formatea un número como moneda en euros (sin símbolo), formato es-ES
 */
export function formatearMoneda(valor: number): string {
  return valor.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formatea un decimal del dominio como porcentaje (sin símbolo), formato es-ES
 */
export function formatearPorcentaje(valor: number): string {
  return (valor * 100).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
