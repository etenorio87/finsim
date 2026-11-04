import { Component, NO_ERRORS_SCHEMA, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Utils, isAndroid, type EventData, type View } from '@nativescript/core';
import {
  ExportacionService,
  MonedaPipe,
  OPCIONES_FRECUENCIA,
  PorcentajePipe,
  SimuladorStore,
  TEXTO_PERIODO,
} from '@finsim/shared';
import { CampoDecimalComponent } from '../../ui/campo-decimal';

@Component({
  selector: 'fs-simulador',
  templateUrl: './simulador.html',
  imports: [ReactiveFormsModule, CampoDecimalComponent, MonedaPipe, PorcentajePipe],
  providers: [SimuladorStore],
  schemas: [NO_ERRORS_SCHEMA],
})
export class SimuladorComponent {
  protected readonly store = inject(SimuladorStore);
  private readonly exportacion = inject(ExportacionService);

  protected readonly frecuencias = OPCIONES_FRECUENCIA;
  protected readonly periodo = TEXTO_PERIODO;
  protected readonly exportando = signal<'excel' | 'pdf' | null>(null);
  protected readonly error = signal<string | null>(null);

  protected indiceFrecuencia(): number {
    return this.frecuencias.findIndex((f) => f.valor === this.store.formulario.controls.frecuencia.value);
  }

  protected cambiarFrecuencia(indice: number): void {
    const opcion = this.frecuencias[indice];
    if (opcion) this.store.formulario.controls.frecuencia.setValue(opcion.valor);
  }

  /**
   * Android: al cerrar el teclado, el foco pasa a la primera vista enfocable.
   * Si no es el contenedor, sería el primer campo (que se quedaría en modo edición).
   */
  protected contenedorEnfocable({ object }: EventData): void {
    if (!isAndroid) return;
    const nativo = (object as View).android as android.view.View;
    nativo.setFocusable(true);
    nativo.setFocusableInTouchMode(true);
  }

  protected simular(): void {
    // En iOS, tocar un botón no quita el foco del campo: sin esto se simularía
    // con el valor anterior al que se está escribiendo.
    Utils.dismissSoftInput();
    this.store.simular();
  }

  protected async exportar(formato: 'excel' | 'pdf'): Promise<void> {
    const resultado = this.store.resultado();
    if (!resultado || this.exportando()) return;
    this.exportando.set(formato);
    this.error.set(null);
    try {
      const condiciones = this.store.condiciones();
      await (formato === 'excel'
        ? this.exportacion.exportarExcel(condiciones, resultado)
        : this.exportacion.exportarPdf(condiciones, resultado));
    } catch (e) {
      console.error('[exportar]', e);
      this.error.set(`No se pudo exportar: ${e instanceof Error ? e.message : e}`);
    } finally {
      this.exportando.set(null);
    }
  }
}
