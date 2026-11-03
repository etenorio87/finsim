/**
 * Pipes de presentación con formato es-ES (§2 de la especificación: "5,45 %").
 */

import { Pipe, type PipeTransform } from '@angular/core';
import { formatearMoneda, formatearPorcentaje } from '@finsim/core';

/** 9854.64 → "9854,64 €" · 12345.6 → "12.345,60 €" */
@Pipe({ name: 'moneda' })
export class MonedaPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return valor == null ? '' : `${formatearMoneda(valor)} €`;
  }
}

/** Decimal del dominio → porcentaje: 0.0617 → "6,17 %" */
@Pipe({ name: 'porcentaje' })
export class PorcentajePipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return valor == null ? '' : `${formatearPorcentaje(valor)} %`;
  }
}
