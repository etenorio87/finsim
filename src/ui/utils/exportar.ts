/**
 * Utilidades para exportar tablas de amortización a Excel y PDF
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Resultado, Condiciones } from '../../core/types';

/**
 * Formatea un número como moneda en euros
 */
function formatearMoneda(valor: number): string {
  return valor.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formatea un número como porcentaje
 */
function formatearPorcentaje(valor: number): string {
  return (valor * 100).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Genera nombre de archivo descriptivo
 */
function generarNombreArchivo(condiciones: Condiciones, tae: number, extension: string): string {
  const importe = Math.round(condiciones.importe);
  const cuotas = condiciones.numeroCuotas;
  const taeStr = (tae * 100).toFixed(2).replace('.', ',');
  return `amortizacion_${importe}€_${cuotas}cuotas_${taeStr}TAE.${extension}`;
}

/**
 * Exporta la tabla de amortización a Excel
 */
export function exportarExcel(condiciones: Condiciones, resultado: Resultado): void {
  if (!resultado.cuadro || resultado.cuadro.length === 0) {
    console.error('No hay cuadro de amortización para exportar');
    return;
  }

  // Crear libro de trabajo
  const wb = XLSX.utils.book_new();

  // Calcular frecuencia en texto
  const frecuenciaTexto = condiciones.frecuencia === 'mensual'
    ? 'Mensual'
    : condiciones.frecuencia === 'trimestral'
    ? 'Trimestral'
    : 'Anual';

  // Hoja 1: Resumen del préstamo
  const resumenData = [
    ['RESUMEN DEL PRÉSTAMO'],
    [''],
    ['Importe financiado', formatearMoneda(condiciones.importe) + ' €'],
    ['Número de cuotas', condiciones.numeroCuotas],
    ['Frecuencia', frecuenciaTexto],
    ['TIN anual', formatearPorcentaje(condiciones.tin) + ' %'],
    ['TAE', formatearPorcentaje(resultado.tae) + ' %'],
    [''],
    ['Cuota', formatearMoneda(resultado.cuota) + ' €'],
    ['Total a pagar', formatearMoneda(resultado.costeTotal) + ' €'],
    ['Coste financiero', formatearMoneda(resultado.costeFinanciero) + ' €'],
    ['Saldo medio', formatearMoneda(resultado.saldoMedio) + ' €'],
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);

  // Ajustar anchos de columna
  wsResumen['!cols'] = [
    { wch: 25 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  // Hoja 2: Tabla de amortización
  const headers = ['Cuota', 'Importe', 'Interés', 'Capital', 'Pendiente'];
  const tableData = resultado.cuadro.map((fila) => [
    fila.numero,
    formatearMoneda(fila.cuota),
    formatearMoneda(fila.interes),
    formatearMoneda(fila.capital),
    formatearMoneda(fila.capitalPendiente),
  ]);

  const wsTabla = XLSX.utils.aoa_to_sheet([headers, ...tableData]);

  // Ajustar anchos de columna
  wsTabla['!cols'] = [
    { wch: 8 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, wsTabla, 'Amortización');

  // Descargar archivo
  const nombreArchivo = generarNombreArchivo(condiciones, resultado.tae, 'xlsx');
  XLSX.writeFile(wb, nombreArchivo);
}

/**
 * Exporta la tabla de amortización a PDF
 */
export function exportarPDF(condiciones: Condiciones, resultado: Resultado): void {
  if (!resultado.cuadro || resultado.cuadro.length === 0) {
    console.error('No hay cuadro de amortización para exportar');
    return;
  }

  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Tabla de Amortización', 14, 20);

  // Resumen del préstamo
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

  // Tabla de amortización
  const tableData = resultado.cuadro.map((fila) => [
    fila.numero.toString(),
    formatearMoneda(fila.cuota) + ' €',
    formatearMoneda(fila.interes) + ' €',
    formatearMoneda(fila.capital) + ' €',
    formatearMoneda(fila.capitalPendiente) + ' €',
  ]);

  autoTable(doc, {
    head: [['Cuota', 'Importe', 'Interés', 'Capital', 'Pendiente']],
    body: tableData,
    startY: yStart + lineHeight * 4 + 5,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [255, 56, 92], // Color primary
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 },
      1: { halign: 'right', cellWidth: 32 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'right', cellWidth: 32 },
      4: { halign: 'right', cellWidth: 32 },
    },
  });

  // Pie de página
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(128);

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const fecha = new Date().toLocaleDateString('es-ES');
    doc.text(
      `Generado el ${fecha} - Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Descargar archivo
  const nombreArchivo = generarNombreArchivo(condiciones, resultado.tae, 'pdf');
  doc.save(nombreArchivo);
}
