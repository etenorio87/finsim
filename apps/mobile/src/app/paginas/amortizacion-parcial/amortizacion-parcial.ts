/**
 * Amortización parcial: reducir cuota frente a reducir plazo.
 * Se abre desde "Simular financiación" para el préstamo simulado.
 */

import { Component, ElementRef, NO_ERRORS_SCHEMA, effect, inject, input, output, untracked } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Utils, type View } from '@nativescript/core';
import { AmortizacionParcialStore, MonedaPipe, PorcentajePipe, type OrigenAmortizacion } from '@finsim/shared';
import { anunciar, moneda } from '../../plataforma/accesibilidad';
import { prepararCaptura } from '../../capturas';
import { CampoDecimalComponent } from '../../ui/campo-decimal';
import { ResultadoFinanciacionComponent } from '../../ui/resultado-financiacion';

@Component({
  selector: 'fs-amortizacion-parcial',
  imports: [ReactiveFormsModule, CampoDecimalComponent, ResultadoFinanciacionComponent, MonedaPipe, PorcentajePipe],
  templateUrl: './amortizacion-parcial.html',
  schemas: [NO_ERRORS_SCHEMA],
})
export class AmortizacionParcialComponent {
  private readonly vista = inject<ElementRef<View>>(ElementRef);

  protected readonly store = inject(AmortizacionParcialStore);

  readonly origen = input.required<OrigenAmortizacion>();
  readonly cerrar = output<void>();

  protected readonly estrategias = [
    { valor: 'reducirCuota', titulo: 'Reducir cuota', texto: 'Mismo número de cuotas, pagas menos cada mes' },
    { valor: 'reducirPlazo', titulo: 'Reducir plazo', texto: 'Cuota similar, terminas de pagar antes' },
  ] as const;

  constructor() {
    prepararCaptura(['amortizacion'], () => this.simular(), () => this.vista.nativeElement);
    // Si cambia el préstamo simulado, el panel se actualiza conservando lo escrito
    // (untracked: abrir() lee el estado del store y no debe convertirse en dependencia)
    effect(() => {
      const origen = this.origen();
      untracked(() => this.store.abrir(origen));
    });
  }

  protected elegirEstrategia(valor: 'reducirCuota' | 'reducirPlazo'): void {
    this.store.formulario()?.controls.estrategia.setValue(valor);
  }

  protected simular(): void {
    Utils.dismissSoftInput();
    this.store.simular();
    const r = this.store.resultado();
    anunciar(r ? `Ahorro en intereses: ${moneda(r.ahorro.intereses)}` : this.store.error());
  }

  protected alCerrar(): void {
    this.store.cerrar();
    this.cerrar.emit();
  }
}
