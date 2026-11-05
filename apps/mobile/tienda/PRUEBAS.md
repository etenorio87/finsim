# Guía de pruebas de FinSim (iOS y Android)

Pruebas manuales para dar la app por buena antes de enviarla a revisión. Cada funcionalidad tiene al menos dos casos con datos distintos: si los dos coinciden, el cálculo no es casualidad.

Los valores esperados se han calculado con el motor de la app (`@finsim/core`), el mismo que usan la web y el móvil. La web (https://etenorio87.github.io/finsim/) debe dar exactamente los mismos resultados, así que sirve como segunda referencia.

## Antes de empezar

- **Empieza cada caso desde la app recién abierta** (ciérrala del todo y vuelve a abrirla) o borra los valores anteriores: cada pantalla conserva lo que escribiste.
- **Cómo escribir los números:** con coma decimal (`4,5`). La app también acepta punto (`4.5`).
- **Formato de las cifras:** la app sigue la norma española. Las cifras de cuatro dígitos no llevan punto de miles (`5307,89 €`, `1200,00 €`); a partir de cinco sí (`10.636,95 €`). No es un fallo.
- **Comisiones:** pulsa **+ Añadir comisión**, escribe el importe y elige **1ª cuota** (se paga con la primera cuota) o **Descontada** (se descuenta del dinero que recibes).
- **Errores de validación:** aparecen en rojo bajo el campo al salir de él o al pulsar el botón de calcular.
- Marca cada casilla al comprobarla. Si algún valor no coincide, anota el caso y la cifra que ves.

---

## 1. Simular una financiación

Pestaña **Simular**. Rellena los datos y pulsa **Simular financiación**.

| Caso | Importe | Cuotas | Frecuencia | TIN | Comisiones |
|---|---|---|---|---|---|
| S1 (datos de ejemplo) | 10000 | 24 | Mensual | 6 | — |
| S2 | 15000 | 60 | Mensual | 4,5 | — |
| S3 | 5000 | 8 | Trimestral | 7 | — |
| S4 | 20000 | 5 | Anual | 5 | — |
| S5 (sin intereses) | 1200 | 12 | Mensual | 0 | — |

| Caso | ① TAE | ② Cuota | Coste financiero | Coste total | TIN nominal | Saldo medio | Cuadro |
|---|---|---|---|---|---|---|---|
| S1 | 6,17 % | 443,21 € cada mes | 636,95 € | 10.636,95 € | 6,00 % | 5307,89 € | 24 cuotas |
| S2 | 4,59 % | 279,65 € cada mes | 1778,72 € | 16.778,72 € | 4,50 % | 7905,41 € | 60 cuotas |
| S3 | 7,19 % | 675,21 € cada trimestre | 401,72 € | 5401,72 € | 7,00 % | 2869,41 € | 8 cuotas |
| S4 | 5,00 % | 4619,50 € cada año | 3097,48 € | 23.097,48 € | 5,00 % | 12.389,92 € | 5 cuotas |
| S5 | 0,00 % | 100,00 € cada mes | 0,00 € | 1200,00 € | 0,00 % | 650,00 € | 12 cuotas |

- [ ] S1 · [ ] S2 · [ ] S3 · [ ] S4 · [ ] S5
- [ ] Debajo del texto de la cuota pone "cada mes", "cada trimestre" o "cada año" según la frecuencia elegida.

## 2. Comisiones

Misma pestaña. Añade las comisiones indicadas antes de simular.

| Caso | Importe | Cuotas | Frecuencia | TIN | Comisiones |
|---|---|---|---|---|---|
| K1 | 10000 | 24 | Mensual | 6 | 100 € · 1ª cuota |
| K2 ("sin intereses" con trampa) | 600 | 10 | Mensual | 0 | 18 € · 1ª cuota |
| K3 | 800 | 12 | Mensual | 0 | 25 € · Descontada |
| K4 (decimales y dos comisiones) | 3000 | 18 | Mensual | 5 | 1,5 € · 1ª cuota **y** 60 € · Descontada |
| K5 (comisión pequeña con decimales) | 10000 | 24 | Mensual | 6 | 1,5 € · 1ª cuota |

| Caso | ① TAE | ② Cuota | Coste financiero | Coste total |
|---|---|---|---|---|
| K1 | 7,21 % | 443,21 € | 736,95 € | 10.736,95 € |
| K2 | 6,86 % | 60,00 € | 18,00 € | 618,00 € |
| K3 | 6,06 % | 66,67 € | 25,00 € | 825,00 € |
| K4 | 7,95 % | 173,34 € | 181,65 € | 3181,65 € |
| K5 | 6,18 % | 443,21 € | 638,45 € | 10.638,45 € |

Lo que deben demostrar: la comisión **no cambia la cuota** (K1 tiene la misma que S1), pero **sí sube la TAE y el coste**. Un TIN del 0 % con comisión no sale gratis (K2 y K3).

- [ ] K1 · [ ] K2 · [ ] K3 · [ ] K4 · [ ] K5
- [ ] **Coma en la comisión:** en K4 y K5, al salir del campo de la comisión pone `1,50`, no `15,00`.
- [ ] **Borrar comisiones:** en K4, pulsa ✕ en la comisión de 60 € y vuelve a simular. Debe dar TAE **5,18 %** y coste total **3121,65 €**. Borra también la de 1,50 € y simula: TAE **5,12 %**, coste total **3120,15 €**.

## 3. Cuadro de amortización

Tras simular, pulsa **Ver cuadro de amortización**. Se abre a pantalla completa con las columnas # · Cuota · Interés · Capital · Pendiente.

| Caso | Fila | Cuota | Interés | Capital | Pendiente |
|---|---|---|---|---|---|
| S1 | 1 | 443,21 € | 50,00 € | 393,21 € | 9606,79 € |
| S1 | 24 (última) | 443,21 € | 2,21 € | 441,00 € | 0,00 € |
| S3 (trimestral) | 1 | 675,21 € | 87,50 € | 587,71 € | 4412,29 € |
| S3 | 8 (última) | 675,21 € | 11,61 € | 663,60 € | 0,00 € |
| L1 (hipoteca) | 1 | 843,21 € | 500,00 € | 343,21 € | 199.656,79 € |
| L1 | 360 (última) | 843,21 € | 2,10 € | 841,11 € | 0,00 € |

Datos de **L1**: importe 200000, 360 cuotas, Mensual, TIN 3. En la tarjeta de resultados: TAE **3,04 %**, cuota **843,21 €**, coste financiero **103.554,90 €**, coste total **303.554,90 €**.

- [ ] S1 · [ ] S3 · [ ] L1
- [ ] El botón indica el número de cuotas correcto (24, 8 y 360).
- [ ] L1: el cuadro abre en un segundo o dos, se desplaza con fluidez hasta la fila 360 y **Cerrar** vuelve a la pantalla anterior.
- [ ] La última fila siempre deja el pendiente en 0,00 €.

## 4. Amortización parcial

Se calcula sobre el préstamo simulado en la pestaña **Simular**: primero simula el préstamo, después pulsa **💰 Simular amortización parcial**, rellena los datos y pulsa **Simular amortización parcial**.

Los valores iniciales del panel (1000 €, cuota 6, Reducir plazo) son los del caso A1.

| Caso | Préstamo (simúlalo antes) | Cantidad | Cuota | Estrategia |
|---|---|---|---|---|
| A1 | S1: 10000 · 24 · Mensual · 6 | 1000 | 6 | Reducir plazo |
| A2 | S1 | 1000 | 6 | Reducir cuota |
| A3 | S2: 15000 · 60 · Mensual · 4,5 | 3000 | 12 | Reducir plazo |
| A4 | S2 | 3000 | 12 | Reducir cuota |

Tarjeta **Tu ahorro**:

| Caso | Ahorro en intereses | Ahorro en coste total | Reducción de TAE | Cuotas eliminadas / Reducción de cuota |
|---|---|---|---|---|
| A1 | 82,16 € | 1082,16 € | 0,00 % | Cuotas eliminadas: **2** |
| A2 | 48,17 € | 1048,17 € | 0,00 % | Reducción de cuota: **58,23 €** |
| A3 | 521,18 € | 3521,18 € | 0,00 % | Cuotas eliminadas: **13** |
| A4 | 283,70 € | 3283,70 € | 0,00 % | Reducción de cuota: **68,41 €** |

Tarjeta **Después de amortizar**:

| Caso | ① TAE | ② Cuota | Coste total | Cuadro |
|---|---|---|---|---|
| A1 | 6,17 % | 430,97 € | 6895,55 € | 16 cuotas |
| A2 | 6,17 % | 384,97 € | 6929,54 € | 18 cuotas |
| A3 | 4,59 % | 282,91 € | 9901,80 € | 35 cuotas |
| A4 | 4,59 % | 211,23 € | 10.139,27 € | 48 cuotas |

La tarjeta **Situación actual** repite los resultados del préstamo de origen (S1 o S2 de la sección 1).

- [ ] A1 · [ ] A2 · [ ] A3 · [ ] A4
- [ ] En los cuatro casos, "Reducir plazo" ahorra más intereses que "Reducir cuota".
- [ ] La frase final dice "Has ahorrado 82,16 € en intereses amortizando anticipadamente" (A1) y la cifra cambia en cada caso.
- [ ] La TAE no cambia al amortizar (Reducción de TAE 0,00 %). Es lo esperado: adelantar capital no cambia el tipo de interés.
- [ ] El botón **×** cierra el panel.

## 5. Comparar ofertas

Pestaña **Comparar**. Rellena las ofertas A y B y pulsa **Comparar ofertas**.

| Caso | Oferta A | Oferta B |
|---|---|---|
| C1 (datos de ejemplo) | 10000 · 24 · Mensual · 6 | 10000 · 24 · Mensual · 8 |
| C2 ("sin intereses") | 600 · 10 · Mensual · 0 · comisión 18 € 1ª cuota | 600 · 10 · Mensual · 5 |
| C3 (gana la más larga) | 15000 · 48 · Mensual · 7 | 15000 · 96 · Mensual · 5,5 |
| C4 (gana la más corta) | 8000 · 12 · Mensual · 4 | 8000 · 36 · Mensual · 6 |
| C5 (misma duración, distinta frecuencia) | 6000 · 8 · Trimestral · 6 | 6000 · 24 · Mensual · 6 |

| Caso | Titular | Diferencia de TAE | Aviso de plazos | Distintivo en la ganadora |
|---|---|---|---|---|
| C1 | 🏆 Mejor oferta: A | 2,13 % | No aparece | ✓ Mejor oferta (en A) |
| C2 | 🏆 Mejor oferta: B | 1,74 % | No aparece | ✓ Mejor oferta (en B) |
| C3 | 💰 Dinero más barato: B | 1,59 % | "Son decisiones distintas: B es dinero más barato, pero estarás endeudado 4 años más. Depende de qué hagas con la liquidez que liberas." | ✓ Dinero más barato (en B) |
| C4 | 💰 Dinero más barato: A | 2,09 % | "A es dinero más barato y además terminas 2 años antes." | ✓ Dinero más barato (en A) |
| C5 | 🏆 Mejor oferta: A | 0,03 % | No aparece: las dos duran 2 años | ✓ Mejor oferta (en A) |

Tarjetas de cada oferta:

| Caso | A: TAE · Cuota · Coste financiero | B: TAE · Cuota · Coste financiero |
|---|---|---|
| C1 | 6,17 % · 443,21 € · 636,95 € | 8,30 % · 452,27 € · 854,55 € |
| C2 | 6,86 % · 60,00 € · 18,00 € | 5,12 % · 61,38 € · 13,84 € |
| C3 | 7,23 % · 359,19 € · 2241,30 € | 5,64 % · 193,49 € · 3575,02 € |
| C4 | 4,07 % · 681,20 € · 174,39 € | 6,17 % · 243,38 € · 761,52 € |
| C5 | 6,14 % · 801,50 € (cada trimestre) · 412,03 € | 6,17 % · 265,92 € (cada mes) · 382,17 € |

Lo que deben demostrar:
- **C2:** gana la oferta **con** intereses, porque la del 0 % tiene una comisión que la encarece.
- **C3:** gana B por TAE aunque, al ser más larga, paga más intereses en total (3575,02 € frente a 2241,30 €). Por eso aparece el aviso.
- **C5:** con la misma duración no hay aviso, aunque la frecuencia sea distinta.

- [ ] C1 · [ ] C2 · [ ] C3 · [ ] C4 · [ ] C5

## 6. ¿Financiar o pagar al contado?

Pestaña **Contado**. Rellena la financiación y **Tu inversión** y pulsa **Calcular decisión**.

| Caso | Financiación | Rentabilidad bruta | Tipo impositivo |
|---|---|---|---|
| D1 (datos de ejemplo) | 10000 · 24 · Mensual · 4 | 10 | 19 |
| D2 | 15000 · 60 · Mensual · 4,5 | 8 | 19 |
| D3 | 10000 · 24 · Mensual · 8 | 5 | 19 |
| D4 | 3000 · 12 · Mensual · 0 · comisión 90 € 1ª cuota | 3 | 21 |
| D5 (sin impuestos) | 10000 · 24 · Mensual · 4 | 4,5 | 0 |

| Caso | Veredicto | Frase | TAE financiación | Rentabilidad neta |
|---|---|---|---|---|
| D1 | ✅ Conviene FINANCIAR | Ganas 4,03 % anual financiando | 4,07 % | 8,10 % |
| D2 | ✅ Conviene FINANCIAR | Ganas 1,89 % anual financiando | 4,59 % | 6,48 % |
| D3 | 💰 Mejor pagar AL CONTADO | Pierdes 4,25 % anual si financias | 8,30 % | 4,05 % |
| D4 | 💰 Mejor pagar AL CONTADO | Pierdes 3,41 % anual si financias | 5,78 % | 2,37 % |
| D5 | ✅ Conviene FINANCIAR | Ganas 0,43 % anual financiando | 4,07 % | 4,50 % |

- [ ] D1 · [ ] D2 · [ ] D3 · [ ] D4 · [ ] D5
- [ ] La tarjeta **Tu inversión** muestra la misma "Rentabilidad neta (después de impuestos)" que el veredicto.
- [ ] **Detalle de la financiación** coincide con la sección 1 para los mismos datos. Por ejemplo, D2 da los mismos resultados que S2.
- [ ] D4: pese al TIN del 0 %, la comisión hace que no convenga financiar.

## 7. Validaciones

Ningún dato erróneo debe producir un resultado. La app muestra el mensaje y no calcula.

| Pantalla | Qué hacer | Mensaje esperado |
|---|---|---|
| Simular | Borra el importe (o pon 0) y pulsa Simular | Debe ser mayor que 0 |
| Simular | Cuotas: 0 | Debe ser como mínimo 1 |
| Comparar | Importe de la oferta B: 0 y pulsa Comparar | "Debe ser mayor que 0" bajo B; no aparece veredicto |
| Contado | Tipo impositivo: 150 | Debe estar entre 0 y 100 |
| Contado | Tipo impositivo: 100 | Sin error (es el límite) |
| Amortización (sobre S1) | Cuota: 25 | La cuota debe estar entre 1 y 24 |
| Amortización (sobre S1) | Cuota: 0 | La cuota debe estar entre 1 y 24 |
| Amortización (sobre S1) | Cantidad: 0 | El capital a amortizar debe ser mayor que 0 |
| Amortización (sobre S1) | Cantidad: 8000, cuota 6 | El capital a amortizar no puede ser mayor que el capital pendiente en esa cuota (7611,08 €) |
| Amortización (sobre S1) | Cantidad: 7611,08, cuota 6 | Sin error (es justo el pendiente) |

- [ ] Todas las filas.
- [ ] Al corregir el dato, el mensaje desaparece y el cálculo vuelve a funcionar.

## 8. Exportar Excel y PDF

Con los resultados de S1 y de L1 en pantalla, pulsa **Excel** y después **PDF**.

- [ ] Se abre el menú de compartir del sistema.
- [ ] Nombre del archivo:
  - S1: `amortizacion_10000€_24cuotas_6,17TAE.xlsx` / `.pdf`
  - L1: `amortizacion_200000€_360cuotas_3,04TAE.xlsx` / `.pdf`
- [ ] **Excel:** tiene dos hojas.
  - "Resumen": importe, número de cuotas, frecuencia, TIN, TAE, cuota, total a pagar (es el coste total), coste financiero y saldo medio, iguales a la tarjeta.
  - "Amortización": 24 o 360 filas; la primera y la última coinciden con la sección 3.
- [ ] **PDF:** título "Tabla de Amortización", el mismo resumen y el cuadro completo. El de L1 ocupa varias páginas.
- [ ] Se puede guardar en Archivos (iOS) o Descargas/Drive (Android) y enviar por correo o WhatsApp.
- [ ] Mientras se genera, el botón pone "Generando…" y no se puede pulsar dos veces.

## 9. Teclado, pantalla y accesibilidad

- [ ] **Teclado:** en todos los campos numéricos sale el teclado numérico con coma. Al escribir en un campo de la parte baja (comisiones, tipo impositivo), el teclado no lo tapa.
- [ ] **Pestañas:** el icono de la pestaña activa se ve en color y el de las otras en gris. Al cambiar de pestaña y volver, se conserva lo escrito.
- [ ] **Desplazamiento:** al bajar en cualquier pantalla, el contenido no pasa por debajo de la hora ni de la batería.
- [ ] **Texto grande:** en Ajustes del móvil (iOS: Accesibilidad → Pantalla y tamaño del texto; Android: Pantalla → Tamaño de fuente), pon el tamaño máximo. Los títulos se parten en varias líneas sin cortarse y los botones se pueden pulsar.
- [ ] **Lector de pantalla** (VoiceOver en iOS, TalkBack en Android):
  - al tocar un campo dice su nombre y su valor. iOS: "Importe en euros, 10.000,00"; Android: "10.000,00, cuadro de edición, Importe en euros";
  - si cambias el valor, lee el nuevo, no el anterior;
  - al pulsar Simular, Comparar o Calcular, anuncia el resultado.
- [ ] **Arranque:** primero aparece la pantalla de inicio con el icono del "%" sobre fondo crema, después la app. El icono se ve bien en la pantalla de inicio del móvil. En Android también en el cajón de aplicaciones, con forma redonda o cuadrada según el móvil.
- [ ] **Sin conexión:** con el modo avión activado todo funciona igual, incluida la exportación.

## Resultado

| Plataforma | Dispositivo y versión | Fecha | ¿Todo correcto? | Notas |
|---|---|---|---|---|
| iOS | | | | |
| Android | | | | |
