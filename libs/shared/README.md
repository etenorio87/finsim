# @finsim/shared

Capa de presentación compartida entre la **web Angular** y la **app NativeScript**: todo lo que no es una plantilla.

```
@finsim/core  →  @finsim/shared  →  apps/web     (HTML + Tailwind)
                                 →  apps/mobile  (elementos nativos)
```

**Sin dependencias de DOM.** El typecheck se hace sin la lib DOM y los tests se ejecutan en Node: si algo dependiera del navegador, fallaría aquí y no en el móvil.

## Contenido

| Módulo | Qué aporta |
|---|---|
| `textos` | Etiquetas (frecuencia, periodo, comisión, estrategia), opciones para selectores y mensajes de la comparación |
| `valores-iniciales` | Condiciones con las que arranca cada pantalla (tipos en decimal) |
| `formularios` | `FormGroup` tipados de condiciones, inversión y amortización parcial; validadores y `mensajeError()` |
| `estado` | Un store por pantalla: `SimuladorStore`, `ComparadorStore`, `ContadoStore`, `AmortizacionParcialStore` |
| `campo-decimal` | `CampoDecimalBase`: `ControlValueAccessor` con "texto libre mientras escribes, formato al salir" |
| `pipes` | `moneda` (`443,21 €`) y `porcentaje` (`6,17 %`) |
| `exportacion` | Generación de Excel/PDF como bytes y `ExportacionService` con destino por plataforma |

## Uso desde una app

### Stores: uno por pantalla

Se proveen en el componente de la pantalla (no son singletons):

```ts
@Component({
  selector: 'app-simulador',
  providers: [SimuladorStore, AmortizacionParcialStore],
  imports: [ReactiveFormsModule, MonedaPipe, PorcentajePipe],
  templateUrl: './simulador.component.html',
})
export class SimuladorComponent {
  protected readonly store = inject(SimuladorStore);
}
```

```html
<form [formGroup]="store.formulario">…</form>
<button (click)="store.simular()">Simular financiación</button>

@if (store.resultado(); as r) {
  <p>{{ r.tae | porcentaje }}</p>
}
```

El patrón de todos los stores: `formulario` (Reactive Forms) → `resultado` (`computed`). No se calcula nada hasta la acción del usuario (`simular()`, `comparar()`, `calcular()`); a partir de ahí se recalcula con cada cambio, y si el formulario deja de ser válido el resultado pasa a `null`.

### Campo decimal: cada plataforma aporta solo la vista

```ts
// Web
@Component({
  selector: 'app-campo-decimal',
  template: `<input inputmode="decimal" [value]="texto()" [disabled]="deshabilitado()"
               (focus)="alEnfocar()" (input)="alEscribir($any($event.target).value)" (blur)="alSalir()" />`,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: CampoDecimalComponent, multi: true }],
})
export class CampoDecimalComponent extends CampoDecimalBase {}

// NativeScript
@Component({
  selector: 'app-campo-decimal',
  template: `<TextField keyboardType="number" [text]="texto()" [isEnabled]="!deshabilitado()"
               (focus)="alEnfocar()" (textChange)="alEscribir($event.value)" (blur)="alSalir()" />`,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: CampoDecimalComponent, multi: true }],
})
export class CampoDecimalComponent extends CampoDecimalBase {}
```

```html
<app-campo-decimal formControlName="tin" modo="porcentaje" />
```

Modos: `importe` (`10.000,00`), `porcentaje` (decimal del dominio, se edita como `5,45`) y `entero` (`24`).

### Exportación: la app decide el destino

```ts
// Web: descarga
providers: [{ provide: DESTINO_EXPORTACION, useValue: {
  async entregar({ nombre, tipoMime, datos }) {
    const url = URL.createObjectURL(new Blob([datos], { type: tipoMime }));
    const a = Object.assign(document.createElement('a'), { href: url, download: nombre });
    a.click();
    URL.revokeObjectURL(url);
  },
}}]

// Móvil: guardar en temporal y abrir el menú de compartir (Fase 4)
```

jsPDF y SheetJS se cargan con `import()` dinámico solo al exportar.

## Tareas

```bash
npx nx run @finsim/shared:test       # tests en Node (sin DOM)
npx nx run @finsim/shared:typecheck  # tsc sin lib DOM
npx nx run @finsim/shared:build      # compilación AOT parcial (ngc)
```
