/**
 * Puente entre Reactive Forms y signals.
 * Debe llamarse en un contexto de inyección (constructor o inicializador de campo).
 */

import { computed, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { AbstractControl } from '@angular/forms';
import { map, startWith } from 'rxjs';

export interface SenalesFormulario<T> {
  /** Valor transformado, actualizado en cada cambio del formulario. */
  valor: Signal<T>;
  valido: Signal<boolean>;
}

export function senalesFormulario<C extends AbstractControl, T>(
  control: C,
  proyectar: (control: C) => T,
): SenalesFormulario<T> {
  const valor = toSignal(control.valueChanges.pipe(map(() => proyectar(control))), {
    initialValue: proyectar(control),
  });
  const estado = toSignal(control.statusChanges.pipe(startWith(control.status)), {
    initialValue: control.status,
  });
  return { valor, valido: computed(() => estado() === 'VALID') };
}
