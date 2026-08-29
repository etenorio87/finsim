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
  colorAccent?: 'primary' | 'accent' | 'positive';
  esGanadora?: boolean;
  textoBadge?: string;
  mostrarAviso?: boolean;
  avisoTexto?: string;
}

export default function ResultadoFinanciacion({
  resultado,
  label,
  colorAccent = 'primary',
  esGanadora = false,
  textoBadge = 'Mejor oferta',
  mostrarAviso = false,
  avisoTexto,
}: Props) {
  const [mostrarCuadro, setMostrarCuadro] = useState(false);

  const colorClasses = {
    primary: {
      border: 'border-primary',
      text: 'text-primary',
      bg: 'bg-primary/5',
      gradient: 'from-primary/10 to-transparent',
    },
    accent: {
      border: 'border-accent',
      text: 'text-accent',
      bg: 'bg-accent/5',
      gradient: 'from-accent/10 to-transparent',
    },
    positive: {
      border: 'border-positive',
      text: 'text-positive',
      bg: 'bg-positive/5',
      gradient: 'from-positive/10 to-transparent',
    },
  };

  const colors = colorClasses[colorAccent];

  return (
    <div
      className={`bg-card rounded-2xl p-6 border-2 transition-all ${
        esGanadora
          ? `${colors.border} shadow-hover`
          : 'border-gray-200 shadow-card'
      }`}
    >
      {label && (
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-bold text-lg text-secondary">{label}</h4>
          {esGanadora && (
            <span className={`${colors.text} text-sm font-bold px-3 py-1 rounded-full ${colors.bg} flex items-center gap-1`}>
              <span className="text-lg">✓</span> {textoBadge}
            </span>
          )}
        </div>
      )}

      {/* 1. TAE - LO MÁS IMPORTANTE (grande) */}
      <div className={`mb-6 pb-6 border-b-2 ${esGanadora ? colors.border : 'border-gray-100'}`}>
        <div className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center`}>
            <span className={`text-xs ${colors.text}`}>1</span>
          </span>
          TAE (precio real del dinero)
        </div>
        <div className={`text-6xl font-black ${esGanadora ? colors.text : 'text-secondary'} mb-2`}>
          {(resultado.tae * 100).toFixed(2)}%
        </div>
        <div className={`text-xs font-medium ${colors.text} ${colors.bg} inline-block px-3 py-1 rounded-full`}>
          Este es el coste real. Compara siempre por TAE.
        </div>
      </div>

      {/* 2. Cuota - Restricción de presupuesto (mediana) */}
      <div className="mb-6 pb-6 border-b border-gray-100">
        <div className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xs text-gray-600">2</span>
          </span>
          Cuota
        </div>
        <div className="text-3xl font-bold text-secondary">
          {resultado.cuota.toFixed(2)} €
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {resultado.cuadro ? `cada ${getPeriodoTexto(resultado.cuadro.length)}` : ''}
        </div>
      </div>

      {/* 3. Costes informativos (pequeños) */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Coste financiero</div>
          <div className="text-lg font-bold text-secondary">
            {resultado.costeFinanciero.toFixed(2)} €
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Coste total</div>
          <div className="text-lg font-bold text-secondary">
            {resultado.costeTotal.toFixed(2)} €
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">TIN nominal</div>
          <div className="text-lg font-bold text-secondary">
            {(resultado.tin * 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Saldo medio</div>
          <div className="text-lg font-bold text-secondary">
            {resultado.saldoMedio.toFixed(2)} €
          </div>
        </div>
      </div>

      {/* Aviso de plazos distintos */}
      {mostrarAviso && avisoTexto && (
        <div className="mb-6 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="text-sm text-yellow-800">
              <p className="font-bold mb-1">Atención</p>
              <p>{avisoTexto}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cuadro de amortización (colapsable) */}
      {resultado.cuadro && (
        <div>
          <button
            onClick={() => setMostrarCuadro(!mostrarCuadro)}
            className={`w-full text-sm font-medium ${colors.text} hover:${colors.bg} flex items-center justify-between gap-2 px-4 py-3 rounded-xl transition-colors border border-gray-200`}
          >
            <span className="flex items-center gap-2">
              <span>{mostrarCuadro ? '▼' : '▶'}</span>
              Ver cuadro de amortización
            </span>
            <span className="text-xs text-gray-500">
              {resultado.cuadro.length} cuotas
            </span>
          </button>

          {mostrarCuadro && (
            <div className="mt-4 overflow-x-auto bg-gray-50 rounded-xl p-4">
              <table className="w-full text-sm">
                <thead className="text-gray-600 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-2 font-semibold">#</th>
                    <th className="text-right py-3 px-2 font-semibold">Cuota</th>
                    <th className="text-right py-3 px-2 font-semibold">Interés</th>
                    <th className="text-right py-3 px-2 font-semibold">Capital</th>
                    <th className="text-right py-3 px-2 font-semibold">Pendiente</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {resultado.cuadro.map((fila, index) => (
                    <tr
                      key={fila.numero}
                      className={`border-b border-gray-200 hover:bg-white transition-colors ${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-2 font-medium">{fila.numero}</td>
                      <td className="text-right py-3 px-2">{fila.cuota.toFixed(2)}</td>
                      <td className="text-right py-3 px-2 text-negative">{fila.interes.toFixed(2)}</td>
                      <td className="text-right py-3 px-2 text-positive">{fila.capital.toFixed(2)}</td>
                      <td className="text-right py-3 px-2 font-semibold">
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
