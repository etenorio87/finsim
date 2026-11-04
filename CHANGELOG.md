# Historial de cambios

## Migración a plataforma Angular

### 04/11/2026 — Fase 5: app móvil completa

- `@finsim/mobile` con las cuatro funcionalidades de la web en tres pestañas: Simular (con amortización parcial), Comparar y Contado. Mismas cifras que la web, verificadas en Android
- Componentes nativos: formulario de condiciones con comisiones, tarjeta de resultado con cuadro y exportación, selector de opciones propio (igual en iOS y Android)
- **Separador de miles al escribir**: `parseDecimal("1.234,56")` → 1234,56 (antes 1,234). Con un único separador sigue siendo decimal: `"9854.64"` → 9854,64
- Campo decimal en el móvil: comunica el valor mientras se escribe (en Android, cerrar el teclado no quita el foco) y "Hecho" sale del campo. Opción `notificar` en `CampoDecimalBase.alEscribir`; la web no cambia

### 04/11/2026 — Fase 4: prueba técnica de NativeScript

- Nueva app `@finsim/mobile` (NativeScript 9 + Angular 22, sin zone.js) con la pantalla del simulador sobre `@finsim/shared`. Probada en el simulador de iOS y el emulador de Android: cálculo, formato, Excel, PDF y menú de compartir. Resultados en [apps/mobile/README.md](apps/mobile/README.md)
- **El formato es-ES ya no depende de `Intl`**: el V8 de NativeScript no lo incluye y mostraba `10000` en vez de `10.000,00`. `formatearNumero()` y `formatearFecha()` en `@finsim/core` dan el mismo texto que `Intl` (tests contra `Intl` con más de 10.000 casos), así que la web no cambia
- Compartir archivos con código propio: `UIActivityViewController` en iOS y `FileProvider` + `ACTION_SEND` en Android
- Campo decimal nativo: teclado decimal en iOS, coma y punto en Android, selección del valor al enfocar
- `npm run ios` y `npm run android` desde la raíz; `typecheck` de la app en la CI

### 03/11/2026 — Fase 3: la web Angular pasa a producción

- **https://etenorio87.github.io/finsim/ sirve la web Angular.** Cada pantalla tiene su enlace: `/finsim/simular`, `/finsim/comparar`, `/finsim/contado`. Funcionan los enlaces directos y la recarga gracias a `404.html`
- Paridad verificada contra la v1 con los mismos datos: simulador (5 escenarios, resumen y cuadro completo), comparador (4), financiar o contado (3) y amortización parcial (5, con las dos estrategias). Las cifras coinciden; solo cambian los textos mejorados en las fases 1 y 2 y el redondeo de 5,925 % (la v1 mostraba 5,92 % y la v2 muestra 5,93 %)
- **Corregido: el campo decimal podía pegar lo escrito tras el valor anterior.** Al enfocar, el texto pasaba de "6,00" a "6" en el siguiente render; si se escribía antes (autocompletado, tecleo muy rápido), "12,5" acababa como "612,5". Ahora el cambio y la selección ocurren en el mismo evento
- Corregido respecto a la v1: en "Rentabilidad" y "Tipo impositivo", escribir un decimal con punto ("7.5") se convertía en "05"
- Eliminada la web React (`apps/web-react`); sigue disponible en la etiqueta `v1-react`
- `npm run dev` arranca la web Angular; `npm run preview` sirve el artefacto de despliegue como GitHub Pages

### 03/11/2026 — Seguridad de dependencias

- **`xlsx` 0.18.5 → 0.20.3**, instalado desde el CDN oficial de SheetJS (la versión de npm está abandonada). Corrige Prototype Pollution (GHSA-4r6h-8v6p-xvw6) y ReDoS (GHSA-5pgg-2g8v-p4x9). Afecta a la web en producción
- **`dompurify` 3.4.15 → 3.4.17** (dependencia de jsPDF): corrige cinco avisos críticos de XSS
- `npm audit --omit=dev`: 0 vulnerabilidades. En desarrollo quedan avisos moderados de `minimatch` (DoS por patrones glob); Nx 24 fija esa versión y no afectan a lo que se publica
- Vitest 4.1.11 → 4.1.12
- CI y despliegue con Node 24 (Node 20 ya no tiene soporte)

### 03/11/2026 — Fase 2: web Angular

