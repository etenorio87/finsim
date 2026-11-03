/**
 * Exportación del cuadro de amortización, independiente de la plataforma.
 *
 * Cada app registra su destino:
 *   web   → { provide: DESTINO_EXPORTACION, useClass: DescargaNavegador }
 *   móvil → { provide: DESTINO_EXPORTACION, useClass: CompartirNativo }
 */

import { Injectable, InjectionToken, inject } from '@angular/core';
import type { Condiciones, Resultado } from '@finsim/core';
import { generarExcel, generarPdf, type ArchivoExportado } from './generadores';

export interface DestinoExportacion {
  entregar(archivo: ArchivoExportado): Promise<void>;
}

export const DESTINO_EXPORTACION = new InjectionToken<DestinoExportacion>('DESTINO_EXPORTACION');

@Injectable({ providedIn: 'root' })
export class ExportacionService {
  private readonly destino = inject(DESTINO_EXPORTACION);

  async exportarExcel(condiciones: Condiciones, resultado: Resultado): Promise<void> {
    await this.destino.entregar(await generarExcel(condiciones, resultado));
  }

  async exportarPdf(condiciones: Condiciones, resultado: Resultado): Promise<void> {
    await this.destino.entregar(await generarPdf(condiciones, resultado));
  }
}
