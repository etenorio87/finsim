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
    <div className="space-y-6 animate-fade-in">
      {/* Descripción */}
      <div className="bg-gradient-to-br from-positive/10 to-primary/10 rounded-2xl p-6 border border-positive/20 shadow-soft">
        <h2 className="font-bold text-xl mb-3 text-secondary">
          ¿Te conviene financiar o pagar al contado?
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Si tienes el dinero invertido y rindiendo, puede que te convenga financiar.
          La regla: financiar solo si{' '}
          <strong className="text-primary">TAE &lt; rentabilidad neta</strong>.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Condiciones de la financiación */}
        <div className="bg-card rounded-2xl p-6 border-2 border-primary shadow-card hover:shadow-hover transition-shadow">
          <FormularioCondiciones
            label="Condiciones de la financiación"
            condiciones={condiciones}
            onChange={setCondiciones}
            colorAccent="primary"
          />
        </div>

        {/* Tu inversión */}
        <div className="bg-card rounded-2xl p-6 border-2 border-primary shadow-card hover:shadow-hover transition-shadow">
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-positive">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-positive/5 to-transparent border-2 border-positive flex items-center justify-center">
                <span className="font-bold text-positive">💰</span>
              </div>
              <h3 className="font-bold text-lg text-secondary">Tu inversión</h3>
            </div>

            {/* Rentabilidad bruta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rentabilidad bruta anual (%)
              </label>
              <input
                type="number"
                value={rentabilidadBruta}
                onChange={(e) =>
                  setRentabilidadBruta(parseFloat(e.target.value) || 0)
                }
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-secondary transition-all focus:border-positive"
                placeholder="10"
                step="0.1"
              />
              <p className="text-xs text-gray-500 mt-2">
                La rentabilidad que obtienes ANTES de impuestos
              </p>
            </div>

            {/* Tipo impositivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo impositivo (%)
              </label>
              <input
                type="number"
                value={tipoImpositivo}
                onChange={(e) =>
                  setTipoImpositivo(parseFloat(e.target.value) || 0)
                }
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-secondary transition-all focus:border-positive"
                placeholder="19"
                step="1"
              />
              <p className="text-xs text-gray-500 mt-2">
                Impuestos sobre las ganancias (19%, 21%, 23%, etc.)
              </p>
            </div>

            {/* Cálculo de rentabilidad neta */}
            {decision && (
              <div className="bg-gradient-to-br from-positive/10 to-transparent rounded-xl p-5 border-2 border-positive/30">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Rentabilidad neta (después de impuestos)
                </div>
                <div className="text-3xl font-black text-positive">
                  {(decision.rentabilidadNeta * 100).toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón calcular */}
      <button
        onClick={handleComparar}
        className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-5 px-6 rounded-2xl shadow-lg hover:shadow-hover transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="text-lg">Calcular decisión</span>
      </button>

      {/* Resultados */}
      {decision && (
        <div className="space-y-6 animate-slide-up">
          {/* Decisión */}
          <div
            className={`rounded-2xl p-8 border-2 shadow-card ${
              decision.recomendacion === 'financiar'
                ? 'bg-gradient-to-br from-positive/20 to-primary/10 border-positive'
                : 'bg-gradient-to-br from-primary/20 to-accent/10 border-primary'
            }`}
          >
            <div className="text-center">
              <div className="text-7xl mb-6">
                {decision.recomendacion === 'financiar' ? '✅' : '💰'}
              </div>
              <h3 className="text-4xl font-black mb-4 text-secondary">
                {decision.recomendacion === 'financiar'
                  ? 'Conviene FINANCIAR'
                  : 'Mejor pagar AL CONTADO'}
              </h3>
              <p className="text-xl text-gray-700 font-medium">
                {decision.recomendacion === 'financiar' ? (
                  <>
                    Ganas{' '}
                    <span className="font-black text-positive text-2xl">
                      {(decision.diferenciaTipos * 100).toFixed(2)}%
                    </span>{' '}
                    anual financiando
                  </>
                ) : (
                  <>
                    Pierdes{' '}
                    <span className="font-black text-negative text-2xl">
                      {(Math.abs(decision.diferenciaTipos) * 100).toFixed(2)}%
                    </span>{' '}
                    anual si financias
                  </>
                )}
              </p>
            </div>

            {/* Explicación */}
            <div className="mt-8 pt-8 border-t-2 border-white/30">
              <div className="grid md:grid-cols-2 gap-6 text-center">
                <div className="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    TAE financiación
                  </div>
                  <div className="text-4xl font-black text-primary">
                    {(decision.taeFinanciacion * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Rentabilidad neta
                  </div>
                  <div className="text-4xl font-black text-positive">
                    {(decision.rentabilidadNeta * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center bg-white/30 rounded-xl p-5 backdrop-blur-sm">
                <p className="text-gray-800 leading-relaxed">
                  {decision.recomendacion === 'financiar' ? (
                    <>
                      Tu dinero rinde más ({(decision.rentabilidadNeta * 100).toFixed(2)}%)
                      que el coste de financiar ({(decision.taeFinanciacion * 100).toFixed(2)}%).
                      <br />
                      <strong className="text-positive font-bold">
                        Financia y mantén tu dinero invertido.
                      </strong>
                    </>
                  ) : (
                    <>
                      El coste de financiar ({(decision.taeFinanciacion * 100).toFixed(2)}%)
                      es mayor que tu rentabilidad neta ({(decision.rentabilidadNeta * 100).toFixed(2)}%).
                      <br />
                      <strong className="text-primary font-bold">
                        Paga al contado y ahorra intereses.
                      </strong>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Detalle de la financiación */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-secondary">
              Detalle de la financiación
            </h3>
            <ResultadoFinanciacion
              resultado={calcular(condiciones, { incluirCuadro: true })}
              colorAccent="primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
