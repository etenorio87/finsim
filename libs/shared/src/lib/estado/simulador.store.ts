/**
 * Estado de "Simular financiación".
 *
 * Igual que la v1: no se calcula nada hasta pulsar "Simular"; a partir de ahí
 * el resultado se recalcula con cada cambio. Novedad: si el formulario deja de
 * ser válido, el resultado desaparece en vez de calcularse con datos erróneos.
 */

import { Injectable, computed, signal } from '@angular/core';
import { calcular, type Resultado } from '@finsim/core';
import { condicionesDesdeFormulario, crearCondicionesForm } from '../formularios/condiciones.form';
import { CONDICIONES_SIMULADOR } from '../valores-iniciales';
import { senalesFormulario } from './senales-formulario';

@Injectable()
export class SimuladorStore {
  readonly formulario = crearCondicionesForm(CONDICIONES_SIMULADOR);

  private readonly form = senalesFormulario(this.formulario, condicionesDesdeFormulario);
  private readonly simulado = signal(false);

  readonly condiciones = this.form.valor;

  readonly resultado = computed<Resultado | null>(() =>
    this.simulado() && this.form.valido()
      ? calcular(this.condiciones(), { incluirCuadro: true })
      : null,
  );

  /** Abre/cierra el panel de amortización parcial. */
  readonly amortizacionAbierta = signal(false);

  simular(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.valid) this.simulado.set(true);
  }

  abrirAmortizacion(): void {
    if (this.resultado()) this.amortizacionAbierta.set(true);
  }

  cerrarAmortizacion(): void {
    this.amortizacionAbierta.set(false);
  }
}
