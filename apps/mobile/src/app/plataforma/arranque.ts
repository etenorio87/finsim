/**
 * Argumentos de arranque para los modos de desarrollo (diagnóstico, capturas):
 * variable de entorno en iOS, extra del intent en Android.
 *
 *   SIMCTL_CHILD_FINSIM_CAPTURA=simular xcrun simctl launch booted com.etenoriod.finsim
 *   adb shell am start -n com.etenoriod.finsim/com.tns.NativeScriptActivity --es FINSIM_CAPTURA simular
 */

import { Application, isIOS } from '@nativescript/core';

export function argumentoArranque(nombre: string): string | null {
  if (isIOS) return NSProcessInfo.processInfo.environment.objectForKey(nombre) as string | null;
  const actividad = Application.android.foregroundActivity ?? Application.android.startActivity;
  return actividad?.getIntent()?.getStringExtra(nombre) ?? null;
}
