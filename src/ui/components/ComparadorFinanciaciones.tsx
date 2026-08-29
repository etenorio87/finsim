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
    <div className="space-y-6 animate-fade-in">
      {/* Descripción */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20 shadow-soft">
        <h2 className="font-bold text-xl mb-3 text-secondary">¿Cuál de estas dos ofertas es mejor?</h2>
        <p className="text-gray-700 leading-relaxed">
          Introduce las condiciones de cada oferta y compara. El criterio de decisión
          es la <strong className="text-primary">TAE</strong> (el precio real del dinero),
          no la cuota mensual.
        </p>
      </div>

      {/* Formularios */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Oferta A */}
        <div className="bg-card rounded-2xl p-6 border-2 border-primary shadow-card hover:shadow-hover transition-shadow">
          <FormularioCondiciones
            label="Oferta A"
            condiciones={condicionesA}
            onChange={setCondicionesA}
            colorAccent="primary"
          />
        </div>

        {/* Oferta B */}
        <div className="bg-card rounded-2xl p-6 border-2 border-primary shadow-card hover:shadow-hover transition-shadow">
          <FormularioCondiciones
            label="Oferta B"
            condiciones={condicionesB}
            onChange={setCondicionesB}
            colorAccent="accent"
          />
        </div>
      </div>

      {/* Botón comparar */}
      <button
        onClick={handleComparar}
        className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-5 px-6 rounded-2xl shadow-lg hover:shadow-hover transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="text-lg">Comparar ofertas</span>
      </button>

      {/* Resultados */}
      {comparacion && (
        <div className="space-y-6 animate-slide-up">
          {/* Resumen de la comparación */}
          <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 border-2 border-primary/30 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-black text-secondary">
                {comparacion.avisoPlazosDistintos ? '💰 Dinero más barato' : '🏆 Mejor oferta'}: {comparacion.ganadora === 'a' ? 'A' : 'B'}
              </h3>
              <div className="text-right">
                <div className="text-sm text-gray-600">Diferencia de TAE</div>
                <div className="text-2xl font-bold text-primary">
                  {(comparacion.diferenciaTae * 100).toFixed(2)}%
                </div>
              </div>
            </div>

            {comparacion.avisoPlazosDistintos && (
              <div className="mt-6 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">⚠️</span>
                  <div className="text-sm text-yellow-900">
                    <p className="font-bold text-base mb-2">
                      Atención: Los plazos son diferentes
                    </p>
                    <p className="text-yellow-800 leading-relaxed">
                      Son decisiones distintas: la oferta {comparacion.ganadora === 'a' ? 'A' : 'B'} es dinero más barato,
                      pero estarás endeudado durante más tiempo. Depende de qué hagas con la liquidez que liberas.
                      Compara el coste financiero total en las tarjetas de abajo.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resultados detallados */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ResultadoFinanciacion
              resultado={calcular(condicionesA, { incluirCuadro: true })}
              label="Oferta A"
              colorAccent="primary"
              esGanadora={comparacion.ganadora === 'a'}
              textoBadge={comparacion.avisoPlazosDistintos ? 'Dinero más barato' : 'Mejor oferta'}
            />
            <ResultadoFinanciacion
              resultado={calcular(condicionesB, { incluirCuadro: true })}
              label="Oferta B"
              colorAccent="accent"
              esGanadora={comparacion.ganadora === 'b'}
              textoBadge={comparacion.avisoPlazosDistintos ? 'Dinero más barato' : 'Mejor oferta'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
