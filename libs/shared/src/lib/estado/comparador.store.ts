/**
 * Estado de "Comparar ofertas".
 */

import { Injectable, computed, signal } from '@angular/core';
import { calcular, compararFinanciaciones } from '@finsim/core';
import { condicionesDesdeFormulario, crearCondicionesForm } from '../formularios/condiciones.form';
import { textoAvisoPlazos, tituloComparacion } from '../textos/textos';
import { CONDICIONES_OFERTA_A, CONDICIONES_OFERTA_B } from '../valores-iniciales';
import { senalesFormulario } from './senales-formulario';

@Injectable()
export class ComparadorStore {
  readonly formularioA = crearCondicionesForm(CONDICIONES_OFERTA_A);
  readonly formularioB = crearCondicionesForm(CONDICIONES_OFERTA_B);

  private readonly a = senalesFormulario(this.formularioA, condicionesDesdeFormulario);
  private readonly b = senalesFormulario(this.formularioB, condicionesDesdeFormulario);
  private readonly comparado = signal(false);

  readonly condicionesA = this.a.valor;
  readonly condicionesB = this.b.valor;

  private readonly activo = computed(() => this.comparado() && this.a.valido() && this.b.valido());

  readonly comparacion = computed(() =>
    this.activo() ? compararFinanciaciones(this.condicionesA(), this.condicionesB()) : null,
  );

  /** Detalle con cuadro de cada oferta, para las tarjetas de resultado. */
  readonly resultadoA = computed(() =>
    this.activo() ? calcular(this.condicionesA(), { incluirCuadro: true }) : null,
  );
  readonly resultadoB = computed(() =>
    this.activo() ? calcular(this.condicionesB(), { incluirCuadro: true }) : null,
  );

  readonly titulo = computed(() => {
    const c = this.comparacion();
    return c ? tituloComparacion(c) : '';
  });

  readonly avisoPlazos = computed(() => {
    const c = this.comparacion();
    return c?.avisoPlazosDistintos ? textoAvisoPlazos(c, this.condicionesA(), this.condicionesB()) : null;
  });

  comparar(): void {
    this.formularioA.markAllAsTouched();
    this.formularioB.markAllAsTouched();
    if (this.formularioA.valid && this.formularioB.valid) this.comparado.set(true);
  }
}
