/**
 * "¿Financiar o contado?": financiar solo si TAE < rentabilidad neta.
 */

import { Component, ElementRef, NO_ERRORS_SCHEMA, inject } from '@angular/core';
import { ReactiveFormsModule, type AbstractControl } from '@angular/forms';
import { Utils, type View } from '@nativescript/core';
import { ContadoStore, PorcentajePipe, mensajeError } from '@finsim/shared';
import { CampoDecimalComponent } from '../../ui/campo-decimal';
import { prepararCaptura } from '../../capturas';
import { anunciar, porcentaje } from '../../plataforma/accesibilidad';
import { ContenedorEnfocableDirective } from '../../ui/contenedor-enfocable';
import { FormularioCondicionesComponent } from '../../ui/formulario-condiciones';
import { ResultadoFinanciacionComponent } from '../../ui/resultado-financiacion';

@Component({
  selector: 'fs-contado',
  imports: [
    ReactiveFormsModule,
    CampoDecimalComponent,
    ContenedorEnfocableDirective,
    FormularioCondicionesComponent,
    ResultadoFinanciacionComponent,
    PorcentajePipe,
  ],
  providers: [ContadoStore],
  templateUrl: './contado.html',
  schemas: [NO_ERRORS_SCHEMA],
})
export class ContadoComponent {
  private readonly vista = inject<ElementRef<View>>(ElementRef);

  protected readonly store = inject(ContadoStore);

  constructor() {
    prepararCaptura(['contado'], () => this.calcular(), () => this.vista.nativeElement);
  }

  protected error(control: AbstractControl): string | null {
    return control.touched ? mensajeError(control.errors) : null;
  }

  protected calcular(): void {
    Utils.dismissSoftInput();
    this.store.calcular();
    const d = this.store.decision();
    anunciar(
      d &&
        `${d.recomendacion === 'financiar' ? 'Conviene financiar' : 'Mejor pagar al contado'}. ` +
          `TAE ${porcentaje(d.taeFinanciacion)}, rentabilidad neta ${porcentaje(d.rentabilidadNeta)}`,
    );
  }
}
