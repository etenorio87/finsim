/**
 * "Simular financiación": TAE, cuota, costes y cuadro de una oferta.
 */

import { Component, computed, inject } from '@angular/core';
import { AmortizacionParcialStore, SimuladorStore } from '@finsim/shared';
import { FormularioCondicionesComponent } from '../../ui/formulario-condiciones';
import { ResultadoFinanciacionComponent } from '../../ui/resultado-financiacion';
import { AmortizacionParcialComponent } from '../amortizacion-parcial/amortizacion-parcial';

@Component({
  selector: 'fs-simulador',
  imports: [FormularioCondicionesComponent, ResultadoFinanciacionComponent, AmortizacionParcialComponent],
  providers: [SimuladorStore, AmortizacionParcialStore],
  templateUrl: './simulador.html',
})
export class SimuladorPage {
  protected readonly store = inject(SimuladorStore);

  /** Préstamo de origen para la amortización parcial. */
  protected readonly origen = computed(() => {
    const resultado = this.store.resultado();
    return resultado ? { condiciones: this.store.condiciones(), resultado } : null;
  });
}
