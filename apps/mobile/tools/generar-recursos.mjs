/**
 * Genera los iconos y las pantallas de arranque de iOS y Android a partir de
 * recursos/icono.svg. El resultado se versiona en App_Resources: solo hay que
 * volver a ejecutarlo si cambia el icono.
 *
 *   node apps/mobile/tools/generar-recursos.mjs
 *
 * Requiere macOS (sips convierte el SVG; el SVG de ImageMagick no pinta
 * degradados) e ImageMagick (`magick`) para redimensionar.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MOVIL = join(dirname(fileURLToPath(import.meta.url)), '..');
const RECURSOS = join(MOVIL, 'App_Resources');
const IOS = join(RECURSOS, 'iOS/Assets.xcassets');
const RES = join(RECURSOS, 'Android/src/main/res');

/** Fondo de la app (app.css): también el de la pantalla de arranque. */
const FONDO = '#fffbf7';

const svg = readFileSync(join(MOVIL, 'recursos/icono.svg'), 'utf8');
const temporal = mkdtempSync(join(tmpdir(), 'finsim-recursos-'));

function svgAPng(contenido, nombre) {
  const origen = join(temporal, `${nombre}.svg`);
  const destino = join(temporal, `${nombre}.png`);
  writeFileSync(origen, contenido);
  execFileSync('sips', ['-s', 'format', 'png', origen, '--out', destino], { stdio: 'ignore' });
  return destino;
}

function redimensionar(origen, lado, destino, opciones = []) {
  execFileSync('magick', [origen, '-resize', `${lado}x${lado}`, ...opciones, '-strip', destino]);
}

function colorSolido(ancho, alto, destino) {
  execFileSync('magick', ['-size', `${ancho}x${alto}`, `xc:${FONDO}`, '-strip', destino]);
}

// Maestros de 1024 px: cuadrado (iOS recorta las esquinas) y con esquinas
// redondeadas (iconos de Android anteriores a la 8 y pantallas de arranque)
const cuadrado = svgAPng(svg, 'cuadrado');
const redondeado = svgAPng(svg.replace('<rect width="1024" height="1024"', '<rect width="1024" height="1024" rx="230"'), 'redondeado');

// iOS: icono de la app (opaco: la App Store rechaza iconos con transparencia)
const iconosIos = JSON.parse(readFileSync(join(IOS, 'AppIcon.appiconset/Contents.json'), 'utf8')).images;
for (const { size, scale, filename } of iconosIos) {
  if (!filename) continue;
  const lado = Math.round(parseFloat(size) * parseFloat(scale));
  redimensionar(cuadrado, lado, join(IOS, 'AppIcon.appiconset', filename), ['-alpha', 'off']);
}

// Google Play: icono de la ficha (512 px, cuadrado: la tienda aplica la máscara)
redimensionar(cuadrado, 512, join(MOVIL, 'tienda/icono-512.png'), ['-alpha', 'off']);

// iOS: pantalla de arranque = fondo liso + icono de 120 pt en el centro
for (const [sufijo, escala] of [['', 1], ['@2x', 2], ['@3x', 3]]) {
  redimensionar(redondeado, 120 * escala, join(IOS, `LaunchScreen.Center.imageset/LaunchScreen-Center${sufijo}.png`));
  colorSolido(768 * escala, 1024 * escala, join(IOS, `LaunchScreen.AspectFill.imageset/LaunchScreen-AspectFill${sufijo}.png`));
}

// Android: densidades (1x = mdpi)
const DENSIDADES = { ldpi: 0.75, mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [densidad, escala] of Object.entries(DENSIDADES)) {
  // Icono para Android 7 (el 8+ usa el adaptativo de mipmap-anydpi-v26)
  if (densidad !== 'ldpi') redimensionar(redondeado, 48 * escala, join(RES, `mipmap-${densidad}/ic_launcher.png`));
  // Pantalla de arranque de Android 7–11 (la 12+ muestra el icono adaptativo)
  redimensionar(redondeado, Math.round(96 * escala), join(RES, `drawable-${densidad}/logo.png`));
}

// Android: icono adaptativo como vectores. El icono mide 108 dp y solo se ve el
// círculo central de 72 dp: el diseño de 1024 se escala a 72 dp y se centra.
const trazos = [...svg.matchAll(/<circle cx="(\d+)" cy="(\d+)" r="(\d+)" stroke-width="(\d+)"\/>/g)]
  .map(([, cx, cy, r, ancho]) => ({ d: `M${cx - r},${cy}a${r},${r} 0,1 0,${2 * r},0a${r},${r} 0,1 0,${-2 * r},0`, ancho }))
  .concat([...svg.matchAll(/<line x1="(\d+)" y1="(\d+)" x2="(\d+)" y2="(\d+)" stroke-width="(\d+)"\/>/g)]
    .map(([, x1, y1, x2, y2, ancho]) => ({ d: `M${x1},${y1}L${x2},${y2}`, ancho })));
const [inicio, fin] = [...svg.matchAll(/stop-color="(#[0-9a-f]{6})"/g)].map((m) => m[1]);
const lienzo = (1024 * 108) / 72;
const margen = (lienzo - 1024) / 2;

writeFileSync(
  join(RES, 'drawable/ic_launcher_foreground.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<!-- Generado por tools/generar-recursos.mjs a partir de recursos/icono.svg -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="${lienzo}" android:viewportHeight="${lienzo}">
  <group android:translateX="${margen}" android:translateY="${margen}">
${trazos.map(({ d, ancho }) => `    <path android:pathData="${d}" android:strokeColor="#FFFFFF" android:strokeWidth="${ancho}" android:strokeLineCap="round"/>`).join('\n')}
  </group>
</vector>
`,
);

writeFileSync(
  join(RES, 'drawable/ic_launcher_background.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<!-- Generado por tools/generar-recursos.mjs a partir de recursos/icono.svg -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
  <path android:pathData="M0,0h108v108h-108z">
    <aapt:attr name="android:fillColor">
      <gradient android:type="linear" android:startX="0" android:startY="0" android:endX="108" android:endY="108"
          android:startColor="${inicio.toUpperCase()}" android:endColor="${fin.toUpperCase()}"/>
    </aapt:attr>
  </path>
</vector>
`,
);

rmSync(temporal, { recursive: true, force: true });
console.log('Recursos generados en', RECURSOS);
console.log('iOS:', readdirSync(join(IOS, 'AppIcon.appiconset')).filter((f) => f.endsWith('.png')).length, 'iconos');
