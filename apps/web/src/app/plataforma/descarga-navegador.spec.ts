import { TestBed } from '@angular/core/testing';
import { DescargaNavegador } from './descarga-navegador';

describe('DescargaNavegador', () => {
  it('descarga el archivo con su nombre y tipo', async () => {
    const crear = vi.fn(() => 'blob:prueba');
    const revocar = vi.fn();
    Object.assign(URL, { createObjectURL: crear, revokeObjectURL: revocar });
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('cuadro.pdf');
      expect(this.href).toBe('blob:prueba');
    });

    TestBed.configureTestingModule({ providers: [DescargaNavegador] });
    await TestBed.inject(DescargaNavegador).entregar({
      nombre: 'cuadro.pdf',
      tipoMime: 'application/pdf',
      datos: new Uint8Array([37, 80, 68, 70]).buffer,
    });

    expect(clic).toHaveBeenCalledOnce();
    const blob = (crear.mock.calls[0] as unknown as [Blob])[0];
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBe(4);
    await new Promise((r) => setTimeout(r));
    expect(revocar).toHaveBeenCalledWith('blob:prueba');
    clic.mockRestore();
  });
});
