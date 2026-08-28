/**
 * Tipos del dominio - Simulador de financiación
 *
 * IMPORTANTE: Todos los tipos de interés (TIN, TAE, rentabilidad) se expresan
 * en DECIMAL dentro del dominio: 0.0545 representa 5.45%.
 * El formateo a porcentaje ocurre SOLO en la capa de presentación.
 */

export type Frecuencia = 'mensual' | 'trimestral' | 'anual';

export type MomentoComision =
  | 'primeraCuota'          // se carga íntegra en la primera cuota (caso Cetelem)
  | 'descontadaDelImporte'; // pides 800, recibes 775

export interface Comision {
  descripcion: string;
  importe?: number;      // importe fijo en euros
  porcentaje?: number;   // % sobre el importe financiado (decimal)
  momento: MomentoComision;
}

export interface Condiciones {
  importe: number;         // capital solicitado
  numeroCuotas: number;
  frecuencia: Frecuencia;
  tin: number;             // DECIMAL: 0.0545
  comisiones: Comision[];
}

export interface FilaCuadro {
  numero: number;
  cuota: number;
  interes: number;
  capital: number;
  capitalPendiente: number;
}

export interface Resultado {
  cuota: number;
  costeTotal: number;      // suma de cuotas + comisiones
  costeFinanciero: number; // costeTotal − importe
  saldoMedio: number;
  tin: number;             // decimal
  tae: number;             // decimal, REAL: incluye comisiones
  cuadro?: FilaCuadro[];   // solo si se solicita
}

export interface ComparacionFinanciaciones {
  ganadora: 'a' | 'b';
  criterio: 'tae';
  diferenciaTae: number;
  avisoPlazosDistintos: boolean;
  detalle: { a: Resultado; b: Resultado };
}

export interface ComparacionContado {
  recomendacion: 'financiar' | 'pagarAlContado';
  taeFinanciacion: number;        // decimal
  rentabilidadNeta: number;       // decimal, ya neta de impuestos
  diferenciaTipos: number;
  costeEstimadoEuros: number;     // informativo
}
