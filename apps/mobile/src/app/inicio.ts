/**
 * Pantalla principal: tres pestañas (Simular, Comparar, Contado). Cada una
 * tiene su propio estado: cambiar de pestaña no pierde lo escrito.
 */

import { Component, NO_ERRORS_SCHEMA, inject } from '@angular/core';
import { TabViewDirective, TabViewItemDirective } from '@nativescript/angular';
import { Page } from '@nativescript/core';
import { ComparadorComponent } from './paginas/comparador/comparador';
import { ContadoComponent } from './paginas/contado/contado';
import { SimuladorComponent } from './paginas/simulador/simulador';

@Component({
  selector: 'fs-inicio',
  imports: [TabViewDirective, TabViewItemDirective, SimuladorComponent, ComparadorComponent, ContadoComponent],
  template: `
    <TabView androidTabsPosition="bottom" class="pestanas">
      <GridLayout *tabItem="{ title: 'Simular', textTransform: 'none' }"><fs-simulador></fs-simulador></GridLayout>
      <GridLayout *tabItem="{ title: 'Comparar', textTransform: 'none' }"><fs-comparador></fs-comparador></GridLayout>
      <GridLayout *tabItem="{ title: 'Contado', textTransform: 'none' }"><fs-contado></fs-contado></GridLayout>
    </TabView>
  `,
  schemas: [NO_ERRORS_SCHEMA],
})
export class InicioComponent {
  constructor() {
    // Cada pestaña lleva su cabecera; la barra superior solo ocuparía espacio
    inject(Page).actionBarHidden = true;
  }
}
