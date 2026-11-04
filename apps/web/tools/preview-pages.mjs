/**
 * Sirve el artefacto de despliegue como lo haría GitHub Pages:
 * bajo /finsim/ y con 404.html (copia de index.html) para cualquier ruta
 * que no sea un archivo. Así se prueban los enlaces directos (/finsim/comparar)
 * antes de desplegar.
 *
 *   npx nx run @finsim/web:preview   →  http://localhost:4300/finsim/
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const RAIZ = 'dist/apps/web/browser';
const BASE = '/finsim/';
const PUERTO = Number(process.env.PORT ?? 4300);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
};

async function esArchivo(ruta) {
  try {
    return (await stat(ruta)).isFile();
  } catch {
    return false;
  }
}

createServer(async (req, res) => {
  const ruta = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);

  if (!ruta.startsWith(BASE)) {
    res.writeHead(302, { Location: BASE }).end();
    return;
  }

  // normalize() + comprobación del prefijo: no se sale de RAIZ con "../"
  let archivo = normalize(join(RAIZ, ruta.slice(BASE.length)));
  if (!archivo.startsWith(normalize(RAIZ))) {
    res.writeHead(400).end();
    return;
  }
  if (ruta.endsWith('/')) archivo = join(archivo, 'index.html');

  const existe = await esArchivo(archivo);
  const servido = existe ? archivo : join(RAIZ, '404.html');
  res.writeHead(existe ? 200 : 404, { 'Content-Type': TIPOS[extname(servido)] ?? 'application/octet-stream' });
  res.end(await readFile(servido));
}).listen(PUERTO, () => {
  console.log(`Vista previa de GitHub Pages en http://localhost:${PUERTO}${BASE}`);
});
