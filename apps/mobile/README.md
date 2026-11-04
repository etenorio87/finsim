# @finsim/mobile

App nativa de FinSim para iOS y Android: **NativeScript 9 + Angular 22** sobre `@finsim/shared`. La app solo aporta las vistas (elementos nativos) y la integración con cada plataforma; el estado, los formularios, el formato y la exportación son los mismos que usa la web.

> Estado: **las cuatro funcionalidades de la web** (Fase 5), con icono, pantalla de arranque y accesibilidad (Fase 6). Pendiente: probar en dispositivos reales y publicar (Fase 7).

## Estructura

```
src/app/
├── inicio.ts                    # pestañas: Simular, Comparar, Contado
├── paginas/
│   ├── simulador/               # simulación + amortización parcial
│   ├── amortizacion-parcial/
│   ├── comparador/
│   └── contado/
├── ui/
│   ├── campo-decimal.ts         # TextField sobre CampoDecimalBase
│   ├── selector.ts              # opciones (frecuencia, comisión…), igual en iOS y Android
│   ├── formulario-condiciones.* # importe, cuotas, frecuencia, TIN y comisiones
│   ├── resultado-financiacion.* # TAE, cuota, costes y exportación
│   ├── cuadro-amortizacion.ts   # cuadro a pantalla completa (lista nativa)
│   ├── etiqueta-accesible.ts    # nombre de un campo para VoiceOver / TalkBack
│   └── contenedor-enfocable.ts  # Android: evita que el foco salte al primer campo
├── plataforma/
│   ├── compartir-archivo.ts     # guardar y abrir el menú de compartir
│   ├── teclado.ts               # iOS: que el teclado no tape los campos
│   └── accesibilidad.ts         # avisos al lector de pantalla
└── diagnostico.ts               # modo diagnóstico del runtime

recursos/icono.svg               # fuente del icono de la app
tools/generar-recursos.mjs       # genera iconos y pantallas de arranque
```

Cada pestaña tiene su propio store (de `@finsim/shared`): cambiar de pestaña no pierde lo escrito.

## Desarrollo

Requisitos: Xcode (iOS) y/o Android SDK + JDK 21 (Android), con `ANDROID_HOME` definido. `npx ns doctor` (desde `apps/mobile`) comprueba el entorno.

```bash
npm run ios          # compila, instala en el simulador y recarga al guardar (desde la raíz o desde apps/mobile)
npm run android      # ídem en el emulador o dispositivo Android
npx nx run @finsim/mobile:typecheck
```

En Xcode 27 el simulador se ve en **DeviceHub** (`Xcode.app/Contents/Applications/DeviceHub.app`). Si el teclado del Mac está conectado al simulador, iOS no muestra el teclado en pantalla: **Device → Keyboard → Toggle Software Keyboard**.

Si al abrir una pantalla en Android aparece vacía y el log muestra `ClassNotFoundException: ...FragmentBase_vendor_...`, la compilación incremental dejó clases Java desactualizadas: `npx ns clean` (o `ns build android --clean`).

### Icono y pantalla de arranque

Se generan desde `recursos/icono.svg` (los colores del favicon de la web) y se versionan en `App_Resources`. Si cambia el icono:

```bash
node apps/mobile/tools/generar-recursos.mjs   # requiere macOS (sips) e ImageMagick
```

- iOS: icono opaco en todos los tamaños de `AppIcon.appiconset`; arranque con el fondo de la app y el icono en el centro.
- Android: icono adaptativo en vectores (fondo con degradado y símbolo, también para los iconos temáticos de Android 13) y PNG para Android 7. Arranque: el sistema muestra el icono adaptativo en Android 12+ (`values-v31/styles.xml`) y `splash_screen.xml` en las versiones anteriores.
- Pestañas: SF Symbols en iOS (`percent`, `arrow.left.arrow.right`, `banknote`) y vectores con el mismo dibujo en Android (`drawable/tab_*.xml`), con el color de la pestaña seleccionada.

### Modo diagnóstico

Si la app arranca con `FINSIM_DIAGNOSTICO`, comprueba el runtime (formato, cálculo, Excel, PDF, escritura en disco) y abre el menú de compartir. Los resultados salen en la consola con el prefijo `[diag]`.

```bash
# iOS (simulador)
SIMCTL_CHILD_FINSIM_DIAGNOSTICO=1 xcrun simctl launch booted com.etenorio87.finsim
xcrun simctl spawn booted log show --last 1m --predicate 'eventMessage CONTAINS "[diag]"'

# Android
adb shell am start -n com.etenorio87.finsim/com.tns.NativeScriptActivity --es FINSIM_DIAGNOSTICO 1
adb logcat | grep '\[diag\]'
```

## Resultados de la prueba técnica

Probado en el simulador de iOS (iPhone 15 Pro) y en el emulador de Android (API 36). En Android la interacción se automatizó con `adb`; en iOS se probó a mano.

