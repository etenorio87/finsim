# Historial de cambios

## Migración a plataforma Angular

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
