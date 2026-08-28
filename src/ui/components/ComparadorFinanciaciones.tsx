/**
 * Comparador de dos financiaciones
 *
 * Pregunta: ¿Cuál de estas dos financiaciones es mejor?
 * Respuesta: La que tiene menor TAE.
 */

import { useState } from 'react';
import type { Condiciones } from '../../core/types';
import { calcular } from '../../core/motor';
import { compararFinanciaciones } from '../../core/comparadores';
import FormularioCondiciones from './FormularioCondiciones';
import ResultadoFinanciacion from './ResultadoFinanciacion';

const condicionesInicialA: Condiciones = {
  importe: 10000,
  numeroCuotas: 24,
  frecuencia: 'mensual',
  tin: 0.06,
  comisiones: [],
};

const condicionesInicialB: Condiciones = {
  importe: 10000,
  numeroCuotas: 24,
  frecuencia: 'mensual',
  tin: 0.08,
  comisiones: [],
};

export default function ComparadorFinanciaciones() {
  const [condicionesA, setCondicionesA] = useState<Condiciones>(condicionesInicialA);
  const [condicionesB, setCondicionesB] = useState<Condiciones>(condicionesInicialB);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const handleComparar = () => {
    setMostrarResultados(true);
  };

  const comparacion = mostrarResultados
    ? compararFinanciaciones(condicionesA, condicionesB)
    : null;

  return (
    <div className="space-y-6">
      {/* Descripción */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h2 className="font-semibold mb-2">¿Cuál de estas dos ofertas es mejor?</h2>
        <p className="text-sm text-slate-400">
          Introduce las condiciones de cada oferta y compara. El criterio de decisión
          es la <strong className="text-white">TAE</strong> (el precio real del dinero),
          no la cuota mensual.
        </p>
      </div>

      {/* Formularios */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Oferta A */}
        <div className="bg-slate-800 rounded-lg p-5 border-2 border-blue-500/30">
          <FormularioCondiciones
            label="Oferta A"
            condiciones={condicionesA}
            onChange={setCondicionesA}
            colorAccent="blue"
          />
        </div>

        {/* Oferta B */}
        <div className="bg-slate-800 rounded-lg p-5 border-2 border-emerald-500/30">
          <FormularioCondiciones
            label="Oferta B"
            condiciones={condicionesB}
            onChange={setCondicionesB}
            colorAccent="emerald"
          />
        </div>
      </div>

      {/* Botón comparar */}
      <button
        onClick={handleComparar}
        className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all"
      >
        Comparar ofertas
      </button>

      {/* Resultados */}
      {comparacion && (
        <div className="space-y-6 animate-fade-in">
          {/* Resumen de la comparación */}
          <div className="bg-gradient-to-r from-blue-600/20 to-emerald-600/20 rounded-lg p-6 border border-blue-500/30">
            <h3 className="text-xl font-bold mb-2">
              Mejor oferta: {comparacion.ganadora === 'a' ? 'A' : 'B'}
            </h3>
            <p className="text-slate-300 text-sm">
              Diferencia de TAE:{' '}
              <span className="font-semibold">
                {(comparacion.diferenciaTae * 100).toFixed(2)}%
              </span>
            </p>

            {comparacion.avisoPlazosDistintos && (
              <div className="mt-4 bg-amber-500/20 border border-amber-500/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-amber-400 text-2xl">⚠️</span>
                  <div className="text-sm text-amber-100">
                    <p className="font-semibold mb-1">
                      Atención: Los plazos son diferentes
                    </p>
                    <p className="text-amber-200/80">
                      Con la misma TAE, un plazo más largo produce muchos más intereses
                      totales. Compara el coste financiero total abajo.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resultados detallados */}
          <div className="grid md:grid-cols-2 gap-6">
            <ResultadoFinanciacion
              resultado={calcular(condicionesA, { incluirCuadro: true })}
              label="Oferta A"
              colorAccent="blue"
              esGanadora={comparacion.ganadora === 'a'}
            />
            <ResultadoFinanciacion
              resultado={calcular(condicionesB, { incluirCuadro: true })}
              label="Oferta B"
              colorAccent="emerald"
              esGanadora={comparacion.ganadora === 'b'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
