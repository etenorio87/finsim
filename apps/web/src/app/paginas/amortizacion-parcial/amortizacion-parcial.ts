/**
 * Panel de amortización parcial: reducir cuota frente a reducir plazo.
 * Se abre desde "Simular financiación" para el préstamo simulado.
 */

import { Component, effect, inject, input, output, untracked } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AmortizacionParcialStore, MonedaPipe, PorcentajePipe, type OrigenAmortizacion } from '@finsim/shared';
import { CampoDecimalComponent } from '../../ui/campo-decimal';
import { ResultadoFinanciacionComponent } from '../../ui/resultado-financiacion';

@Component({
  selector: 'fs-amortizacion-parcial',
  imports: [ReactiveFormsModule, CampoDecimalComponent, ResultadoFinanciacionComponent, MonedaPipe, PorcentajePipe],
  templateUrl: './amortizacion-parcial.html',
})
export class AmortizacionParcialComponent {
  protected readonly store = inject(AmortizacionParcialStore);

  readonly origen = input.required<OrigenAmortizacion>();
  readonly cerrar = output<void>();

  constructor() {
    // Si cambia el préstamo simulado, el panel se actualiza conservando lo escrito
    // (untracked: abrir() lee el estado del store y no debe convertirse en dependencia)
    effect(() => {
      const origen = this.origen();
      untracked(() => this.store.abrir(origen));
    });
  }

  protected alCerrar(): void {
    this.store.cerrar();
    this.cerrar.emit();
  }
}
