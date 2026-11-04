/**
 * Diagnóstico del runtime (prueba técnica, Fase 4). Se ejecuta solo si la app
 * se lanza con FINSIM_DIAGNOSTICO (variable de entorno en iOS, extra del intent en Android):
 *
 *   SIMCTL_CHILD_FINSIM_DIAGNOSTICO=1 xcrun simctl launch --console-pty <sim> com.etenorio87.finsim
 *
 *   adb shell am start -n com.etenorio87.finsim/com.tns.NativeScriptActivity --es FINSIM_DIAGNOSTICO 1
 *
 * Escribe cada comprobación en la consola con el prefijo [diag].
 */

import { Application, File, isIOS, knownFolders, path } from '@nativescript/core';
import { calcular, formatearMoneda, formatearPorcentaje } from '@finsim/core';
import { CONDICIONES_SIMULADOR, generarExcel, generarPdf } from '@finsim/shared';

export function diagnosticoActivado(): boolean {
  if (isIOS) return !!NSProcessInfo.processInfo.environment.objectForKey('FINSIM_DIAGNOSTICO');
  const actividad = Application.android.foregroundActivity ?? Application.android.startActivity;
  return !!actividad?.getIntent()?.getStringExtra('FINSIM_DIAGNOSTICO');
}

export async function ejecutarDiagnostico(
  escribir: (ruta: string, datos: ArrayBuffer) => void,
  compartir: (ruta: string, nombre: string, tipoMime: string) => void,
): Promise<void> {
  const log = (clave: string, valor: unknown) => console.log(`[diag] ${clave}: ${JSON.stringify(valor)}`);
  const paso = async (clave: string, fn: () => unknown) => {
    try {
      log(clave, await fn());
    } catch (e) {
      log(clave, `ERROR ${e instanceof Error ? `${e.message}\n${e.stack}` : e}`);
    }
  };

  await paso('Intl', () => typeof Intl);
  await paso('toLocaleString es-ES', () => (10000.5).toLocaleString('es-ES', { minimumFractionDigits: 2 }));
  await paso('formatearMoneda(10000)', () => formatearMoneda(10000));
  await paso('formatearPorcentaje(0.0617)', () => formatearPorcentaje(0.0617));
  await paso('toLocaleDateString es-ES', () => new Date(2026, 10, 4).toLocaleDateString('es-ES'));

  const resultado = calcular(CONDICIONES_SIMULADOR, { incluirCuadro: true });
  await paso('TAE base', () => resultado.tae);

  const carpeta = knownFolders.documents().path;
  let ultimo: { ruta: string; nombre: string; tipoMime: string } | null = null;
  for (const [nombre, generar, magia] of [
    ['excel', generarExcel, 'PK'],
    ['pdf', generarPdf, '%PDF'],
  ] as const) {
    await paso(nombre, async () => {
      const inicio = Date.now();
      const archivo = await generar(CONDICIONES_SIMULADOR, resultado);
      const cabecera = String.fromCharCode(...new Uint8Array(archivo.datos.slice(0, magia.length)));
      const ruta = path.join(carpeta, archivo.nombre);
      escribir(ruta, archivo.datos);
      const tam = File.fromPath(ruta).size;
      ultimo = { ruta, nombre: archivo.nombre, tipoMime: archivo.tipoMime };
      return { nombre: archivo.nombre, bytes: archivo.datos.byteLength, enDisco: tam, cabeceraOk: cabecera === magia, ms: Date.now() - inicio, ruta };
    });
  }
  // Abre el menú de compartir con el último archivo (el PDF) para verlo en una captura
  if (ultimo) await paso('compartir', () => (compartir(ultimo!.ruta, ultimo!.nombre, ultimo!.tipoMime), 'abierto'));
  log('fin', true);
}
