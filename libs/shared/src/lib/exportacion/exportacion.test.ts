import { describe, it, expect } from 'vitest';
import { Injector } from '@angular/core';
import * as XLSX from 'xlsx';
import { calcular } from '@finsim/core';
import { CONDICIONES_SIMULADOR } from '../valores-iniciales';
import { generarExcel, generarPdf, nombreArchivo, MIME_PDF, MIME_XLSX, type ArchivoExportado } from './generadores';
import { DESTINO_EXPORTACION, ExportacionService } from './exportacion.service';

const condiciones = CONDICIONES_SIMULADOR; // 10.000 € · 24 cuotas · 6 %
const resultado = calcular(condiciones, { incluirCuadro: true });

describe('nombreArchivo', () => {
  it('mismo formato que la v1', () => {
    expect(nombreArchivo(condiciones, resultado.tae, 'xlsx')).toBe('amortizacion_10000€_24cuotas_6,17TAE.xlsx');
  });
});

describe('generarExcel', () => {
  it('genera un .xlsx con hoja de resumen y cuadro completo', async () => {
    const archivo = await generarExcel(condiciones, resultado);
    expect(archivo.tipoMime).toBe(MIME_XLSX);

    const libro = XLSX.read(new Uint8Array(archivo.datos), { type: 'array' });
    expect(libro.SheetNames).toEqual(['Resumen', 'Amortización']);

    const resumen = XLSX.utils.sheet_to_json<string[]>(libro.Sheets['Resumen']!, { header: 1 });
    expect(resumen).toContainEqual(['Cuota', '443,21 €']);
    expect(resumen).toContainEqual(['Frecuencia', 'Mensual']);

    const tabla = XLSX.utils.sheet_to_json<unknown[]>(libro.Sheets['Amortización']!, { header: 1 });
    expect(tabla).toHaveLength(1 + 24);
    expect(tabla[0]).toEqual(['Cuota', 'Importe', 'Interés', 'Capital', 'Pendiente']);
  });

  it('falla si no hay cuadro', async () => {
    await expect(generarExcel(condiciones, calcular(condiciones))).rejects.toThrow(/cuadro/);
  });
});

describe('generarPdf', () => {
  it('genera un PDF válido', async () => {
    const archivo = await generarPdf(condiciones, resultado, new Date(2026, 10, 3));
    expect(archivo.tipoMime).toBe(MIME_PDF);
    expect(archivo.nombre).toMatch(/\.pdf$/);
    const cabecera = new TextDecoder().decode(new Uint8Array(archivo.datos).slice(0, 5));
    expect(cabecera).toBe('%PDF-');
  });

  it('pagina un cuadro largo (360 cuotas)', async () => {
    const hipoteca = { ...condiciones, importe: 200000, numeroCuotas: 360 };
    const archivo = await generarPdf(hipoteca, calcular(hipoteca, { incluirCuadro: true }));
    const texto = new TextDecoder('latin1').decode(new Uint8Array(archivo.datos));
    const paginas = (texto.match(/\/Type \/Page\b/g) ?? []).length;
    expect(paginas).toBeGreaterThan(1);
  });
});

describe('ExportacionService', () => {
  it('genera el archivo y lo entrega al destino de la plataforma', async () => {
    const entregados: ArchivoExportado[] = [];
    const injector = Injector.create({
      providers: [
        ExportacionService,
        { provide: DESTINO_EXPORTACION, useValue: { entregar: async (a: ArchivoExportado) => void entregados.push(a) } },
      ],
    });
    const servicio = injector.get(ExportacionService);

    await servicio.exportarExcel(condiciones, resultado);
    await servicio.exportarPdf(condiciones, resultado);

    expect(entregados.map((a) => a.tipoMime)).toEqual([MIME_XLSX, MIME_PDF]);
  });
});
