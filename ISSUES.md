# Issues detectados en revisión — 28/08/2026

Revisión del código fuente y del desplegado en https://etenorio87.github.io/finsim/

**Para Claude Code:** resolver por orden de prioridad. Los issues 1 y 2 son bloqueantes.

---

## 🔴 #1 · El campo TIN no admite decimales ni dos cifras — BLOQUEANTE

**Componente:** `src/ui/components/FormularioCondiciones.tsx`

**Comportamiento observado:**

| Se escribe | Aparece en el campo |
|---|---|
| `5,45` | `5,00` |
| `5.45` | `5,00` |
| `20` | `2,00` |

**Impacto:** la herramienta es inservible para todos los casos reales que motivaron el proyecto.

| Caso real | TIN | ¿Se puede introducir? |
|---|---|---|
| Préstamo coche BBVA | 5,45 % | ❌ |
| Revolving Cetelem | 14,95 % | ❌ |
| Fraccionamiento tarjeta | 21,60 % | ❌ |

Solo admite enteros de un dígito.

**Causa probable:** el input formatea el valor en cada pulsación (`toFixed(2)` o `Intl.NumberFormat` sobre el `onChange`), lo que reescribe el contenido y descarta las pulsaciones siguientes.

**Solución esperada:** mantener el valor como texto libre mientras el campo tiene el foco y formatear solo en `onBlur`. Aceptar coma **y** punto como separador decimal.

**Test de regresión:** escribir `14,95` debe resultar en `tin === 0.1495`.

---

## 🔴 #2 · El campo Importe rechaza el punto decimal — BLOQUEANTE

**Comportamiento observado:** escribir `9854.64` deja el campo en `064`. Con `9854,64` funciona.

**Solución esperada:** aceptar ambos separadores. Misma causa y misma corrección que #1.

---

## 🟠 #3 · Test T2 con tolerancia relajada para ocultar un descuadre

**Fichero:** `src/core/motor.test.ts`

```js
expect(resultado.tae).toBeCloseTo(0.0669, 2);
// "tolerancia a 2 decimales por variación en método de cálculo"
```

Con 2 decimales, `toBeCloseTo` acepta cualquier valor a menos de 0,005. El resultado real es **0,0686**, no 0,0669. **El test pasa ocultando una diferencia de 17 puntos básicos.**

### La culpa es de la especificación, no del código

El valor 0,0669 de la ESPECIFICACIÓN se calculó repartiendo la comisión entre las 10 cuotas (10 × 61,80 €). El código hace lo que el campo `momento: 'primeraCuota'` indica: la carga entera en la primera cuota (78 € + 9 × 60 €). Son flujos distintos.

**Validación contra la realidad** — el caso Cetelem tiene TAE declarada por la entidad:

| Modelo | TAE calculada | TAE declarada por Cetelem |
|---|---|---|
| Comisión prorrateada (spec) | 5,63 % | **5,76 %** |
| Comisión en primera cuota (código) | **5,78 %** | **5,76 %** |

**El código es más correcto que la especificación.**

**Acciones:**
1. Corregir el valor esperado de T2 a `0.0686` con tolerancia `3`
2. Corregir §6 de `ESPECIFICACION.md`
3. Documentar en el test por qué el modelo `primeraCuota` es el correcto

> **Regla permanente:** si un test no pasa, **avisar**. Nunca relajar la tolerancia para que pase. Un test ajustado a la implementación no prueba nada.

---

## 🟠 #4 · Discrepancia de 3 céntimos en la cuota

**Caso:** importe `9854,64` · 59 cuotas · mensual · TIN 5 % · sin comisiones

| | Cuota | Saldo medio |
|---|---|---|
| App desplegada | 188,77 € | 5.212,24 € |
| Cálculo independiente | **188,74 €** | **5.212,04 €** |

Sobre 59 cuotas son **1,77 €** de desviación. La fórmula es determinista: debería coincidir al céntimo.

**Pista:** la cuota mostrada correspondería a un importe de **9.855,81 €**, no 9.854,64 €. Sospecha principal: la conversión del separador decimal en el campo Importe (relacionado con #2).

**Test de regresión:** con importe decimal `9854.64`, la cuota debe ser `188.74` (±0,01).

---

## 🟡 #5 · "Mejor oferta" es demasiado rotundo con plazos distintos

**Componente:** `src/ui/components/ComparadorFinanciaciones.tsx`

**Caso reproducido:**

| | Oferta A | Oferta B |
|---|---|---|
| Plazo | 12 cuotas | 60 cuotas |
| TAE | 6,17 % | **2,02 %** |
| Coste total | **327,97 €** | 516,66 € |
| Etiqueta actual | | 🏆 Mejor oferta |

**El cálculo es correcto y el aviso aparece.** El problema es la etiqueta.

**Con plazos distintos no son el mismo producto.** La TAE mide el precio del dinero, no si conviene deber durante uno o cinco años. Eligiendo B se liberan ~685 €/mes el primer año; que eso compense depende de qué se haga con ese dinero. Por encima del 2,02 % neto, B gana; si se gasta, A era mejor en euros.

**Este es un error de la especificación** (§4 y §5 decían "ganadora por TAE, punto"), no del código.

**Solución esperada:** cuando `avisoPlazosDistintos === true`, sustituir "🏆 Mejor oferta" por **"Dinero más barato"** y añadir una línea: *"Son decisiones distintas: B es dinero más barato, pero estarás endeudado 4 años más. Depende de qué hagas con la liquidez que liberas."*

Cuando los plazos coinciden, mantener "Mejor oferta".

---

## ✅ Lo que funciona bien

- **Jerarquía de la salida (§5) respetada:** TAE numerada como `1` y en grande, cuota como `2`, coste total en tarjeta secundaria
- **El aviso de plazos distintos aparece** y está bien redactado
- **Motor de amortización correcto:** verificado contra el cuadro oficial de BBVA
- **Saldo medio correcto:** 5.212 € para el caso del coche, no importe/2
- **Cuadro bajo demanda:** colapsado tras un desplegable
- **Separación motor/UI limpia:** `src/core` sin dependencias de React
- **El núcleo de amortización se usó tal cual**, sin reescribir

---

## Orden de trabajo sugerido

1. #1 y #2 juntos — misma causa, desbloquean la herramienta
2. #4 — probablemente se resuelve con #2; añadir el test igualmente
3. #3 — corregir spec y test
4. #5 — cambio de copy y condicional
