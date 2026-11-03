import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { DESTINO_EXPORTACION } from '@finsim/shared';
import { DescargaNavegador } from './plataforma/descarga-navegador';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    // En la web, exportar = descargar el archivo
    { provide: DESTINO_EXPORTACION, useClass: DescargaNavegador },
  ],
};
