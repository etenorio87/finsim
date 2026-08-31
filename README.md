# FinSim - Simulador Financiero

Herramienta de decisión para evaluar financiaciones con el móvil en la mano. Calcula el **precio real del dinero (TAE)**, compara ofertas y ayuda a decidir entre financiar o pagar al contado.

🔗 **Demo en vivo**: https://etenorio87.github.io/finsim/

## Propósito

Responder, con el móvil en la mano y en una tienda, a tres preguntas:

1. **¿Cuánto me cuesta realmente esta financiación?** (TAE real, coste total, tabla de amortización)
2. **¿Cuál de estas dos ofertas es mejor?** (comparación por TAE, no por cuota)
3. **¿Me conviene financiar o pagar al contado?** (si tengo dinero rindiendo)

No es una calculadora genérica de préstamos. Es una herramienta de decisión que protege al usuario del sesgo comercial de comparar solo las cuotas mensuales.

## Tecnologías

- **React 19** + **TypeScript** - Interfaz de usuario
- **Vite 8** - Build tool y dev server
- **Tailwind CSS v4** - Estilos
- **Vitest** - Testing framework
- **GitHub Pages** - Hosting estático
- **GitHub Actions** - CI/CD

## Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo con hot reload
npm run dev
# Abre http://localhost:5173/finsim/

# Ejecutar tests en modo watch
npm test

# Ejecutar tests una vez
npm run test:run

# Build para producción
npm run build

# Preview del build de producción
npm run preview

# Ejecutar ejemplo del motor (CLI)
npx tsx src/core/ejemplo.ts
```

## Características

### ✅ Motor de cálculo
- Amortización francesa con funciones puras
- Cálculo preciso de TAE real (incluye comisiones)
- Manejo de comisiones en dos momentos: primera cuota o descontada del importe
- 21 tests de aceptación validados contra documentos reales (BBVA, Cetelem)

### 🎨 Interfaz (3 vistas)

#### 1. **Simular financiación** (vista por defecto)
Evalúa una oferta de financiación:
- TAE (precio real del dinero)
- Cuota mensual y coste total
- Tabla completa de amortización
- Saldo medio durante la vida del préstamo

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

### 🎯 Protecciones
- **Mobile-first**: diseñada para usar en tienda con el móvil
- **Jerarquía correcta**: TAE grande → Cuota mediana → Coste total pequeño
- **Acepta coma y punto** como separadores decimales
- **Formateo inteligente**: texto libre mientras escribes, formato al salir del campo
- **Protección contra sesgo comercial**: evita elegir solo por cuota baja

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
src/
├── core/           # Motor de cálculo (funciones puras, sin dependencias)
│   ├── types.ts
│   ├── amortizacion.ts
│   ├── motor.ts
│   ├── motor.test.ts    # 21 tests, todos pasan
│   └── comparadores.ts
├── ui/             # Interfaz React
│   ├── App.tsx
│   └── components/
│       ├── SimuladorUnico.tsx
│       ├── ComparadorFinanciaciones.tsx
│       ├── ComparadorContado.tsx
│       ├── FormularioCondiciones.tsx
│       └── ResultadoFinanciacion.tsx
└── test/           # Configuración de tests
```

## Roadmap

- [x] Setup inicial
- [x] **FASE 1**: Motor de cálculo + tests
  - [x] Implementar cálculo de cuota
  - [x] Implementar generación de cuadro
  - [x] Implementar cálculo de TAE
  - [x] Implementar comparadores
  - [x] Tests (T1-T6) - 21/21 ✅
- [x] **FASE 2**: Interfaz de usuario
  - [x] Formulario de entrada mobile-first
  - [x] Visualización de resultados con jerarquía correcta (§5)
  - [x] Cuadro de amortización colapsable
  - [x] Simulador de financiación única
  - [x] Comparador de financiaciones
  - [x] Comparador financiar vs contado
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
