# Guía de uso

## Interfaz web

Abre la aplicación en tu navegador: [https://tu-usuario.github.io/simulador-financiacion/](https://tu-usuario.github.io/simulador-financiacion/)

### Caso 1: Comparar dos ofertas de financiación

**Situación**: Estás en una tienda y te ofrecen dos formas de financiar un móvil de 600€.

1. Selecciona **"Comparar ofertas"**
2. Introduce las condiciones de la **Oferta A**:
   - Importe: 600€
   - Cuotas: 10 mensuales
   - TIN: 0%
   - Añade comisión: 18€ en primera cuota
3. Introduce las condiciones de la **Oferta B**:
   - Importe: 600€
   - Cuotas: 10 mensuales
   - TIN: 5%
   - Sin comisiones
4. Pulsa **"Comparar ofertas"**

**Resultado**: La TAE te dirá cuál es realmente más barata, independientemente de lo que diga el vendedor sobre "sin intereses".

### Caso 2: ¿Financiar o pagar al contado?

**Situación**: Puedes comprar un coche de 15.000€ al contado, pero ese dinero lo tienes en un fondo que rinde 8% anual.

1. Selecciona **"¿Financiar o contado?"**
2. Introduce la **Financiación**:
   - Importe: 15.000€
   - Cuotas: 60 mensuales
   - TIN: 4.5%
3. Introduce **Tu inversión**:
   - Rentabilidad bruta: 8%
   - Tipo impositivo: 19%
4. Pulsa **"Calcular decisión"**

**Resultado**: Te dirá si conviene financiar (ganancia neta) o pagar al contado.

## Uso del motor desde código

```typescript
import { calcular, compararFinanciaciones, compararConContado } from './core';

// Calcular una financiación
const resultado = calcular({
  importe: 10000,
  numeroCuotas: 24,
  frecuencia: 'mensual',
  tin: 0.06,
  comisiones: [
    {
      descripcion: 'Apertura',
      importe: 100,
      momento: 'primeraCuota'
    }
  ]
}, { incluirCuadro: true });

console.log(`TAE real: ${(resultado.tae * 100).toFixed(2)}%`);
console.log(`Cuota: ${resultado.cuota.toFixed(2)} €`);
```

Ver más ejemplos en `src/core/ejemplo.ts`.

## Conceptos clave

### TAE vs TIN

- **TIN** (Tipo de Interés Nominal): El porcentaje que te dicen
- **TAE** (Tasa Anual Equivalente): El coste REAL incluyendo:
  - Comisiones
  - Frecuencia de pago
  - Capitalización

**Siempre compara por TAE, nunca por TIN.**

### El truco del "sin intereses"

Un préstamo con TIN 0% **NO es gratis** si tiene comisiones.

Ejemplo real:
- 600€ en 10 cuotas
- TIN: 0% ("sin intereses")
- Comisión: 18€
- **TAE real: 6.86%**

### El truco del plazo largo

Con la **misma TAE**, un plazo más largo paga muchos más intereses totales:

| Plazo | Cuota | Intereses |
|---|---|---|
| 2 años | 442€ | 620€ |
| 5 años | 193€ | 1.555€ |
| 10 años | 110€ | 3.227€ |

Por eso la interfaz **avisa cuando los plazos difieren**.

## Datos técnicos

- Motor: TypeScript puro, sin dependencias
- Tests: 20/20 (casos reales validados)
- Precisión TAE: 10 decimales (búsqueda binaria)
- Amortización: Sistema francés (cuota constante)

## Despliegue

El proyecto está configurado para GitHub Pages:

```bash
# Build para producción
npm run build

# Preview local
npm run preview
```

El workflow `.github/workflows/deploy.yml` se encarga del deploy automático al hacer push a `main`.
