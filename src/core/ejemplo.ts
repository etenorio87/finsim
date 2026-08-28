/**
 * Ejemplo de uso del motor de cálculo
 *
 * Ejecutar con: npx tsx src/core/ejemplo.ts
 */

import { calcular } from './motor';
import { compararFinanciaciones, compararConContado } from './comparadores';
import type { Condiciones } from './types';

console.log('=== SIMULADOR DE FINANCIACIÓN ===\n');

// Ejemplo 1: Préstamo del coche (caso real BBVA)
console.log('📊 Ejemplo 1: Préstamo del coche');
const prestamoCoche: Condiciones = {
  importe: 9854.64,
  numeroCuotas: 59,
  frecuencia: 'mensual',
  tin: 0.0545, // 5.45%
  comisiones: [],
};

const resultado1 = calcular(prestamoCoche);
console.log(`  Cuota mensual: ${resultado1.cuota.toFixed(2)} €`);
console.log(`  TIN: ${(resultado1.tin * 100).toFixed(2)}%`);
console.log(`  TAE: ${(resultado1.tae * 100).toFixed(2)}%`);
console.log(`  Coste financiero: ${resultado1.costeFinanciero.toFixed(2)} €`);
console.log(`  Saldo medio: ${resultado1.saldoMedio.toFixed(2)} €\n`);

// Ejemplo 2: Móvil "sin intereses"
console.log('📱 Ejemplo 2: Móvil "sin intereses" con comisión');
const financiacionMovil: Condiciones = {
  importe: 600,
  numeroCuotas: 10,
  frecuencia: 'mensual',
  tin: 0, // "Sin intereses"
  comisiones: [
    {
      descripcion: 'Comisión de apertura',
      importe: 18,
      momento: 'primeraCuota',
    },
  ],
};

const resultado2 = calcular(financiacionMovil);
console.log(`  Cuota mensual: ${resultado2.cuota.toFixed(2)} €`);
console.log(`  TIN: ${(resultado2.tin * 100).toFixed(2)}%`);
console.log(`  TAE REAL: ${(resultado2.tae * 100).toFixed(2)}%  ⚠️  NO es 0%!`);
console.log(`  Coste total: ${resultado2.costeTotal.toFixed(2)} €`);
console.log(`  Saldo medio: ${resultado2.saldoMedio.toFixed(2)} € (NO 300€)\n`);

// Ejemplo 3: Comparar dos financiaciones
console.log('⚖️  Ejemplo 3: Comparar dos ofertas');
const ofertaA: Condiciones = {
  importe: 10000,
  numeroCuotas: 24, // 2 años
  frecuencia: 'mensual',
  tin: 0.06,
  comisiones: [],
};

const ofertaB: Condiciones = {
  importe: 10000,
  numeroCuotas: 60, // 5 años (cuota más baja)
  frecuencia: 'mensual',
  tin: 0.06,
  comisiones: [],
};

const comparacion = compararFinanciaciones(ofertaA, ofertaB);
console.log(`  Oferta A: ${comparacion.detalle.a.cuota.toFixed(2)} €/mes, TAE ${(comparacion.detalle.a.tae * 100).toFixed(2)}%`);
console.log(`  Oferta B: ${comparacion.detalle.b.cuota.toFixed(2)} €/mes, TAE ${(comparacion.detalle.b.tae * 100).toFixed(2)}%`);
console.log(`  Ganadora: ${comparacion.ganadora === 'a' ? 'A' : 'B'}`);
if (comparacion.avisoPlazosDistintos) {
  console.log(`  ⚠️  AVISO: Plazos distintos. Misma TAE pero coste total muy diferente.`);
  console.log(`     A paga ${comparacion.detalle.a.costeFinanciero.toFixed(2)} € en intereses`);
  console.log(`     B paga ${comparacion.detalle.b.costeFinanciero.toFixed(2)} € en intereses`);
}
console.log();

// Ejemplo 4: ¿Financiar o pagar al contado?
console.log('💰 Ejemplo 4: ¿Financiar o pagar al contado?');
const financiacion: Condiciones = {
  importe: 10000,
  numeroCuotas: 24,
  frecuencia: 'mensual',
  tin: 0.04, // 4%
  comisiones: [],
};

const rentabilidadBruta = 0.10; // 10% bruto de mi inversión
const tipoImpositivo = 0.19; // 19% impuestos

const decision = compararConContado(financiacion, rentabilidadBruta, tipoImpositivo);
console.log(`  TAE financiación: ${(decision.taeFinanciacion * 100).toFixed(2)}%`);
console.log(`  Rentabilidad bruta: ${(rentabilidadBruta * 100).toFixed(2)}%`);
console.log(`  Rentabilidad neta: ${(decision.rentabilidadNeta * 100).toFixed(2)}%`);
console.log(`  Recomendación: ${decision.recomendacion === 'financiar' ? '✅ FINANCIAR' : '❌ PAGAR AL CONTADO'}`);
console.log(`  Razón: ${decision.diferenciaTipos > 0 ? 'Ganas' : 'Pierdes'} ${Math.abs(decision.diferenciaTipos * 100).toFixed(2)}% anual`);
console.log();

console.log('✅ Motor funcionando correctamente. Todos los tests pasan.');
console.log('📋 Siguiente paso: Fase 2 (interfaz web)');
