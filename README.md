# FinSim - Simulador Financiero

Herramienta de decisión para evaluar financiaciones con el móvil en la mano. Calcula el **precio real del dinero (TAE)**, compara ofertas y ayuda a decidir entre financiar o pagar al contado.

🔗 **Demo en vivo**: https://etenorio87.github.io/finsim/

## Propósito

Responder, con el móvil en la mano y en una tienda, a cuatro preguntas:

1. **¿Cuánto me cuesta realmente esta financiación?** (TAE real, coste total, tabla de amortización)
2. **¿Cuál de estas dos ofertas es mejor?** (comparación por TAE, no por cuota)
3. **¿Me conviene financiar o pagar al contado?** (si tengo dinero rindiendo)
4. **¿Cuánto ahorro si amortizo anticipadamente?** (comparación de estrategias: reducir cuota vs reducir plazo)

No es una calculadora genérica de préstamos. Es una herramienta de decisión que protege al usuario del sesgo comercial de comparar solo las cuotas mensuales.

## Tecnologías

- **React 19** + **TypeScript** - Interfaz de usuario
- **Vite 8** - Build tool y dev server
- **Tailwind CSS v4** - Estilos
- **Vitest** - Testing framework
- **Nx** + npm workspaces - Monorepo
- **GitHub Pages** - Hosting estático
- **GitHub Actions** - CI/CD

## Desarrollo

Monorepo con **npm workspaces + Nx**:

```bash
# Instalar dependencias (desde la raíz)
npm install

# Web en desarrollo con hot reload
npm run dev
# Abre http://localhost:5173/finsim/

# Tests de todos los proyectos (con caché de Nx)
npm test

# Typecheck y build de todos los proyectos
npm run typecheck
npm run build

# Ejecutar ejemplo del motor (CLI)
npm run ejemplo

# Tareas de un proyecto concreto
npx nx run @finsim/core:test
npx nx run @finsim/web-react:build
```

## Características

### ✅ Motor de cálculo
- Amortización francesa con funciones puras
- Cálculo preciso de TAE real (incluye comisiones)
- Manejo de comisiones en dos momentos: primera cuota o descontada del importe
- **Simulación de amortización parcial** con dos estrategias:
  - Reducir cuota: mantiene plazo, reduce pago mensual
  - Reducir plazo: mantiene cuota similar, termina antes
- 26 tests de aceptación validados contra documentos reales (BBVA, Cetelem)

### 🎨 Interfaz (3 vistas + 1 funcionalidad adicional)

#### 1. **Simular financiación** (vista por defecto)
Evalúa una oferta de financiación:
- TAE (precio real del dinero)
- Cuota mensual y coste total
- Tabla completa de amortización
- Saldo medio durante la vida del préstamo
- **Botón "Simular amortización parcial"** para explorar opciones de pago anticipado

#### 2. **Comparar ofertas**
Compara dos financiaciones:
- Ganadora por TAE (no por cuota baja)
- Aviso especial cuando los plazos difieren
- "Dinero más barato" vs "Mejor oferta" según contexto
- Detalle completo de ambas opciones

#### 3. **¿Financiar o contado?**
Decisión basada en rentabilidad de inversión:
- Compara TAE vs rentabilidad neta (después de impuestos)
- Regla: financiar solo si TAE < rentabilidad neta
- Cálculo de oportunidad con tu dinero invertido

#### 4. **Amortización parcial** (dentro de "Simular financiación")
Simula el efecto de amortizar anticipadamente:
- **Dos estrategias**: Reducir cuota o Reducir plazo
- Cuadro de ahorros: intereses, coste total, reducción de TAE
- Comparación lado a lado: situación actual vs después de amortizar
- Pedagogía: explica cuándo conviene cada estrategia
- Exportación a Excel/PDF de la comparación

### 🎯 Protecciones
- **Mobile-first**: diseñada para usar en tienda con el móvil
- **Jerarquía correcta**: TAE grande → Cuota mediana → Coste total pequeño
- **Acepta coma y punto** como separadores decimales
- **Formateo inteligente**: texto libre mientras escribes, formato al salir del campo
- **Protección contra sesgo comercial**: evita elegir solo por cuota baja

## Novedades (11/09/2026)

### ✨ Amortización Parcial
Nueva funcionalidad que permite simular el efecto de amortizar anticipadamente parte de un préstamo:

**Características**:
- **Dos estrategias optimizadas**:
  - **Reducir cuota**: Mantiene el mismo plazo pero reduce el pago mensual (libera liquidez)
  - **Reducir plazo**: Mantiene una cuota similar pero termina antes (minimiza intereses)
