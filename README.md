# Simulador de Financiación

Herramienta de decisión para comparar ofertas de financiación y decidir entre financiar o pagar al contado.

## Propósito

Responder, con el móvil en la mano y en una tienda, a dos preguntas:

1. **¿Cuál de estas dos financiaciones es mejor?**
2. **¿Me conviene financiar o pagar al contado con el dinero que tengo rindiendo?**

No es una calculadora genérica de préstamos. Es una herramienta de decisión que protege al usuario del sesgo comercial de comparar solo las cuotas mensuales.

## Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo con hot reload (abre http://localhost:5173)
npm run dev

# Ejecutar tests
npm test

# Ejecutar tests una vez
npm run test:run

# Build para producción
npm run build

# Preview del build
npm run preview

# Ejecutar ejemplo del motor
npx tsx src/core/ejemplo.ts
```

## Características

### ✅ Motor de cálculo (Fase 1)
- Amortización francesa con funciones puras
- Cálculo preciso de TAE real (incluye comisiones)
- Manejo de comisiones en dos momentos diferentes
- 20 tests de aceptación (T1-T6 según especificación)

### 🎨 Interfaz (Fase 2)
- **Mobile-first**: diseñada para usar en tienda con el móvil
- **Jerarquía correcta** (§5): TAE grande → Cuota mediana → Coste total pequeño
- **Protección contra sesgo comercial**: evita elegir solo por cuota baja
- Dos comparadores:
  - Comparar ofertas de financiación
  - Decidir entre financiar o pagar al contado
- Cuadro de amortización colapsable
- Diseño oscuro optimizado para lectura rápida

## Estructura

```
src/
├── core/           # Motor de cálculo (funciones puras, sin dependencias)
│   ├── types.ts
│   ├── amortizacion.ts
│   └── ...
├── ui/             # Interfaz React (Fase 2)
│   ├── App.tsx
│   └── components/
└── test/           # Tests y configuración
```

## Roadmap

- [x] Setup inicial
- [x] **FASE 1**: Motor de cálculo + tests
  - [x] Implementar cálculo de cuota
  - [x] Implementar generación de cuadro
  - [x] Implementar cálculo de TAE
  - [x] Implementar comparadores
  - [x] Tests (T1-T6) - 20/20 ✅
- [x] **FASE 2**: Interfaz de usuario
  - [x] Formulario de entrada mobile-first
  - [x] Visualización de resultados con jerarquía correcta (§5)
  - [x] Cuadro de amortización colapsable
  - [x] Comparador de financiaciones
  - [x] Comparador financiar vs contado

## Despliegue

GitHub Pages (sitio estático)

## Licencia

MIT
