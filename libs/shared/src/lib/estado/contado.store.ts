/**
 * Estado de "¿Financiar o contado?".
 */

import { Injectable, computed, signal } from '@angular/core';
import { calcular, compararConContado } from '@finsim/core';
import { condicionesDesdeFormulario, crearCondicionesForm, crearInversionForm } from '../formularios/condiciones.form';
import { CONDICIONES_CONTADO, INVERSION_INICIAL } from '../valores-iniciales';
import { senalesFormulario } from './senales-formulario';

@Injectable()
export class ContadoStore {
  readonly formularioCondiciones = crearCondicionesForm(CONDICIONES_CONTADO);
  readonly formularioInversion = crearInversionForm(INVERSION_INICIAL);

  private readonly cond = senalesFormulario(this.formularioCondiciones, condicionesDesdeFormulario);
  private readonly inv = senalesFormulario(this.formularioInversion, (f) => f.getRawValue());
  private readonly calculado = signal(false);

  readonly condiciones = this.cond.valor;

  private readonly activo = computed(() => this.calculado() && this.cond.valido() && this.inv.valido());

  readonly decision = computed(() => {
    if (!this.activo()) return null;
    const { rentabilidadBruta, tipoImpositivo } = this.inv.valor();
    return compararConContado(this.condiciones(), rentabilidadBruta, tipoImpositivo);
  });

  readonly resultado = computed(() =>
    this.activo() ? calcular(this.condiciones(), { incluirCuadro: true }) : null,
  );

  calcular(): void {
    this.formularioCondiciones.markAllAsTouched();
    this.formularioInversion.markAllAsTouched();
    if (this.formularioCondiciones.valid && this.formularioInversion.valid) this.calculado.set(true);
  }
}
