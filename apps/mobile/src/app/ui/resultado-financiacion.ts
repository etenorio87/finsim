/**
 * Tarjeta de resultado de una financiación.
 *
 * Jerarquía de la especificación (§5): 1) TAE grande, 2) cuota mediana,
 * 3) costes pequeños. La TAE decide; la cuota es una restricción de presupuesto.
 */

import { Component, NO_ERRORS_SCHEMA, computed, inject, input, signal } from '@angular/core';
import type { Condiciones, Resultado } from '@finsim/core';
import { ExportacionService, MonedaPipe, PorcentajePipe, TEXTO_PERIODO } from '@finsim/shared';

export type AcentoResultado = 'primary' | 'accent' | 'positive';

@Component({
  selector: 'fs-resultado-financiacion',
  imports: [MonedaPipe, PorcentajePipe],
  templateUrl: './resultado-financiacion.html',
  schemas: [NO_ERRORS_SCHEMA],
})
export class ResultadoFinanciacionComponent {
  private readonly exportacion = inject(ExportacionService);

  readonly resultado = input.required<Resultado>();
  readonly condiciones = input.required<Condiciones>();
  readonly etiqueta = input<string>();
  readonly acento = input<AcentoResultado>('primary');
  readonly esGanadora = input(false);
  readonly textoDistintivo = input('Mejor oferta');

  protected readonly periodo = computed(() => TEXTO_PERIODO[this.condiciones().frecuencia]);
  protected readonly cuadroVisible = signal(false);
  protected readonly exportando = signal<'excel' | 'pdf' | null>(null);
  protected readonly errorExportacion = signal<string | null>(null);

  protected alternarCuadro(): void {
    this.cuadroVisible.update((v) => !v);
  }

  protected async exportar(formato: 'excel' | 'pdf'): Promise<void> {
    if (this.exportando()) return;
    this.errorExportacion.set(null);
    this.exportando.set(formato);
    try {
      if (formato === 'excel') {
        await this.exportacion.exportarExcel(this.condiciones(), this.resultado());
      } else {
        await this.exportacion.exportarPdf(this.condiciones(), this.resultado());
      }
    } catch (e) {
      console.error('[exportar]', e);
      this.errorExportacion.set('No se ha podido generar el archivo. Inténtalo de nuevo.');
    } finally {
      this.exportando.set(null);
    }
  }
}
