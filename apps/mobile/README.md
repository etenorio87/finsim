# @finsim/mobile

App nativa de FinSim para iOS y Android: **NativeScript 9 + Angular 22** sobre `@finsim/shared`. La app solo aporta las vistas (elementos nativos) y la integración con cada plataforma; el estado, los formularios, el formato y la exportación son los mismos que usa la web.

> Estado: **prueba técnica (Fase 4)**. Hay una única pantalla, el simulador, que valida la arquitectura. La app completa se construye en la Fase 5.

## Desarrollo

Requisitos: Xcode (iOS) y/o Android SDK + JDK 21 (Android), con `ANDROID_HOME` definido. `npx ns doctor` (desde `apps/mobile`) comprueba el entorno.

```bash
npm run ios          # compila, instala en el simulador y recarga al guardar (desde la raíz o desde apps/mobile)
npm run android      # ídem en el emulador o dispositivo Android
npx nx run @finsim/mobile:typecheck
```

En Xcode 27 el simulador se ve en **DeviceHub** (`Xcode.app/Contents/Applications/DeviceHub.app`). Si el teclado del Mac está conectado al simulador, iOS no muestra el teclado en pantalla: **Device → Keyboard → Toggle Software Keyboard**.

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

### Pendiente para la Fase 5

- Probar en dispositivos reales: recibir el archivo en Mail, WhatsApp o Archivos.
- Separador de miles al escribir: en Android se pueden teclear `.` y `,` a la vez (`1.234,56` se interpreta como 1,23 €). Con el teclado decimal de iOS no ocurre.
- Estilo de `SegmentedBar` en Android (azul por defecto, corta "TRIMESTRAL") y título de la `ActionBar`.
- Una directiva para el "contenedor enfocable", que ahora está en la pantalla del simulador.
