/**
 * Muestra el resultado de una financiación con JERARQUÍA CORRECTA (§5)
 *
 * ORDEN OBLIGATORIO:
 * 1. TAE (GRANDE) - El precio del dinero, LO QUE DECIDE
 * 2. Cuota (mediana) - Restricción de presupuesto, NO criterio de elección
 * 3. Coste total (pequeño) - Informativo, con AVISO si plazos difieren
 */

import { useState } from 'react';
import type { Resultado } from '../../core/types';

interface Props {
  resultado: Resultado;
  label?: string;
  colorAccent?: string;
  esGanadora?: boolean;
  mostrarAviso?: boolean;
  avisoTexto?: string;
}

export default function ResultadoFinanciacion({
  resultado,
  label,
  colorAccent = 'blue',
  esGanadora = false,
  mostrarAviso = false,
  avisoTexto,
}: Props) {
  const [mostrarCuadro, setMostrarCuadro] = useState(false);

  const borderClasses = {
    blue: 'border-blue-500',
    emerald: 'border-emerald-500',
    amber: 'border-amber-500',
  };

  const textClasses = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
  };

  const borderClass = borderClasses[colorAccent as keyof typeof borderClasses] || borderClasses.blue;
  const textClass = textClasses[colorAccent as keyof typeof textClasses] || textClasses.blue;

  return (
    <div
      className={`bg-slate-800 rounded-lg p-6 border-2 ${
        esGanadora ? borderClass : 'border-slate-700'
      }`}
    >
      {label && (
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-300">{label}</h4>
          {esGanadora && (
            <span className={`text-sm font-medium ${textClass}`}>
              ✓ Mejor oferta
            </span>
          )}
        </div>
      )}

      {/* 1. TAE - LO MÁS IMPORTANTE (grande) */}
      <div className="mb-6">
        <div className="text-sm text-slate-400 mb-1">TAE (precio real del dinero)</div>
        <div className={`text-5xl font-bold ${esGanadora ? textClass : 'text-white'}`}>
          {(resultado.tae * 100).toFixed(2)}%
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Este es el coste real. Compara siempre por TAE.
        </div>
      </div>

      {/* 2. Cuota - Restricción de presupuesto (mediana) */}
      <div className="mb-4 pb-4 border-b border-slate-700">
        <div className="text-sm text-slate-400 mb-1">Cuota</div>
        <div className="text-2xl font-semibold text-white">
          {resultado.cuota.toFixed(2)} €
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {resultado.cuadro ? `cada ${getPeriodoTexto(resultado.cuadro.length)}` : ''}
        </div>
      </div>

      {/* 3. Costes informativos (pequeños) */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-slate-500">Coste financiero</div>
          <div className="text-white font-medium">
            {resultado.costeFinanciero.toFixed(2)} €
          </div>
        </div>
        <div>
          <div className="text-slate-500">Coste total</div>
          <div className="text-white font-medium">
            {resultado.costeTotal.toFixed(2)} €
          </div>
        </div>
        <div>
          <div className="text-slate-500">TIN nominal</div>
          <div className="text-white font-medium">
            {(resultado.tin * 100).toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-slate-500">Saldo medio</div>
          <div className="text-white font-medium">
            {resultado.saldoMedio.toFixed(2)} €
          </div>
        </div>
      </div>

      {/* Aviso de plazos distintos */}
      {mostrarAviso && avisoTexto && (
        <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 text-lg">⚠️</span>
            <div className="text-sm text-amber-200">
              {avisoTexto}
            </div>
          </div>
        </div>
      )}

      {/* Cuadro de amortización (colapsable) */}
      {resultado.cuadro && (
        <div className="mt-4">
          <button
            onClick={() => setMostrarCuadro(!mostrarCuadro)}
            className="text-sm text-slate-400 hover:text-white flex items-center gap-2"
          >
            <span>{mostrarCuadro ? '▼' : '▶'}</span>
            Ver cuadro de amortización ({resultado.cuadro.length} cuotas)
          </button>

          {mostrarCuadro && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="text-left py-2">#</th>
                    <th className="text-right py-2">Cuota</th>
                    <th className="text-right py-2">Interés</th>
                    <th className="text-right py-2">Capital</th>
                    <th className="text-right py-2">Pendiente</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {resultado.cuadro.map((fila) => (
                    <tr
                      key={fila.numero}
                      className="border-b border-slate-800 hover:bg-slate-700/30"
                    >
                      <td className="py-2">{fila.numero}</td>
                      <td className="text-right">{fila.cuota.toFixed(2)}</td>
                      <td className="text-right">{fila.interes.toFixed(2)}</td>
                      <td className="text-right">{fila.capital.toFixed(2)}</td>
                      <td className="text-right">
                        {fila.capitalPendiente.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getPeriodoTexto(numeroCuotas: number): string {
  if (numeroCuotas <= 12) return 'mes';
  if (numeroCuotas <= 48) return 'mes';
  return 'periodo';
}
