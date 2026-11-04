/**
 * "Simular financiación": TAE, cuota, costes y cuadro de una oferta, con la
 * amortización parcial del préstamo simulado.
 */

import { Component, NO_ERRORS_SCHEMA, computed, inject } from '@angular/core';
import { Utils } from '@nativescript/core';
import { AmortizacionParcialStore, SimuladorStore } from '@finsim/shared';
import { anunciar, moneda, porcentaje } from '../../plataforma/accesibilidad';
import { ContenedorEnfocableDirective } from '../../ui/contenedor-enfocable';
import { FormularioCondicionesComponent } from '../../ui/formulario-condiciones';
import { ResultadoFinanciacionComponent } from '../../ui/resultado-financiacion';
import { AmortizacionParcialComponent } from '../amortizacion-parcial/amortizacion-parcial';

@Component({
  selector: 'fs-simulador',
  imports: [ContenedorEnfocableDirective, FormularioCondicionesComponent, ResultadoFinanciacionComponent, AmortizacionParcialComponent],
  providers: [SimuladorStore, AmortizacionParcialStore],
  templateUrl: './simulador.html',
  schemas: [NO_ERRORS_SCHEMA],
})
export class SimuladorComponent {
  protected readonly store = inject(SimuladorStore);

  /** Préstamo de origen para la amortización parcial. */
  protected readonly origen = computed(() => {
    const resultado = this.store.resultado();
    return resultado ? { condiciones: this.store.condiciones(), resultado } : null;
  });

  protected simular(): void {
    // En iOS, tocar un botón no quita el foco del campo: sin esto se simularía
    // con el valor anterior al que se está escribiendo.
    Utils.dismissSoftInput();
    this.store.simular();
    const r = this.store.resultado();
    anunciar(r && `TAE ${porcentaje(r.tae)}, cuota ${moneda(r.cuota)}`);
  }
}
