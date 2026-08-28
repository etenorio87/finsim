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

# Desarrollo con hot reload
npm run dev

# Ejecutar tests
npm test

# Ejecutar tests una vez
npm run test:run

# Build para producción
npm run build

# Preview del build
npm run preview
```

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
- [ ] **FASE 1**: Motor de cálculo + tests
  - [ ] Implementar cálculo de cuota
  - [ ] Implementar generación de cuadro
  - [ ] Implementar cálculo de TAE
  - [ ] Implementar comparadores
  - [ ] Tests (T1-T6)
- [ ] **FASE 2**: Interfaz de usuario
  - [ ] Formulario de entrada
  - [ ] Visualización de resultados con jerarquía correcta
  - [ ] Cuadro de amortización colapsable

## Despliegue

GitHub Pages (sitio estático)

## Licencia

MIT