- Nueva app `@finsim/web` (Angular 22, zoneless, esbuild, Tailwind v4) con las cuatro funcionalidades de la v1 sobre `@finsim/shared`
- Cada vista tiene su URL (`/simular`, `/comparar`, `/contado`) y su título
- Carga inicial de 88 kB transferidos (la v1, 302 kB): cada pantalla y las librerías de exportación se cargan bajo demanda
- Sombras del diseño (`shadow-soft`, `shadow-card`, `shadow-hover`) definidas en `@theme`: en la v1 estaban en `tailwind.config.js`, que Tailwind v4 no lee, y nunca se aplicaron
- Mejoras de accesibilidad: etiquetas asociadas a sus campos, `aria-expanded` en el cuadro, `aria-current` en la navegación
- Si cambia el préstamo con el panel de amortización parcial abierto, se conserva lo escrito
- Herramientas de build: Vite 8.2.2 → 8.3.5 (requisito de `@angular/build`; corrige una vulnerabilidad alta de Vite)

### 03/11/2026 — Corrección: aviso de plazos distintos

- **El aviso compara la duración, no el número de cuotas.** Antes, 12 cuotas mensuales (1 año) frente a 12 anuales (12 años) no avisaban, y 24 mensuales frente a 8 trimestrales (2 años las dos) sí. Afecta también a la web en producción. Tests T6c y T6d; especificación aclarada en §5 y T6
- Nueva función `duracionEnMeses()` en `@finsim/core`

### 03/11/2026 — Fase 1: capa compartida

- Nuevo paquete `@finsim/shared` (Angular 22): stores con signals por pantalla, formularios tipados, `CampoDecimalBase` (`ControlValueAccessor`), pipes `moneda` y `porcentaje` y exportación a Excel/PDF con destino por plataforma
- Sin dependencias de DOM: typecheck sin la librería DOM, tests en Node y compilación AOT parcial con `ngc`
- Texto del aviso de plazos según la duración real (#5): "…estarás endeudado 4 años más" si la oferta más barata es la más larga, "…y además terminas 4 años antes" si es la más corta
- Correcciones que llegarán con la web Angular: el periodo de la cuota depende de la frecuencia ("cada trimestre"); la amortización parcial no recalcula con datos inválidos; con el formulario inválido el resultado se oculta; formato es-ES (`443,21 €`)
- TypeScript 7.0 → 6.0.3, requisito de Angular 22

### 03/11/2026 — Fase 0: monorepo

- Proyecto convertido en monorepo **Nx + npm workspaces**
- Motor de cálculo extraído al paquete `@finsim/core` (`libs/core`), comprobado sin la librería DOM para poder usarlo desde NativeScript
- Nuevo `formato.ts` en el core: `parseDecimal`, `normalizarDecimal`, `formatearMoneda`, `formatearPorcentaje`, con tests de regresión de #1 y #2 (34 tests en total)
- Web React movida a `apps/web-react`; la versión original queda etiquetada como `v1-react`
- CI en cada pull request; el despliegue ejecuta los tests antes del build y solo se dispara por cambios en la web o el motor

---

## v1 — Web React

### 11/09/2026 — Amortización parcial y exportación

**Exportación** del cuadro de amortización a Excel y PDF.

**Amortización parcial**: simula el efecto de amortizar anticipadamente parte de un préstamo.

- **Dos estrategias**:
  - **Reducir cuota**: mantiene el plazo y reduce el pago mensual (libera liquidez)
  - **Reducir plazo**: mantiene una cuota similar y termina antes (minimiza intereses)
- Búsqueda del número de cuotas que mantiene la cuota lo más cercana posible a la original en "reducir plazo"
- Comparación lado a lado: situación actual frente a después de amortizar
- Cuadro de ahorros: intereses, coste total, reducción de TAE, reducción de cuota o cuotas eliminadas
- Explicación de cuándo conviene cada estrategia
- 5 tests nuevos (AP1–AP5)

### 28–29/08/2026 — Primera versión y correcciones

Motor de cálculo con tests T1–T6, interfaz mobile-first y despliegue en GitHub Pages.

**Issues bloqueantes resueltos** (detalle en [ISSUES.md](ISSUES.md)):

- **#1** — El campo TIN no admitía decimales ni dos cifras → texto libre mientras escribes, formato al salir del campo. Regresión: `14,95` → `tin === 0.1495`
- **#2** — El campo Importe rechazaba el punto decimal → acepta coma y punto. Regresión: `9854.64` → `importe === 9854.64`

**Correcciones técnicas**:

- **#3** — El test T2 tenía una tolerancia relajada que ocultaba un descuadre → valor esperado corregido de `0.0669` a `0.0686`; modelo `primeraCuota` validado contra un caso real de Cetelem
- **#4** — Discrepancia de 3 céntimos en la cuota → test de regresión T-REG-4; resuelto con la corrección de #2

**Mejoras de UX**:

- **#5** — "Mejor oferta" era demasiado rotundo con plazos distintos → "Dinero más barato", con la explicación: "Son decisiones distintas, depende de qué hagas con la liquidez"
