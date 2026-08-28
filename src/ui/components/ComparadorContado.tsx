/**
 * Comparador: ¿Financiar o pagar al contado?
 *
 * Pregunta: ¿Me conviene financiar o pagar al contado con dinero que tengo rindiendo?
 * Respuesta: Financiar solo si TAE < rentabilidad neta.
 */

import { useState } from 'react';
import type { Condiciones } from '../../core/types';
import { calcular } from '../../core/motor';
import { compararConContado } from '../../core/comparadores';
import FormularioCondiciones from './FormularioCondiciones';
import ResultadoFinanciacion from './ResultadoFinanciacion';

const condicionesInicial: Condiciones = {
  importe: 10000,
  numeroCuotas: 24,
  frecuencia: 'mensual',
  tin: 0.04,
  comisiones: [],
};

export default function ComparadorContado() {
  const [condiciones, setCondiciones] = useState<Condiciones>(condicionesInicial);
  const [rentabilidadBruta, setRentabilidadBruta] = useState(10); // %
  const [tipoImpositivo, setTipoImpositivo] = useState(19); // %
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const handleComparar = () => {
    setMostrarResultados(true);
  };

  const decision = mostrarResultados
    ? compararConContado(
        condiciones,
        rentabilidadBruta / 100,
        tipoImpositivo / 100
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Descripción */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h2 className="font-semibold mb-2">
          ¿Te conviene financiar o pagar al contado?
        </h2>
        <p className="text-sm text-slate-400">
          Si tienes el dinero invertido y rindiendo, puede que te convenga financiar.
          La regla: financiar solo si{' '}
          <strong className="text-white">TAE &lt; rentabilidad neta</strong>.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Condiciones de la financiación */}
        <div className="bg-slate-800 rounded-lg p-5 border-2 border-blue-500/30">
          <FormularioCondiciones
            label="Condiciones de la financiación"
            condiciones={condiciones}
            onChange={setCondiciones}
            colorAccent="blue"
          />
        </div>

        {/* Tu inversión */}
        <div className="bg-slate-800 rounded-lg p-5 border-2 border-emerald-500/30">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Tu inversión</h3>

            {/* Rentabilidad bruta */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Rentabilidad bruta anual (%)
              </label>
              <input
                type="number"
                value={rentabilidadBruta}
                onChange={(e) =>
                  setRentabilidadBruta(parseFloat(e.target.value) || 0)
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="10"
                step="0.1"
              />
              <p className="text-xs text-slate-500 mt-1">
                La rentabilidad que obtienes ANTES de impuestos
              </p>
            </div>

            {/* Tipo impositivo */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Tipo impositivo (%)
              </label>
              <input
                type="number"
                value={tipoImpositivo}
                onChange={(e) =>
                  setTipoImpositivo(parseFloat(e.target.value) || 0)
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="19"
                step="1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Impuestos sobre las ganancias (19%, 21%, 23%, etc.)
              </p>
            </div>

            {/* Cálculo de rentabilidad neta */}
            {decision && (
              <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
                <div className="text-sm text-slate-400 mb-1">
                  Rentabilidad neta (después de impuestos)
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {(decision.rentabilidadNeta * 100).toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón comparar */}
      <button
        onClick={handleComparar}
        className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all"
      >
        Calcular decisión
      </button>

      {/* Resultados */}
      {decision && (
        <div className="space-y-6 animate-fade-in">
          {/* Decisión */}
          <div
            className={`rounded-lg p-6 border-2 ${
              decision.recomendacion === 'financiar'
                ? 'bg-emerald-600/20 border-emerald-500'
                : 'bg-blue-600/20 border-blue-500'
            }`}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">
                {decision.recomendacion === 'financiar' ? '✅' : '💰'}
              </div>
              <h3 className="text-3xl font-bold mb-2">
                {decision.recomendacion === 'financiar'
                  ? 'Conviene FINANCIAR'
                  : 'Mejor pagar AL CONTADO'}
              </h3>
              <p className="text-slate-300 text-lg">
                {decision.recomendacion === 'financiar' ? (
                  <>
                    Ganas{' '}
                    <span className="font-bold text-emerald-400">
                      {(decision.diferenciaTipos * 100).toFixed(2)}%
                    </span>{' '}
                    anual financiando
                  </>
                ) : (
                  <>
                    Pierdes{' '}
                    <span className="font-bold text-blue-400">
                      {(Math.abs(decision.diferenciaTipos) * 100).toFixed(2)}%
                    </span>{' '}
                    anual si financias
                  </>
                )}
              </p>
            </div>

            {/* Explicación */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-sm text-slate-400 mb-1">
                    TAE financiación
                  </div>
                  <div className="text-3xl font-bold text-blue-400">
                    {(decision.taeFinanciacion * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">
                    Rentabilidad neta
                  </div>
                  <div className="text-3xl font-bold text-emerald-400">
                    {(decision.rentabilidadNeta * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-400 text-center">
                {decision.recomendacion === 'financiar' ? (
                  <>
                    Tu dinero rinde más ({(decision.rentabilidadNeta * 100).toFixed(2)}%)
                    que el coste de financiar ({(decision.taeFinanciacion * 100).toFixed(2)}%).
                    <br />
                    <strong className="text-white">
                      Financia y mantén tu dinero invertido.
                    </strong>
                  </>
                ) : (
                  <>
                    El coste de financiar ({(decision.taeFinanciacion * 100).toFixed(2)}%)
                    es mayor que tu rentabilidad neta ({(decision.rentabilidadNeta * 100).toFixed(2)}%).
                    <br />
                    <strong className="text-white">
                      Paga al contado y ahorra intereses.
                    </strong>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Detalle de la financiación */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Detalle de la financiación
            </h3>
            <ResultadoFinanciacion
              resultado={calcular(condiciones, { incluirCuadro: true })}
              colorAccent="blue"
            />
          </div>
        </div>
      )}
    </div>
  );
}
