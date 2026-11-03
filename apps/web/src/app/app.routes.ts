import type { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'simular' },
  {
    path: 'simular',
    title: 'Simular financiación · FinSim',
    loadComponent: () => import('./paginas/simulador/simulador').then((m) => m.SimuladorPage),
  },
  {
    path: 'comparar',
    title: 'Comparar ofertas · FinSim',
    loadComponent: () => import('./paginas/comparador/comparador').then((m) => m.ComparadorPage),
  },
  {
    path: 'contado',
    title: '¿Financiar o contado? · FinSim',
    loadComponent: () => import('./paginas/contado/contado').then((m) => m.ContadoPage),
  },
  { path: '**', redirectTo: 'simular' },
];
