import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CampoDecimalComponent } from './campo-decimal';

@Component({
  imports: [ReactiveFormsModule, CampoDecimalComponent],
  template: `
    <fs-campo-decimal [formControl]="tin" modo="porcentaje" />
    <fs-campo-decimal [formControl]="importe" modo="importe" />
  `,
})
class Anfitrion {
  readonly tin = new FormControl(0.06, { nonNullable: true });
  readonly importe = new FormControl(10000, { nonNullable: true });
}

async function montar() {
  const fixture = TestBed.createComponent(Anfitrion);
  await fixture.whenStable();
  const [tin, importe] = [...(fixture.nativeElement as HTMLElement).querySelectorAll('input')] as HTMLInputElement[];
  const escribir = async (input: HTMLInputElement, texto: string) => {
    input.dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    input.value = texto;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  };
  return { host: fixture.componentInstance, fixture, tin: tin!, importe: importe!, escribir };
}

describe('CampoDecimalComponent (web)', () => {
  it('muestra el valor formateado en es-ES', async () => {
    const { tin, importe } = await montar();
    expect(tin.value).toBe('6,00');
    expect(importe.value).toBe('10.000,00');
  });

  it('al enfocar muestra el número editable', async () => {
    const { fixture, importe } = await montar();
    importe.dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(importe.value).toBe('10000');
  });

  it('al enfocar cambia el texto y lo selecciona sin esperar al render', async () => {
    const { host, fixture, tin } = await montar();
    tin.focus();
    // Sin whenStable(): lo que se escriba ahora debe sustituir al texto, no añadirse detrás.
    expect(tin.value).toBe('6');
    expect([tin.selectionStart, tin.selectionEnd]).toEqual([0, 1]);
    tin.setRangeText('12,5', tin.selectionStart!, tin.selectionEnd!, 'end');
    tin.dispatchEvent(new Event('input'));
    tin.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(host.tin.value).toBe(0.125);
    expect(tin.value).toBe('12,50');
  });

  it('regresión #1:"14,95" en el TIN → 0.1495 en el formulario', async () => {
    const { host, tin, escribir } = await montar();
    await escribir(tin, '14,95');
    expect(host.tin.value).toBe(0.1495);
    expect(tin.value).toBe('14,95');
  });

  it('regresión #2: "9854.64" en el importe → 9854.64 y se muestra "9854,64"', async () => {
    const { host, importe, escribir } = await montar();
    await escribir(importe, '9854.64');
    expect(host.importe.value).toBe(9854.64);
    expect(importe.value).toBe('9854,64');
  });

  it('refleja los cambios hechos desde el formulario', async () => {
    const { host, fixture, importe } = await montar();
    host.importe.setValue(2500.5);
    await fixture.whenStable();
    expect(importe.value).toBe('2500,50');
  });

  it('se deshabilita con el control', async () => {
    const { host, fixture, tin } = await montar();
    host.tin.disable();
    await fixture.whenStable();
    expect(tin.disabled).toBe(true);
  });
});
