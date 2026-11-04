/**
 * "Comparar ofertas": gana la de menor TAE, con aviso si los plazos difieren (#5).
 */

import { Component, NO_ERRORS_SCHEMA, computed, inject } from '@angular/core';
import { Utils } from '@nativescript/core';
import { ComparadorStore, PorcentajePipe } from '@finsim/shared';
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
  protected readonly store = inject(ComparadorStore);

  protected readonly textoDistintivo = computed(() =>
    this.store.comparacion()?.avisoPlazosDistintos ? 'Dinero más barato' : 'Mejor oferta',
  );

  protected comparar(): void {
    Utils.dismissSoftInput();
    this.store.comparar();
  }
}
