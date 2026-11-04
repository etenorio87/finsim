/**
 * Generación de Excel y PDF del cuadro de amortización, como bytes.
 *
 * Mismo contenido que la v1, pero sin descargar nada: el destino (descarga en
 * la web, compartir en el móvil) lo decide cada plataforma (ver DESTINO_EXPORTACION).
 * jsPDF y SheetJS se cargan bajo demanda para no pesar en la carga inicial.
 */

import type { Condiciones, FilaCuadro, Resultado } from '@finsim/core';
import { formatearFecha, formatearMoneda, formatearPorcentaje } from '@finsim/core';
import { TEXTO_FRECUENCIA } from '../textos/textos';

export interface ArchivoExportado {
  nombre: string;
  tipoMime: string;
  datos: ArrayBuffer;
}

export const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export const MIME_PDF = 'application/pdf';

/** p. ej. "amortizacion_10000€_24cuotas_6,17TAE.xlsx" (igual que la v1) */
export function nombreArchivo(condiciones: Condiciones, tae: number, extension: 'xlsx' | 'pdf'): string {
  const importe = Math.round(condiciones.importe);
  const taeStr = (tae * 100).toFixed(2).replace('.', ',');
  return `amortizacion_${importe}€_${condiciones.numeroCuotas}cuotas_${taeStr}TAE.${extension}`;
}

function cuadroObligatorio(resultado: Resultado): FilaCuadro[] {
  if (!resultado.cuadro || resultado.cuadro.length === 0) {
    throw new Error('No hay cuadro de amortización para exportar');
  }
  return resultado.cuadro;
}

export async function generarExcel(condiciones: Condiciones, resultado: Resultado): Promise<ArchivoExportado> {
  const cuadro = cuadroObligatorio(resultado);
  const XLSX = await import('xlsx');

  const wb = XLSX.utils.book_new();

  const wsResumen = XLSX.utils.aoa_to_sheet([
    ['RESUMEN DEL PRÉSTAMO'],
    [''],
    ['Importe financiado', formatearMoneda(condiciones.importe) + ' €'],
    ['Número de cuotas', condiciones.numeroCuotas],
    ['Frecuencia', TEXTO_FRECUENCIA[condiciones.frecuencia]],
    ['TIN anual', formatearPorcentaje(condiciones.tin) + ' %'],
    ['TAE', formatearPorcentaje(resultado.tae) + ' %'],
    [''],
    ['Cuota', formatearMoneda(resultado.cuota) + ' €'],
    ['Total a pagar', formatearMoneda(resultado.costeTotal) + ' €'],
    ['Coste financiero', formatearMoneda(resultado.costeFinanciero) + ' €'],
    ['Saldo medio', formatearMoneda(resultado.saldoMedio) + ' €'],
  ]);
  wsResumen['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  const wsTabla = XLSX.utils.aoa_to_sheet([
    ['Cuota', 'Importe', 'Interés', 'Capital', 'Pendiente'],
    ...cuadro.map((fila) => [
      fila.numero,
      formatearMoneda(fila.cuota),
      formatearMoneda(fila.interes),
      formatearMoneda(fila.capital),
      formatearMoneda(fila.capitalPendiente),
    ]),
  ]);
  wsTabla['!cols'] = [{ wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsTabla, 'Amortización');

  const datos: ArrayBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return { nombre: nombreArchivo(condiciones, resultado.tae, 'xlsx'), tipoMime: MIME_XLSX, datos };
}

/** `fecha` es inyectable para que el pie de página sea determinista en tests. */
export async function generarPdf(
  condiciones: Condiciones,
  resultado: Resultado,
  fecha: Date = new Date(),
): Promise<ArchivoExportado> {
  const cuadro = cuadroObligatorio(resultado);
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Tabla de Amortización', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const yStart = 32;
  const lineHeight = 6;

  doc.text(`Importe financiado: ${formatearMoneda(condiciones.importe)} €`, 14, yStart);
  doc.text(`Número de cuotas: ${condiciones.numeroCuotas}`, 14, yStart + lineHeight);
  doc.text(`TIN anual: ${formatearPorcentaje(condiciones.tin)} %`, 14, yStart + lineHeight * 2);
  doc.text(`TAE: ${formatearPorcentaje(resultado.tae)} %`, 14, yStart + lineHeight * 3);

  doc.text(`Cuota: ${formatearMoneda(resultado.cuota)} €`, 110, yStart);
  doc.text(`Total a pagar: ${formatearMoneda(resultado.costeTotal)} €`, 110, yStart + lineHeight);
  doc.text(`Coste financiero: ${formatearMoneda(resultado.costeFinanciero)} €`, 110, yStart + lineHeight * 2);

  autoTable(doc, {
    head: [['Cuota', 'Importe', 'Interés', 'Capital', 'Pendiente']],
    body: cuadro.map((fila) => [
      fila.numero.toString(),
      formatearMoneda(fila.cuota) + ' €',
      formatearMoneda(fila.interes) + ' €',
      formatearMoneda(fila.capital) + ' €',
      formatearMoneda(fila.capitalPendiente) + ' €',
    ]),
    startY: yStart + lineHeight * 4 + 5,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [255, 56, 92], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 },
      1: { halign: 'right', cellWidth: 32 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'right', cellWidth: 32 },
      4: { halign: 'right', cellWidth: 32 },
    },
  });

  const paginas = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(128);
  const textoFecha = formatearFecha(fecha);
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.text(
      `Generado el ${textoFecha} - Página ${i} de ${paginas}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' },
    );
  }

  return {
    nombre: nombreArchivo(condiciones, resultado.tae, 'pdf'),
    tipoMime: MIME_PDF,
    datos: doc.output('arraybuffer'),
  };
}
