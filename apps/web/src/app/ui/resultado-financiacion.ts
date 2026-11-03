/**
 * Tarjeta de resultado de una financiación.
 *
 * Jerarquía de la especificación (§5): 1) TAE grande, 2) cuota mediana,
 * 3) costes pequeños. La TAE decide; la cuota es una restricción de presupuesto.
 */

import { Component, computed, inject, input, signal } from '@angular/core';
import type { Condiciones, Resultado } from '@finsim/core';
import { ExportacionService, MonedaPipe, PorcentajePipe, TEXTO_PERIODO } from '@finsim/shared';

export type AcentoResultado = 'primary' | 'accent' | 'positive';

const ESTILOS: Record<AcentoResultado, { borde: string; texto: string; fondo: string; hover: string }> = {
  primary: { borde: 'border-primary', texto: 'text-primary', fondo: 'bg-primary/5', hover: 'hover:bg-primary/5' },
  accent: { borde: 'border-accent', texto: 'text-accent', fondo: 'bg-accent/5', hover: 'hover:bg-accent/5' },
  positive: { borde: 'border-positive', texto: 'text-positive', fondo: 'bg-positive/5', hover: 'hover:bg-positive/5' },
};

@Component({
  selector: 'fs-resultado-financiacion',
  imports: [MonedaPipe, PorcentajePipe],
  templateUrl: './resultado-financiacion.html',
})
export class ResultadoFinanciacionComponent {
  private readonly exportacion = inject(ExportacionService);

  readonly resultado = input.required<Resultado>();
  readonly condiciones = input.required<Condiciones>();
  readonly etiqueta = input<string>();
  readonly acento = input<AcentoResultado>('primary');
  readonly esGanadora = input(false);
  readonly textoDistintivo = input('Mejor oferta');

  protected readonly estilos = computed(() => ESTILOS[this.acento()]);
  protected readonly periodo = computed(() => TEXTO_PERIODO[this.condiciones().frecuencia]);
  protected readonly cuadroVisible = signal(false);
  protected readonly exportando = signal<'excel' | 'pdf' | null>(null);
  protected readonly errorExportacion = signal<string | null>(null);

  protected alternarCuadro(): void {
    this.cuadroVisible.update((v) => !v);
  }

  protected async exportar(formato: 'excel' | 'pdf'): Promise<void> {
    this.errorExportacion.set(null);
    this.exportando.set(formato);
    try {
      if (formato === 'excel') {
        await this.exportacion.exportarExcel(this.condiciones(), this.resultado());
      } else {
        await this.exportacion.exportarPdf(this.condiciones(), this.resultado());
      }
    } catch {
      this.errorExportacion.set('No se ha podido generar el archivo. Inténtalo de nuevo.');
    } finally {
      this.exportando.set(null);
    }
  }
}
