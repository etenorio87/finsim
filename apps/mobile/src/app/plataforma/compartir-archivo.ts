/**
 * Destino de exportación en el móvil: guarda el archivo en la carpeta de
 * documentos de la app y abre el menú nativo de compartir.
 * (En la web, el equivalente descarga el archivo.)
 */

import { Injectable } from '@angular/core';
import { Application, Utils, isIOS, knownFolders, path } from '@nativescript/core';
import type { ArchivoExportado, DestinoExportacion } from '@finsim/shared';

@Injectable()
export class CompartirArchivo implements DestinoExportacion {
  async entregar({ nombre, tipoMime, datos }: ArchivoExportado): Promise<void> {
    const ruta = path.join(knownFolders.documents().path, nombre);
    escribirBytes(ruta, datos);
    compartir(ruta, nombre, tipoMime);
  }
}

export function compartir(ruta: string, nombre: string, tipoMime: string): void {
  if (isIOS) compartirIos(ruta);
  else compartirAndroid(ruta, nombre, tipoMime);
}

export function escribirBytes(ruta: string, datos: ArrayBuffer): void {
  if (isIOS) {
    // El runtime de iOS pasa el ArrayBuffer como puntero a los bytes
    const nsData = NSData.dataWithBytesLength(datos as never, datos.byteLength);
    if (!nsData.writeToFileAtomically(ruta, true)) throw new Error(`No se pudo escribir ${ruta}`);
    return;
  }
  const origen = new Uint8Array(datos);
  const bytes = Array.create('byte', origen.length);
  for (let i = 0; i < origen.length; i++) bytes[i] = (origen[i]! << 24) >> 24; // byte de Java: con signo
  const salida = new java.io.FileOutputStream(ruta);
  try {
    salida.write(bytes);
  } finally {
    salida.close();
  }
}

/** Hoja de compartir de iOS (AirDrop, Mail, Archivos, WhatsApp…). */
function compartirIos(ruta: string): void {
  const hoja = UIActivityViewController.alloc().initWithActivityItemsApplicationActivities([NSURL.fileURLWithPath(ruta)], null);
  let raiz = Utils.ios.getRootViewController() as UIViewController;
  while (raiz.presentedViewController) raiz = raiz.presentedViewController;
  // En iPad la hoja es un popover y necesita un ancla
  const popover = hoja.popoverPresentationController;
  if (popover) {
    popover.sourceView = raiz.view;
    popover.sourceRect = CGRectMake(raiz.view.bounds.size.width / 2, raiz.view.bounds.size.height, 0, 0);
  }
  raiz.presentViewControllerAnimatedCompletion(hoja, true, () => {});
}

/**
 * Selector de Android. El archivo se comparte como content:// a través del
 * FileProvider declarado en AndroidManifest.xml, con permiso de lectura para
 * la app elegida (y para la vista previa del selector, vía ClipData).
 */
function compartirAndroid(ruta: string, nombre: string, tipoMime: string): void {
  const Intent = android.content.Intent;
  const contexto = Utils.android.getApplicationContext() as android.content.Context;
  const uri = androidx.core.content.FileProvider.getUriForFile(contexto, `${contexto.getPackageName()}.provider`, new java.io.File(ruta));

  const envio = new Intent(Intent.ACTION_SEND);
  envio.setType(tipoMime);
  envio.putExtra(Intent.EXTRA_STREAM, uri);
  envio.setClipData(android.content.ClipData.newRawUri(nombre, uri));
  envio.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

  const actividad = (Application.android.foregroundActivity ?? Application.android.startActivity) as android.app.Activity;
  actividad.startActivity(Intent.createChooser(envio, nombre));
}
