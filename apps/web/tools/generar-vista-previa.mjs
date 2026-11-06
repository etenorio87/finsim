/**
 * Genera public/vista-previa.png (la imagen que muestran WhatsApp, Telegram,
 * LinkedIn… al compartir el enlace) a partir de recursos/vista-previa.svg.
 *
 *   node apps/web/tools/generar-vista-previa.mjs
 *
 * Usa Chrome sin interfaz: el renderizador de SVG de macOS (sips) ignora la
 * negrita de los textos. Ruta de Chrome configurable con CHROME=...
 */

import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const destino = join(WEB, 'public/vista-previa.png');

execFileSync(CHROME, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1200,630',
  `--screenshot=${destino}`,
  pathToFileURL(join(WEB, 'recursos/vista-previa.svg')).href,
], { stdio: 'ignore' });

console.log('Generada', destino);
