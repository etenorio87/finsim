/**
 * "¿Financiar o contado?": financiar solo si TAE < rentabilidad neta.
 */

import { Component, NO_ERRORS_SCHEMA, inject } from '@angular/core';
import { ReactiveFormsModule, type AbstractControl } from '@angular/forms';
import { Utils } from '@nativescript/core';
import { ContadoStore, PorcentajePipe, mensajeError } from '@finsim/shared';
import { CampoDecimalComponent } from '../../ui/campo-decimal';
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
  protected readonly store = inject(ContadoStore);

  protected error(control: AbstractControl): string | null {
    return control.touched ? mensajeError(control.errors) : null;
  }

  protected calcular(): void {
    Utils.dismissSoftInput();
    this.store.calcular();
  }
}
