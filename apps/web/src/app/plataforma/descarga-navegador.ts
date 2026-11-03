/**
 * Destino de exportación en la web: descarga el archivo en el navegador.
 * (En la app móvil, el equivalente abre el menú nativo de compartir.)
 */

import { Injectable, inject, DOCUMENT } from '@angular/core';
import type { ArchivoExportado, DestinoExportacion } from '@finsim/shared';

@Injectable()
export class DescargaNavegador implements DestinoExportacion {
  private readonly document = inject(DOCUMENT);

  async entregar({ nombre, tipoMime, datos }: ArchivoExportado): Promise<void> {
    const url = URL.createObjectURL(new Blob([datos], { type: tipoMime }));
    const enlace = this.document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
    // Se libera en el siguiente ciclo para no cancelar la descarga en Safari
    setTimeout(() => URL.revokeObjectURL(url));
  }
}