| Qué | Resultado |
|---|---|
| Monorepo | Proyecto basado en `package.json`; Nx lo detecta y convierte sus scripts en targets. `@nativescript/nx` no hace falta (y exige Nx 22) |
| Angular | Una sola copia de Angular 22.2 para la web y el móvil. Sin zone.js, igual que la web |
| `@finsim/core` y `@finsim/shared` | Compilan y funcionan sin cambios de arquitectura. Misma TAE que la web |
| **`Intl` no existe** | El V8 de NativeScript se compila sin internacionalización: `toLocaleString('es-ES')` devuelve `"10000.5"`. **Corregido en `@finsim/core`**: el formato es-ES se hace sin `Intl` (comprobado contra `Intl` con miles de valores) |
| jsPDF | Funciona con su build ES. NativeScript resuelve la condición `node` de los `exports`, así que se fuerza la build ES en `webpack.config.js` |
| SheetJS (xlsx) | Funciona sin cambios |
| Exportar | Excel (≈23 kB) y PDF (≈32 kB) en menos de 70 ms; idénticos a los de la web |
| Compartir | iOS: `UIActivityViewController`. Android: `ACTION_SEND` con `content://` a través de un `FileProvider`. Código propio, sin plugin: el probado (`ui-share-file`) desactivaba StrictMode y no daba permiso de lectura al selector |
| Campo decimal | Android: teclado numérico que admite `,` y `.` (por defecto descarta la coma) y selección del valor al enfocar, comprobados. iOS: teclado `DecimalPad` y selección al enfocar, comprobados |
| Foco en Android | Al cerrar el teclado, Android da el foco al primer campo y lo deja en modo edición. Se evita haciendo enfocable el contenedor de la página |
| "Simular" con el teclado abierto | Calcula con lo que se está escribiendo: se cierra el teclado antes, lo que confirma el valor. Comprobado en iOS y Android |

### Resuelto en la Fase 5

- Separador de miles: `parseDecimal` entiende `1.234,56` y `1,234.56` (el último separador es el decimal).
- `SegmentedBar` sustituido por un selector propio; sin `ActionBar` (cada pestaña tiene su cabecera).
- Directiva `fsContenedorEnfocable` en todas las pantallas.
- iOS: el teclado tapaba los campos de la parte baja (p. ej. las comisiones). `@nativescript/iqkeyboardmanager` desplaza la pantalla, añade una barra con "Hecho" y anterior/siguiente (el teclado decimal no tiene tecla para cerrarse) y cierra el teclado al tocar fuera. Ver `plataforma/teclado.ts`.
- El campo comunica el valor mientras se escribe: en Android, cerrar el teclado con "atrás" no quita el foco y el resultado no se actualizaba. "Hecho" en el teclado sale del campo.

## Verificación de la Fase 5

Android (emulador, interacción automatizada con `adb`), mismas cifras que la web en la Fase 3:

| Flujo | Resultado |
|---|---|
| Simular (10.000 €, 24 meses, 6 %) | TAE 6,17 %, cuota 443,21 €, coste 636,95 €, saldo medio 5307,89 €; cuadro de 24 filas |
| Comisión de 100 € | TAE 7,21 % (igual que el motor en Node), sin salir del campo |
| Amortización parcial 1000 € en la cuota 6 | Reducir plazo: 82,16 € de ahorro; reducir cuota: 48,17 € y cuota 58,23 € menor |
| Comparar | "Mejor oferta: A"; con plazos distintos, "Dinero más barato: B" y "estarás endeudado 3 años más" |
| Contado | "Conviene FINANCIAR, ganas 4,03 %"; con 2 % bruto, "Mejor pagar AL CONTADO, pierdes 2,45 %" |
| Validación | Importe 0 → "Debe ser mayor que 0" y el resultado se oculta |

iOS (simulador): las cuatro pantallas se muestran correctamente; la interacción se prueba a mano.

## Fase 6: pulido

### Cuadro de amortización

Con 360 cuotas, la tabla dentro de la tarjeta eran 1800 etiquetas creadas de golpe: **4,7 s** con la pantalla congelada (Android, compilación de depuración). Ahora se abre a pantalla completa en una lista nativa (`ListView`: RecyclerView / UITableView), que solo crea las filas visibles: tarda lo mismo con 24 cuotas que con 360 (~1 s, incluida la animación del modal en depuración) y se desplaza con fluidez.

### Accesibilidad

| Qué | Cómo |
|---|---|
| Nombre de cada campo | Directiva `fsEtiquetaAccesible`. iOS: `accessibilityLabel`. Android: el nombre va como *hint* del nodo de accesibilidad, porque el `contentDescription` que pone NativeScript no se actualiza al escribir y TalkBack leería el valor antiguo |
| Resultado del cálculo | Se anuncia al pulsar el botón ("TAE 6,17 %, cuota 443,21 €"); si hay errores, "Revisa los datos" |
| Títulos | `accessibilityRole="header"`: se puede saltar de sección en sección |
| Botones dibujados con etiquetas | Rol de botón y nombre ("Eliminar comisión", "Cerrar…"); áreas táctiles más grandes en "✕" y "+ Añadir comisión" |
| Filas del cuadro | Se leen completas: "Cuota 3: 443,21 €. Interés 46,06 €, capital…" |
| Tamaño de letra del sistema | Android lo aplica siempre. En iOS se activa con tope de 1,4×; los títulos pasan a dos líneas. Probado con Android a 2× (lo único que se recorta es "Trimestral" en el selector) |

### Corregido

- **Comisiones en Android: la coma decimal se ignoraba** ("1,5" se quedaba en "15"). Un campo añadido a una pantalla ya cargada recibe `loaded` al insertarse, antes de que Angular escuche el evento y le pase las entradas, así que nunca se configuraba el teclado. Ahora se configura en `ngAfterViewInit` si la vista ya estaba cargada. Afectaba también al panel de amortización parcial.

### Pendiente (Fase 7)

- Probar en dispositivos reales: recibir el archivo en Mail, WhatsApp o Archivos; VoiceOver y TalkBack con el lector activo; la pantalla de arranque de iOS (en el simulador dura milisegundos).
- Identificador definitivo de la app, firma y tamaño de las versiones de publicación.
