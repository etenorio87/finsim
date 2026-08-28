# Simulador de financiación — especificación

Documento de trabajo para Claude Code. Diseño acordado con el usuario; **no modificar el contrato sin consultarle.**

---

## 0. Propósito

Responder, con el móvil en la mano y en una tienda, a dos preguntas:

1. **¿Cuál de estas dos financiaciones es mejor?**
2. **¿Me conviene financiar o pagar al contado con el dinero que tengo rindiendo?**

No es una calculadora genérica de préstamos. Es una herramienta de decisión que además **protege al usuario de un sesgo concreto** (ver §5).

---

## 1. Alcance

### Dentro
- Motor de cálculo en TypeScript, funciones puras, sin dependencias
- Amortización francesa (cuota constante)
- Comisiones configurables
- Cálculo de TAE real por búsqueda iterativa
- Los dos comparadores de §4
- Tests

### Fuera (por ahora)
- Interfaz web → **fase 2, solo cuando el motor pase todos los tests**
- Persistencia, base de datos, backend
- Sistemas de amortización distintos del francés
- Tipos variables, carencias, amortizaciones parciales
- Cartera de inversión → proyecto distinto

**Límite de esfuerzo: un fin de semana.** Si crece, se recorta el alcance, no se amplía el plazo.

### Despliegue previsto
GitHub Pages (sitio estático). Condiciona la fase 2, no el motor.

---

## 2. Principios de diseño

**Nada se persiste.** El cuadro de amortización se deriva íntegramente de las condiciones. Guardar estado derivado es una fuente de bugs: puedes acabar con un cuadro que no corresponde a sus condiciones.

**Entrada plana → salida calculada.**

```
Condiciones  →  [ motor ]  →  Resultado
```

**Todos los tipos de interés en DECIMALES dentro del dominio.**
Se guarda `0.0545`, no `5.45`. El formateo a `"5,45 %"` ocurre **solo** en la capa de presentación.

> Mezclar ambas representaciones produce bugs que **no fallan**: devuelven números plausibles pero incorrectos. Es el peor tipo de bug posible en una herramienta de decisión financiera.

**El cuadro se genera bajo demanda.** Por defecto solo se calculan los indicadores. Una hipoteca son 360 filas para responder a una pregunta que se resuelve con tres números.

---

## 3. Contrato del motor

```typescript
type Frecuencia = 'mensual' | 'trimestral' | 'anual';

type MomentoComision =
  | 'primeraCuota'      // se carga íntegra en la primera cuota (caso Cetelem)
  | 'descontadaDelImporte'; // pides 800, recibes 775

interface Comision {
  descripcion: string;
  importe?: number;      // importe fijo en euros
  porcentaje?: number;   // % sobre el importe financiado (decimal)
  momento: MomentoComision;
}

interface Condiciones {
  importe: number;         // capital solicitado
  numeroCuotas: number;
  frecuencia: Frecuencia;
  tin: number;             // DECIMAL: 0.0545
  comisiones: Comision[];
}

interface FilaCuadro {
  numero: number;
  cuota: number;
  interes: number;
  capital: number;
  capitalPendiente: number;
}

interface Resultado {
  cuota: number;
  costeTotal: number;      // suma de cuotas + comisiones
  costeFinanciero: number; // costeTotal − importe
  saldoMedio: number;
  tin: number;             // decimal
  tae: number;             // decimal, REAL: incluye comisiones
  cuadro?: FilaCuadro[];   // solo si se solicita
}

function calcular(c: Condiciones, opts?: { incluirCuadro: boolean }): Resultado;
```

### Reglas de cálculo

**Tipo del periodo:** `tin / periodosPorAño`

**Cuota (amortización francesa):**
```
cuota = P · i / (1 − (1 + i)^(−n))
```

**Interés de cada periodo:** `capitalPendiente × i`
**Capital de cada periodo:** `cuota − interes`