- **Algoritmo inteligente**: Búsqueda óptima del número de cuotas para mantener la cuota lo más cercana posible a la original en estrategia "reducir plazo"
- **Comparación visual lado a lado**: Situación actual vs después de amortizar
- **Cuadro de ahorros destacado**:
  - Ahorro en intereses
  - Ahorro en coste total
  - Reducción de TAE
  - Reducción de cuota (solo estrategia reducir cuota)
  - Cuotas eliminadas (solo estrategia reducir plazo)
- **Pedagogía financiera**: Explica cuándo conviene cada estrategia
- **5 nuevos tests** (AP1-AP5) que validan ambas estrategias y casos edge

**Implementación técnica**:
- Archivo core: `amortizacionParcial.ts` (~230 líneas)
- Componente UI: `AmortizacionParcial.tsx` (~260 líneas)
- Integrado en `SimuladorUnico.tsx` con botón expandible
- Reutiliza funciones existentes del motor (`calcularCuota()`, `calcular()`)
- Usa fórmula matemática directa para calcular número de cuotas óptimo

## Correcciones (28-29/08/2026)

### Issues bloqueantes resueltos
- **#1**: Campo TIN no admitía decimales ni dos cifras
  - ✅ Texto libre mientras escribes, formato al salir del campo
  - ✅ Test de regresión: `14,95` → `tin === 0.1495`
- **#2**: Campo Importe rechazaba punto decimal
  - ✅ Acepta coma Y punto como separadores
  - ✅ Test de regresión: `9854.64` → `importe === 9854.64`

### Correcciones técnicas
- **#3**: Test T2 con tolerancia relajada que ocultaba descuadre
  - ✅ Valor esperado corregido: `0.0669` → `0.0686`
  - ✅ Modelo `primeraCuota` validado contra Cetelem real
- **#4**: Discrepancia de 3 céntimos en la cuota
  - ✅ Test de regresión T-REG-4 agregado
  - ✅ Resuelto con corrección de #2

### Mejoras de UX
- **#5**: "Mejor oferta" demasiado rotundo con plazos distintos
  - ✅ Cambiado a "Dinero más barato" cuando plazos difieren
  - ✅ Explicación: "Son decisiones distintas, depende de qué hagas con la liquidez"

## Estructura

```
finsim/
├── libs/
│   └── core/                  # @finsim/core — motor de cálculo (funciones puras, sin DOM)
│       └── src/
│           ├── index.ts               # API pública del paquete
│           ├── types.ts
│           ├── amortizacion.ts
│           ├── motor.ts
│           ├── comparadores.ts
│           ├── amortizacionParcial.ts # Lógica de amortización parcial
│           ├── formato.ts             # Parseo y formato compartidos por todas las interfaces
│           └── *.test.ts              # 34 tests, todos pasan
├── apps/
│   └── web-react/             # @finsim/web-react — web actual (React), desplegada en GitHub Pages
│       └── src/ui/
│           ├── App.tsx
│           ├── components/
│           └── utils/exportar.ts      # Exportación a Excel/PDF
└── nx.json
```

> **En migración**: la web React se sustituirá por una web Angular (`apps/web`) y se añadirá
> la app móvil nativa con NativeScript + Angular (`apps/mobile`), ambas sobre `@finsim/core`.
> La versión React original queda etiquetada como `v1-react`.

## Roadmap

- [x] Setup inicial
- [x] **FASE 1**: Motor de cálculo + tests
  - [x] Implementar cálculo de cuota
  - [x] Implementar generación de cuadro
  - [x] Implementar cálculo de TAE
  - [x] Implementar comparadores
  - [x] Implementar amortización parcial
  - [x] Tests (T1-T6 + AP1-AP5) - 26/26 ✅
- [x] **FASE 2**: Interfaz de usuario
  - [x] Formulario de entrada mobile-first
  - [x] Visualización de resultados con jerarquía correcta (§5)
  - [x] Cuadro de amortización colapsable
  - [x] Simulador de financiación única
  - [x] Comparador de financiaciones
  - [x] Comparador financiar vs contado
  - [x] Simulador de amortización parcial (reducir cuota / reducir plazo)
- [x] **FASE 3**: Correcciones y refinamiento
  - [x] Corregir inputs de decimales (#1, #2)
  - [x] Corregir tests y especificación (#3, #4)
  - [x] Mejorar mensajes con plazos distintos (#5)
- [x] **Despliegue en producción**
  - [x] Configurar GitHub Actions
  - [x] Desplegar en GitHub Pages
  - [x] Tests de calidad

## Despliegue

- **Producción**: https://etenorio87.github.io/finsim/
- **CI/CD**: GitHub Actions (build y deploy automático en cada push)
- **Repositorio**: https://github.com/etenorio87/finsim

## Licencia

MIT
