/**
 * Cuadro de amortización a pantalla completa.
 *
 * Es una lista nativa (RecyclerView / UITableView): solo existen las filas
 * visibles y se reutilizan al desplazarse. Dentro de la tarjeta, como en la
 * web, 360 cuotas eran 1800 etiquetas y la app se quedaba congelada ~5 s.
 */

import { Component, NO_ERRORS_SCHEMA, inject } from '@angular/core';
import { ListViewComponent, ModalDialogParams } from '@nativescript/angular';
import type { Resultado } from '@finsim/core';
import { MonedaPipe } from '@finsim/shared';
import { moneda } from '../plataforma/accesibilidad';

export type FilaCuadro = NonNullable<Resultado['cuadro']>[number];

export interface ContextoCuadro {
  filas: FilaCuadro[];
  /** p. ej. "24 cuotas · cada mes" */
  subtitulo: string;
}

@Component({
  selector: 'fs-cuadro-amortizacion',
  imports: [ListViewComponent, MonedaPipe],
  template: `
    <GridLayout rows="auto, auto, *" class="modal-cuadro" androidOverflowEdge="none">
      <GridLayout row="0" columns="*, auto" class="cabecera-modal">
        <StackLayout col="0">
          <Label text="Cuadro de amortización" class="titulo" accessibilityRole="header" textWrap="true"></Label>
          <Label [text]="contexto.subtitulo" class="ayuda"></Label>
        </StackLayout>
        <Label col="1" text="Cerrar" (tap)="cerrar()" class="enlace cerrar-modal" [accessible]="true" accessibilityRole="button"></Label>
      </GridLayout>

      <GridLayout row="1" columns="36, *, *, *, *" class="fila-cuadro cabecera-cuadro" [accessible]="false">
        <Label col="0" text="#"></Label>
        <Label col="1" text="Cuota" class="derecha"></Label>
        <Label col="2" text="Interés" class="derecha"></Label>
        <Label col="3" text="Capital" class="derecha"></Label>
        <Label col="4" text="Pendiente" class="derecha"></Label>
      </GridLayout>

      <ListView row="2" [items]="contexto.filas" class="lista-cuadro">
        <ng-template let-fila="item" let-par="even">
          <GridLayout columns="36, *, *, *, *" [class]="par ? 'fila-cuadro fila-par' : 'fila-cuadro'"
            [accessible]="true" [accessibilityLabel]="descripcion(fila)">
            <Label col="0" [text]="fila.numero"></Label>
            <Label col="1" [text]="fila.cuota | moneda" class="derecha"></Label>
            <Label col="2" [text]="fila.interes | moneda" class="derecha texto-negative"></Label>
            <Label col="3" [text]="fila.capital | moneda" class="derecha texto-positive"></Label>
            <Label col="4" [text]="fila.capitalPendiente | moneda" class="derecha negrita"></Label>
          </GridLayout>
        </ng-template>
      </ListView>
    </GridLayout>
  `,
  schemas: [NO_ERRORS_SCHEMA],
})
export class CuadroAmortizacionComponent {
  private readonly params = inject(ModalDialogParams);
  protected readonly contexto = this.params.context as ContextoCuadro;

  /** Una fila se lee entera con el lector de pantalla, no celda a celda. */
  protected descripcion(fila: FilaCuadro): string {
    return (
      `Cuota ${fila.numero}: ${moneda(fila.cuota)}. Interés ${moneda(fila.interes)}, ` +
      `capital ${moneda(fila.capital)}, pendiente ${moneda(fila.capitalPendiente)}`
    );
  }

  protected cerrar(): void {
    this.params.closeCallback();
  }
}