**Saldo medio:** media de los saldos vivos al inicio de cada periodo.
Atajo válido en amortización lineal: `(primerSaldo + últimoSaldo) / 2`.
⚠️ **NO es `importe / 2`**: en el último periodo aún se debe una cuota de capital.

**TAE real:** no se despeja; se busca iterativamente el tipo `i` que satisface:

```
importeRecibido = Σ cuota / (1 + i)^t     para t = 1..n
```

donde `importeRecibido` descuenta las comisiones de tipo `descontadaDelImporte`, y las de tipo `primeraCuota` se suman al flujo de la primera cuota.

Después se anualiza: `TAE = (1 + i)^periodosPorAño − 1`.

Búsqueda binaria entre 0 y 0.5, ~100 iteraciones. Converge sobrado.

---

## 4. Comparadores

Son **dos funciones distintas**, deliberadamente. Comparar dos financiaciones y comparar financiación contra contado son preguntas diferentes que requieren datos diferentes. Forzarlas a un tipo común obligaría a inventar campos vacíos.

```typescript
interface ComparacionFinanciaciones {
  ganadora: 'a' | 'b';
  criterio: 'tae';
  diferenciaTae: number;
  avisoPlazosDistintos: boolean;   // ← ver §5
  detalle: { a: Resultado; b: Resultado };
}

function compararFinanciaciones(
  a: Condiciones,
  b: Condiciones
): ComparacionFinanciaciones;


interface ComparacionContado {
  recomendacion: 'financiar' | 'pagarAlContado';
  taeFinanciacion: number;        // decimal
  rentabilidadNeta: number;       // decimal, ya neta de impuestos
  diferenciaTipos: number;
  costeEstimadoEuros: number;     // informativo
}

function compararConContado(
  financiacion: Condiciones,
  rentabilidadBruta: number,   // decimal
  tipoImpositivo: number       // decimal, p.ej. 0.19
): ComparacionContado;
```

**Regla de decisión en `compararConContado`:**

```
rentabilidadNeta = rentabilidadBruta × (1 − tipoImpositivo)
financiar solo si  tae < rentabilidadNeta
```

> Se comparan **tipos, no importes**. Los tipos ya incorporan cuánto dinero y cuánto tiempo. Comparar importes obliga a modelar escenarios (¿el capital se queda quieto o va bajando?) y ahí es donde se cuela el error.

---

## 5. Requisito de producto: jerarquía de la salida

**Este apartado no es cosmético. Es la razón de ser de la herramienta.**

Con la misma TAE, un plazo más largo produce muchos más intereses totales. 10.000 € al 6 % TAE:

| Plazo | Cuota | Intereses totales |
|---|---|---|
| 2 años | 442,49 € | 619,77 € |
| 5 años | 192,59 € | 1.555,39 € |
| 10 años | 110,22 € | 3.226,88 € |

**Las tres son la misma oferta.** El mismo precio del dinero, distinto tiempo de deuda viva.

El argumento comercial habitual —*"le queda en 110 € al mes"*— explota exactamente esto.

**Por tanto la salida debe jerarquizar así:**

| Orden | Dato | Papel |
|---|---|---|
| 1 | **TAE** | El precio del dinero. **Es lo que decide.** |
| 2 | Cuota | Restricción de presupuesto, **no criterio de elección** |
| 3 | Coste total | Informativo. **Con aviso explícito si los plazos difieren** |

Si la interfaz muestra el coste total en grande, induce a elegir mal. El diseño debe impedirlo.

---

## 6. Tests — criterio de aceptación

**Escribir los tests ANTES de la implementación.**

### T1 · Préstamo del coche (verificado contra cuadro oficial de BBVA)
```
importe: 9854.64 · cuotas: 59 · mensual · tin: 0.0545 · sin comisiones
→ primera cuota: interes 44.76 · capital 146.02 · pendiente 9708.62
→ segunda cuota: interes 44.09 · capital 146.69
→ tae ≈ 0.0559
```
*Este test valida contra un documento real del banco, no contra un cálculo propio.*

