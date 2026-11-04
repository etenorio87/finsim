# Ficha de FinSim en las tiendas

Textos y respuestas para dar de alta la app. Las capturas están en [capturas/](capturas/) y se regeneran con `apps/mobile/tools/capturas.sh`.

| Dato | Valor |
|---|---|
| Identificador (bundle ID / package) | `com.etenoriod.finsim` (no se puede cambiar después de publicar) |
| Versión | 1.0.0 (compilación 1) |
| Nombre bajo el icono | FinSim |
| Idioma principal | Español (España) |
| Precio | Gratis, sin compras ni anuncios |
| Política de privacidad | https://etenorio87.github.io/finsim/privacidad.html |
| Soporte | https://github.com/etenorio87/finsim/issues |
| Web | https://etenorio87.github.io/finsim/ |
| Copyright | © 2026 Ernesto Tenorio |

## App Store

| Campo | Texto |
|---|---|
| Nombre (30) | FinSim: Simulador TAE |
| Subtítulo (30) | Compara préstamos por su TAE |
| Categoría | Finanzas (secundaria: Utilidades) |
| Palabras clave (100) | `financiacion,prestamo,credito,tin,cuota,interes,amortizacion,calculadora,hipoteca,comparar,contado` |
| Texto promocional (170) | Antes de firmar una financiación, mira la TAE: el precio real del dinero. Compara ofertas y decide si te conviene financiar o pagar al contado. |

Las palabras clave no repiten las del nombre ("FinSim", "simulador", "TAE"): la App Store ya las tiene en cuenta.

### Descripción

```
¿Te ofrecen financiar una compra? FinSim te dice cuánto te cuesta de verdad.

La cuota mensual engaña: una cuota baja puede esconder un préstamo caro. FinSim calcula la TAE, el precio real del dinero, con las comisiones incluidas, para que compares ofertas con un solo número.

SIMULA UNA FINANCIACIÓN
• TAE, cuota y coste total a partir del importe, el número de cuotas, la frecuencia y el TIN
• Comisiones de apertura, por cuota o al final, incluidas en la TAE
• Cuadro de amortización completo, cuota a cuota

COMPARA DOS OFERTAS
• Gana la de menor TAE, aunque su cuota sea más alta
• Aviso si los plazos son distintos: más barata no siempre significa mejor si vas a estar más años endeudado

¿FINANCIAR O PAGAR AL CONTADO?
• Compara la TAE con lo que te rinde tu dinero después de impuestos y te dice qué conviene

AMORTIZACIÓN PARCIAL
• Cuánto ahorras adelantando capital: reduciendo la cuota o reduciendo el plazo

EXPORTA Y COMPARTE
• Excel o PDF con el resumen y el cuadro de amortización, para enviarlo por correo o guardarlo

PRIVADA POR DISEÑO
Sin registro, sin anuncios y sin conexión a internet: todos los cálculos se hacen en tu móvil y no se recoge ningún dato.

FinSim es una herramienta de cálculo orientativa. Las condiciones definitivas son las que figuren en el contrato de tu entidad.
```

### Privacidad de la app (App Store Connect → Privacidad de la app)

- ¿Recopilas datos de esta app? **No, no recopilamos datos de esta app.**
- El manifiesto de privacidad (`App_Resources/iOS/PrivacyInfo.xcprivacy`) declara lo mismo: sin rastreo ni datos recopilados.

### Clasificación por edades

Todas las respuestas del cuestionario: **No / Ninguno**. Resultado: 4+.

### Cumplimiento de exportación

La app no usa cifrado propio: `ITSAppUsesNonExemptEncryption = NO` en `Info.plist`, así que App Store Connect no lo pregunta en cada versión.

### Notas para la revisión

```
FinSim es una calculadora: no ofrece préstamos ni intermedia con entidades financieras, no necesita cuenta y funciona sin conexión.
Para probarla: en "Simular", pulsa "Simular financiación" con los datos de ejemplo; en "Comparar", "Comparar ofertas"; en "Contado", "Calcular decisión". Excel y PDF abren el menú de compartir.
```

### Capturas

iPhone de 6,9" (1320 × 2868), obligatorias. App Store Connect las reduce para los demás tamaños de iPhone. La app es solo para iPhone, así que no hacen falta capturas de iPad.

