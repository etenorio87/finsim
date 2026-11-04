/**
 * "Comparar ofertas": gana la de menor TAE, con aviso si los plazos difieren (#5).
 */

import { Component, ElementRef, NO_ERRORS_SCHEMA, computed, inject } from '@angular/core';
import { Utils, type View } from '@nativescript/core';
import { ComparadorStore, PorcentajePipe } from '@finsim/shared';
import { anunciar, porcentaje } from '../../plataforma/accesibilidad';
import { prepararCaptura } from '../../capturas';
import { ContenedorEnfocableDirective } from '../../ui/contenedor-enfocable';
import { FormularioCondicionesComponent } from '../../ui/formulario-condiciones';
import { ResultadoFinanciacionComponent } from '../../ui/resultado-financiacion';

@Component({
  selector: 'fs-comparador',
  imports: [ContenedorEnfocableDirective, FormularioCondicionesComponent, ResultadoFinanciacionComponent, PorcentajePipe],
  providers: [ComparadorStore],
  templateUrl: './comparador.html',
  schemas: [NO_ERRORS_SCHEMA],
})
export class ComparadorComponent {
  private readonly vista = inject<ElementRef<View>>(ElementRef);

  protected readonly store = inject(ComparadorStore);

  protected readonly textoDistintivo = computed(() =>
    this.store.comparacion()?.avisoPlazosDistintos ? 'Dinero más barato' : 'Mejor oferta',
  );

  constructor() {
    prepararCaptura(['comparar'], () => this.comparar(), () => this.vista.nativeElement);
  }

  protected comparar(): void {
    Utils.dismissSoftInput();
    this.store.comparar();
    const [a, b] = [this.store.resultadoA(), this.store.resultadoB()];
    anunciar(a && b && `${this.store.titulo()}. TAE de A: ${porcentaje(a.tae)}. TAE de B: ${porcentaje(b.tae)}`);
  }
}
