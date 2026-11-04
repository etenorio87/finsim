import { describe, it, expect } from 'vitest';
import { Directive, Injector, runInInjectionContext } from '@angular/core';
import { CampoDecimalBase, textoEditable, textoFormateado, valorDesdeTexto } from './campo-decimal';

@Directive()
class CampoDePrueba extends CampoDecimalBase {
  // expone el estado protegido para el test
  get valorActual() {
    return this.valor();
  }
}

function crearCampo() {
  return runInInjectionContext(Injector.create({ providers: [] }), () => new CampoDePrueba());
}

describe('conversiones del campo', () => {
  it('formatea al mostrar según el modo', () => {
    expect(textoFormateado(10000, 'importe')).toBe('10.000,00');
    expect(textoFormateado(0.0545, 'porcentaje')).toBe('5,45');
    expect(textoFormateado(24, 'entero')).toBe('24');
  });

  it('al editar muestra el número sin separador de miles y con coma', () => {
    expect(textoEditable(9854.64, 'importe')).toBe('9854,64');
    expect(textoEditable(0.1495, 'porcentaje')).toBe('14,95');
  });

  it('regresión #1: "14,95" en un campo de porcentaje → 0.1495', () => {
    expect(valorDesdeTexto('14,95', 'porcentaje')).toBe(0.1495);
  });

  it('regresión #2: "9854.64" en un campo de importe → 9854.64', () => {
    expect(valorDesdeTexto('9854.64', 'importe')).toBe(9854.64);
  });

  it('el modo entero descarta decimales', () => {
    expect(valorDesdeTexto('24,7', 'entero')).toBe(24);
  });
});

describe('CampoDecimalBase (ControlValueAccessor)', () => {
  it('texto libre mientras escribe; valor y formato al salir', () => {
    const campo = crearCampo();
    const emitidos: number[] = [];
    let tocado = false;
    campo.registerOnChange((v) => emitidos.push(v));
    campo.registerOnTouched(() => (tocado = true));

    campo.writeValue(10000);
    expect(campo.texto()).toBe('10.000,00');

    campo.alEnfocar();
    expect(campo.texto()).toBe('10000');

    campo.alEscribir('9854.6'); // escritura intermedia: no se reformatea ni se emite
    expect(campo.texto()).toBe('9854.6');
    expect(emitidos).toEqual([]);

    campo.alEscribir('9854.64');
    campo.alSalir();
    expect(emitidos).toEqual([9854.64]);
    expect(tocado).toBe(true);
    expect(campo.texto()).toBe('9854,64');
    expect(campo.valorActual).toBe(9854.64);
  });

  it('con notificar, emite mientras escribe sin reformatear el texto', () => {
    const campo = crearCampo();
    const emitidos: number[] = [];
    campo.registerOnChange((v) => emitidos.push(v));
    campo.writeValue(10000);
    campo.alEnfocar();

    campo.alEscribir('2', true);
    campo.alEscribir('25', true);
    campo.alEscribir('25,5', true);
    expect(emitidos).toEqual([2, 25, 25.5]);
    expect(campo.texto()).toBe('25,5');
  });

  it('salir sin haber entrado no emite', () => {
    const campo = crearCampo();
    const emitidos: number[] = [];
    campo.registerOnChange((v) => emitidos.push(v));
    campo.alSalir();
    expect(emitidos).toEqual([]);
  });
});
