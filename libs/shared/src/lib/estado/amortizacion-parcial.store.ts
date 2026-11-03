/**
 * Estado de la amortización parcial.
 *
 * Se abre para un préstamo de origen concreto (`abrir`), porque las
 * validaciones dependen de su cuadro. Corrige un fallo de la v1: allí, tras
 * simular una vez, el resultado se recalculaba con cada cambio SIN validar
 * (p. ej. con una cuota fuera de rango). Aquí solo se calcula con datos válidos.
 */

import { Injectable, computed, signal } from '@angular/core';
import { simularAmortizacionParcial, type ResultadoAmortizacionParcial } from '@finsim/core';
import {
  crearAmortizacionParcialForm,
  type AmortizacionParcialForm,
  type OrigenAmortizacion,
} from '../formularios/amortizacion-parcial.form';
import { mensajeError } from '../formularios/validadores';

@Injectable()
export class AmortizacionParcialStore {
  private readonly estado = signal<{
    origen: OrigenAmortizacion;
    formulario: AmortizacionParcialForm;
  } | null>(null);

  /** Incrementa con cada cambio del formulario para recalcular los computed. */
  private readonly version = signal(0);
  private readonly simulado = signal(false);

  readonly formulario = computed(() => this.estado()?.formulario ?? null);
  readonly origen = computed(() => this.estado()?.origen ?? null);

  readonly error = computed<string | null>(() => {
    this.version();
    const form = this.formulario();
    if (!form || !this.simulado() || form.valid) return null;
    return (
      mensajeError(form.controls.capitalAmortizado.errors) ??
      mensajeError(form.controls.cuotaAmortizacion.errors) ??
      mensajeError(form.errors)
    );
  });

  readonly resultado = computed<ResultadoAmortizacionParcial | null>(() => {
    this.version();
    const e = this.estado();
    if (!e || !this.simulado() || e.formulario.invalid) return null;
    return simularAmortizacionParcial({
      condicionesOriginales: e.origen.condiciones,
      ...e.formulario.getRawValue(),
    });
  });

  abrir(origen: OrigenAmortizacion): void {
    const formulario = crearAmortizacionParcialForm(origen);
    formulario.valueChanges.subscribe(() => this.version.update((v) => v + 1));
    this.simulado.set(false);
    this.estado.set({ origen, formulario });
  }

  simular(): void {
    const form = this.formulario();
    if (!form) return;
    form.markAllAsTouched();
    this.simulado.set(true);
    this.version.update((v) => v + 1);
  }

  cerrar(): void {
    this.estado.set(null);
    this.simulado.set(false);
  }
}