1. `01-formulario.png`: condiciones de la financiación
2. `02-simular.png`: TAE, cuota y costes
3. `03-cuadro.png`: cuadro de amortización
4. `04-amortizacion.png`: ahorro de la amortización parcial
5. `05-comparar.png`: veredicto del comparador
6. `06-contado.png`: financiar o pagar al contado

## Google Play (cuando haya cuenta)

| Campo | Texto |
|---|---|
| Nombre (30) | FinSim: Simulador TAE |
| Descripción breve (80) | Calcula la TAE real de una financiación y compara ofertas antes de firmar. |
| Descripción completa | La misma que en la App Store |
| Categoría | Finanzas |
| Seguridad de los datos | No se recogen ni se comparten datos |
| Anuncios | No contiene anuncios |
| Público objetivo | Mayores de 18 (es una app de finanzas, aunque no recoja datos) |

Google Play pide además:
- un icono de 512 × 512: `node apps/mobile/tools/generar-recursos.mjs` lo deja en `tienda/icono-512.png`;
- una imagen destacada de 1024 × 500;
- capturas de teléfono.

## Pasos para publicar en la App Store

1. **Xcode → Settings → Accounts**: inicia sesión con el Apple ID de Apple Developer Program. Debe aparecer tu equipo (no "Personal Team"). Anota el Team ID.
2. **App Store Connect → Apps → +**:
   - plataforma iOS;
   - nombre "FinSim: Simulador TAE";
   - idioma español;
   - bundle ID `com.etenoriod.finsim` (si no aparece, créalo en developer.apple.com → Identifiers);
   - SKU `finsim`.
3. **Compilar y subir**:
   ```bash
   cd apps/mobile
   npx ns build ios --release --for-device --team-id <TEAM_ID>   # genera el .ipa firmado
   npx ns publish ios --ipa platforms/ios/build/Release-iphoneos/mobile.ipa
   ```
   También se puede abrir `platforms/ios/mobile.xcworkspace` en Xcode y usar **Product → Archive → Distribute App**.
4. **TestFlight**: instala la compilación en tu iPhone y haz las pruebas en un dispositivo real (ver abajo).
5. Completa la ficha con los textos de este documento y las capturas y envíala a revisión.

## Pasos para publicar en Google Play

1. **Crea la clave de subida** una sola vez y guárdala fuera del repositorio (`.gitignore` ignora `*.jks`), con copia de seguridad. Sin ella no se pueden publicar actualizaciones (aunque con la firma de apps de Google Play se puede pedir otra):
   ```bash
   keytool -genkeypair -v -keystore ~/claves/finsim-subida.jks -alias finsim \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. **Compila el bundle firmado** (`.aab`, el formato que pide Google Play):
   ```bash
   cd apps/mobile
   npx ns build android --release --aab \
     --key-store-path ~/claves/finsim-subida.jks --key-store-alias finsim \
     --key-store-password <contraseña> --key-store-alias-password <contraseña>
   # → platforms/android/app/build/outputs/bundle/release/app-release.aab
   ```
3. **Play Console → Crear app**:
   - activa la firma de apps de Google Play;
   - sube el `.aab` a **Prueba interna**;
   - completa la ficha y los cuestionarios con los datos de este documento.
4. Las cuentas personales nuevas deben hacer una **prueba cerrada con al menos 12 testers durante 14 días** antes de poder publicar en producción.

## Pruebas en un dispositivo real (antes de enviar a revisión)

- [ ] Pantalla de arranque e icono en la pantalla de inicio
- [ ] Simular, comparar y contado con los datos de ejemplo (TAE 6,17 %, "Mejor oferta: A", "Conviene FINANCIAR")
- [ ] Comisión con decimales ("1,5") y el teclado no tapa el campo
- [ ] Exportar Excel y PDF: abrirlos en Archivos, enviarlos por Mail y WhatsApp
- [ ] Cuadro de 360 cuotas: se abre y se desplaza con fluidez
- [ ] VoiceOver: los campos dicen su nombre y, al simular, se anuncia el resultado
- [ ] Texto grande (Ajustes → Accesibilidad → Pantalla y tamaño del texto)
