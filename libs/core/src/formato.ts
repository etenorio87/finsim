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
 * Parsea un string a número aceptando coma o punto como separador decimal.
 *
 * Separador de miles: si aparecen los dos ("1.234,56", "1,234.56"), el último
 * es el decimal y el otro se ignora; si uno se repite ("1.234.567"), son miles.
 * Un único separador es siempre decimal: "9854.64" → 9854.64 (regresión #2).
 */
export function parseDecimal(valor: string): number {
  const texto = valor.trim();
  const ultimoPunto = texto.lastIndexOf('.');
  const ultimaComa = texto.lastIndexOf(',');
  let normalizado: string;
  if (ultimoPunto >= 0 && ultimaComa >= 0) {
    const decimal = ultimoPunto > ultimaComa ? '.' : ',';
    const miles = decimal === '.' ? ',' : '.';
    normalizado = texto.split(miles).join('').replace(decimal, '.');
  } else {
    const separador = ultimoPunto >= 0 ? '.' : ',';
    const veces = texto.split(separador).length - 1;
    normalizado = veces > 1 ? texto.split(separador).join('') : normalizarDecimal(texto);
  }
  const numero = parseFloat(normalizado);
  return isNaN(numero) ? 0 : numero;
}

/*
 * Sin Intl a propósito: el V8 de NativeScript se compila sin soporte de
 * internacionalización y allí toLocaleString('es-ES') devuelve "10000.5".
 * Estas funciones reproducen el formato es-ES de Intl (comprobado en los
 * tests contra Intl) y dan el mismo resultado en la web y en el móvil.
 */

/**
 * Número con `decimales` cifras decimales en formato es-ES: coma decimal y
 * punto de miles solo a partir de 5 cifras enteras ("1234,56", "12.345,67").
 */
export function formatearNumero(valor: number, decimales: number): string {
  const [entera = '', fraccion] = redondear(Math.abs(valor), decimales).split('.');
  const conMiles = entera.length >= 5 ? entera.replace(/\B(?=(\d{3})+$)/g, '.') : entera;
  // Sin "-0,00": un negativo que se redondea a cero se muestra como cero
  const esCero = /^0*$/.test(entera + (fraccion ?? ''));
  const signo = valor < 0 && !esCero ? '-' : '';
  return signo + conMiles + (fraccion ? `,${fraccion}` : '');
}

/**
 * Redondeo "mitad hacia arriba" sobre la representación decimal más corta del
 * número (la de String(n)), como Intl: 5.925 → "5.93", aunque el binario sea
 * 5.92499…; toFixed daría "5.92".
 */
function redondear(positivo: number, decimales: number): string {
  const texto = String(positivo);
  if (texto.includes('e')) return positivo.toFixed(decimales); // < 1e-6 o ≥ 1e21
  const [entera = '0', fraccion = ''] = texto.split('.');
  if (fraccion.length <= decimales) {
    return decimales === 0 ? entera : `${entera}.${fraccion.padEnd(decimales, '0')}`;
  }
  let cifras = entera + fraccion.slice(0, decimales);
  if (fraccion.charAt(decimales) >= '5') cifras = sumarUno(cifras);
  const corte = cifras.length - decimales;
  return decimales === 0 ? cifras : `${cifras.slice(0, corte)}.${cifras.slice(corte)}`;
}

/** "1299" → "1300", "999" → "1000" */
function sumarUno(cifras: string): string {
  const d = cifras.split('');
  let i = d.length - 1;
  while (i >= 0 && d[i] === '9') d[i--] = '0';
  if (i < 0) return `1${d.join('')}`;
  d[i] = String(Number(d[i]) + 1);
  return d.join('');
}

/**
 * Formatea un número como moneda en euros (sin símbolo), formato es-ES
 */
export function formatearMoneda(valor: number): string {
  return formatearNumero(valor, 2);
}

/**
 * Formatea un decimal del dominio como porcentaje (sin símbolo), formato es-ES
 */
export function formatearPorcentaje(valor: number): string {
  return formatearNumero(valor * 100, 2);
}

/**
 * Fecha en formato es-ES corto: "4/11/2026"
 */
export function formatearFecha(fecha: Date): string {
  return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
}