### T2 · Móvil "sin intereses"
```
importe: 600 · cuotas: 10 · mensual · tin: 0 · comisión 18 € en primeraCuota
→ saldoMedio = 330.00        (NO 300)
→ tae ≈ 0.0669
```

### T3 · Cetelem aplazado (caso real)
```
importe: 331 · cuotas: 12 · mensual · tin: 0 · comisión 9.93 € en primeraCuota
→ tae ≈ 0.0576
```

### T4 · Sensibilidad al momento de la comisión
```
Mismas condiciones que T2, pero momento: 'descontadaDelImporte'
→ la TAE resultante debe ser MAYOR que en T2
```
*Razón: recibes menos dinero por el mismo coste.*

### T5 · Coherencia interna
```
Para cualquier condición: Σ capital de todas las filas === importe  (±0.01)
Última fila: capitalPendiente ≈ 0
```

### T6 · Aviso de plazos
```
compararFinanciaciones con plazos distintos → avisoPlazosDistintos === true
```

---

## 7. Reparto de trabajo

| Tarea | Quién |
|---|---|
| Diseño y contrato | ✅ Acordado con el usuario |
| **Núcleo de amortización** | ✅ **Derivado por el usuario — ver §7.1** |
| Tests | Claude Code, **a partir de §6** |
| Resto de la implementación | Claude Code |
| Verificación contra casos nuevos | Sesión con el tutor |

---

### 7.1 Núcleo de amortización — NO REESCRIBIR

Derivado por el usuario. Claude Code debe **usar estas funciones tal cual**, no sustituirlas por una implementación propia.

```typescript
const PERIODOS_POR_ANIO: Record<Frecuencia, number> = {
  mensual: 12,
  trimestral: 4,
  anual: 1,
};

/** Tipo aplicable en cada periodo, a partir del TIN anual (decimal). */
function tipoDelPeriodo(tin: number, frecuencia: Frecuencia): number {
  return tin / PERIODOS_POR_ANIO[frecuencia];
}

/** Interés devengado en un periodo. Se calcula sobre el CAPITAL VIVO. */
function calcularInteres(capitalPendiente: number, tipoPeriodo: number): number {
  return capitalPendiente * tipoPeriodo;
}

/** Parte de la cuota que reduce deuda. */
function calcularCapitalAmortizado(cuota: number, interes: number): number {
  return cuota - interes;
}

/** Capital vivo al inicio del periodo siguiente. */
function siguienteCapitalPendiente(
  capitalPendiente: number,
  capitalAmortizado: number
): number {
  return capitalPendiente - capitalAmortizado;
}
```

**Estas tres líneas son toda la amortización francesa.** El bucle que las encadena produce el cuadro completo.

La retroalimentación que generan explica todo el comportamiento del sistema:

```
capital vivo baja  →  interés baja  →  (cuota constante)  →  más capital
      ↑                                                          │
      └──────────────────────────────────────────────────────────┘
```

De ahí se derivan, sin necesidad de programar nada más:
- Las primeras cuotas son casi todo interés (el capital vivo está en su máximo)
- Amortizar pronto ahorra más que tarde (reduces el capital durante más periodos)
- Reducir plazo gana a reducir cuota (menos euros-mes de deuda acumulados)

**Nota de nomenclatura:** `tipoPeriodo` ya está dividido; **no es anual**. En un fichero donde conviven `tin`, `tae` y este, los errores de unidades son silenciosos y devuelven cifras plausibles pero incorrectas.

---

## 8. Fase 2 (solo tras pasar los tests)

Interfaz mínima para GitHub Pages: un formulario, resultados con la jerarquía de §5, y el cuadro colapsado tras un botón.

**Advertencia:** la interfaz se llevará el 80 % del tiempo y **no enseña nada de finanzas**. Por eso va después y por eso es mínima.
