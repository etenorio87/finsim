/**
 * Nombre de un campo de texto para el lector de pantalla:
 *
 *   <TextField fsEtiquetaAccesible="Importe en euros" …>
 *
 * - iOS: accessibilityLabel. VoiceOver lee la etiqueta y el texto actual.
 * - Android: no sirve accessibilityLabel. NativeScript lo convierte en
 *   contentDescription "etiqueta. texto" al cargar y no lo actualiza al
 *   escribir, así que TalkBack leería el valor antiguo. Se da la etiqueta como
 *   "hint" del nodo de accesibilidad (TalkBack: "100,00, cuadro de edición,
 *   Importe en euros") y el valor sigue saliendo del propio campo.
 */

import { Directive, ElementRef, HostListener, inject, input, type AfterViewInit } from '@angular/core';
import { isIOS, type EventData, type View } from '@nativescript/core';

@Directive({ selector: '[fsEtiquetaAccesible]' })
export class EtiquetaAccesibleDirective implements AfterViewInit {
  readonly fsEtiquetaAccesible = input.required<string>();
  private readonly elemento = inject<ElementRef<View>>(ElementRef);
  private iniciada = false;

  /**
   * Un campo añadido a una pantalla ya cargada (p. ej. una comisión) se carga
   * al insertarlo, antes de que Angular le pase las entradas: ese "loaded" se
   * ignora y se aplica aquí.
   */
  ngAfterViewInit(): void {
    this.iniciada = true;
    if (this.elemento.nativeElement.isLoaded) this.aplicar(this.elemento.nativeElement);
  }

  /** Cada vez que se vuelve a cargar: Android recrea las vistas nativas al cambiar de pestaña. */
  @HostListener('loaded', ['$event'])
  alCargar(evento: unknown): void {
    if (this.iniciada) this.aplicar((evento as EventData).object as View);
  }

  private aplicar(vista: View): void {
    const etiqueta = this.fsEtiquetaAccesible();
    if (!etiqueta) return;
    if (isIOS) {
      vista.accessibilityLabel = etiqueta;
    } else if (android.os.Build.VERSION.SDK_INT >= 26) {
      // NativeScript pone su propio delegado de accesibilidad en una microtarea
      // al cargar la vista: el nuestro va después y le delega todo lo demás
      setTimeout(() => {
        const nativa = vista.android as android.view.View | undefined;
        if (nativa) nativa.setAccessibilityDelegate(crearDelegado(etiqueta, nativa.getAccessibilityDelegate()));
      });
    }
  }
}

type Delegado = android.view.View.AccessibilityDelegate;
let crear: ((etiqueta: string, previo: Delegado | null) => Delegado) | undefined;

/** La clase nativa se define al usarla por primera vez: en iOS no existe `android`. */
function crearDelegado(etiqueta: string, previo: Delegado | null): Delegado {
  crear ??= definirDelegado();
  return crear(etiqueta, previo);
}

function definirDelegado(): (etiqueta: string, previo: Delegado | null) => Delegado {
  // El nombre debe ir literal: el generador de clases Java lo lee del código.
  // En los tipos de @nativescript/types se llama androidviewViewAccessibilityDelegate.
  @NativeClass()
  // @ts-expect-error: los tipos no exponen View.AccessibilityDelegate como clase
  class DelegadoEtiqueta extends android.view.View.AccessibilityDelegate {
    declare etiqueta: string;
    declare previo: Delegado | null;

    onInitializeAccessibilityNodeInfo(vista: android.view.View, nodo: android.view.accessibility.AccessibilityNodeInfo): void {
      if (this.previo) this.previo.onInitializeAccessibilityNodeInfo(vista, nodo);
      else super.onInitializeAccessibilityNodeInfo(vista, nodo);
      nodo.setHintText(this.etiqueta);
    }
  }
  return (etiqueta, previo) => {
    const delegado = new DelegadoEtiqueta();
    delegado.etiqueta = etiqueta;
    delegado.previo = previo;
    return delegado as unknown as Delegado;
  };
}
