/**
 * "¿Financiar o contado?": financiar solo si TAE < rentabilidad neta.
 */

import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, type AbstractControl } from '@angular/forms';
import { ContadoStore, PorcentajePipe, mensajeError } from '@finsim/shared';
import { CampoDecimalComponent } from '../../ui/campo-decimal';
import { FormularioCondicionesComponent } from '../../ui/formulario-condiciones';
import { ResultadoFinanciacionComponent } from '../../ui/resultado-financiacion';

@Component({
  selector: 'fs-contado',
  imports: [ReactiveFormsModule, CampoDecimalComponent, FormularioCondicionesComponent, ResultadoFinanciacionComponent, PorcentajePipe],
  providers: [ContadoStore],
  templateUrl: './contado.html',
})
export class ContadoPage {
  protected readonly store = inject(ContadoStore);

  protected error(control: AbstractControl): string | null {
    return control.touched ? mensajeError(control.errors) : null;
  }
}
