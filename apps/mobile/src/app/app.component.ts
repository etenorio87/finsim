import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { PageRouterOutlet } from '@nativescript/angular';
import { diagnosticoActivado, ejecutarDiagnostico } from './diagnostico';
import { compartir, escribirBytes } from './plataforma/compartir-archivo';

@Component({
  selector: 'fs-app',
  template: `<GridLayout><page-router-outlet></page-router-outlet></GridLayout>`,
  imports: [PageRouterOutlet],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppComponent {
  constructor() {
    // Aquí la actividad de Android ya existe (y con ella el intent de arranque)
    setTimeout(() => {
      if (diagnosticoActivado()) void ejecutarDiagnostico(escribirBytes, compartir);
    });
  }
}
