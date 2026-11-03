import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'fs-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App {
  protected readonly vistas = [
    { ruta: '/simular', etiqueta: 'Simular financiación' },
    { ruta: '/comparar', etiqueta: 'Comparar ofertas' },
    { ruta: '/contado', etiqueta: '¿Financiar o contado?' },
  ];
}
