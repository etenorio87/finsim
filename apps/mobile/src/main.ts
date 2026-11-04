import { bootstrapApplication, provideNativeScriptRouter, runNativeScriptAngularApp } from '@nativescript/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { DESTINO_EXPORTACION } from '@finsim/shared';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { CompartirArchivo } from './app/plataforma/compartir-archivo';
import { configurarTeclado } from './app/plataforma/teclado';

configurarTeclado();

runNativeScriptAngularApp({
  appModuleBootstrap: () =>
    bootstrapApplication(AppComponent, {
      providers: [
        provideNativeScriptRouter(routes),
        provideZonelessChangeDetection(),
        { provide: DESTINO_EXPORTACION, useClass: CompartirArchivo },
      ],
    }),
});

