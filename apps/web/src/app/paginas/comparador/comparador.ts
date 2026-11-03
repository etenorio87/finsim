/**
 * "Comparar ofertas": gana la de menor TAE, con aviso si los plazos difieren (#5).
 */

import { Component, computed, inject } from '@angular/core';
import { ComparadorStore, PorcentajePipe } from '@finsim/shared';
import { FormularioCondicionesComponent } from '../../ui/formulario-condiciones';
import { ResultadoFinanciacionComponent } from '../../ui/resultado-financiacion';

@Component({
  selector: 'fs-comparador',
  imports: [FormularioCondicionesComponent, ResultadoFinanciacionComponent, PorcentajePipe],
  providers: [ComparadorStore],
  templateUrl: './comparador.html',
})
export class ComparadorPage {
  protected readonly store = inject(ComparadorStore);

  protected readonly textoDistintivo = computed(() =>
    this.store.comparacion()?.avisoPlazosDistintos ? 'Dinero más barato' : 'Mejor oferta',
  );
}
