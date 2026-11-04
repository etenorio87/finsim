import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/simular', pathMatch: 'full' },
  { path: 'simular', loadComponent: () => import('./paginas/simulador/simulador').then((m) => m.SimuladorComponent) },
];
