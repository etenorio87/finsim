/**
 * Simulador de una única financiación
 *
 * Permite evaluar una oferta de financiación mostrando:
 * - TAE, cuota mensual, coste total
 * - Tabla de amortización completa
 */

import { useState } from 'react';
import type { Condiciones } from '../../core/types';
import { calcular } from '../../core/motor';
import FormularioCondiciones from './FormularioCondiciones';
import ResultadoFinanciacion from './ResultadoFinanciacion';

const condicionesInicial: Condiciones = {
  importe: 10000,
  numeroCuotas: 24,
  frecuencia: 'mensual',
  tin: 0.06,
  comisiones: [],
};

export default function SimuladorUnico() {
  const [condiciones, setCondiciones] = useState<Condiciones>(condicionesInicial);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const handleSimular = () => {
    setMostrarResultados(true);
  };

  const resultado = mostrarResultados
    ? calcular(condiciones, { incluirCuadro: true })
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Descripción */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20 shadow-soft">
        <h2 className="font-bold text-xl mb-3 text-secondary">Simula tu financiación</h2>
        <p className="text-gray-700 leading-relaxed">
          Introduce las condiciones de tu financiación y descubre el coste real.
          Recuerda: el precio del dinero es la <strong className="text-primary">TAE</strong>, no la cuota mensual.
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-card rounded-2xl p-6 border-2 border-primary shadow-card hover:shadow-hover transition-shadow">
        <FormularioCondiciones
          label="Condiciones de la financiación"
          condiciones={condiciones}
          onChange={setCondiciones}
          colorAccent="primary"
        />
      </div>

      {/* Botón simular */}
      <button
        onClick={handleSimular}
        className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-5 px-6 rounded-2xl shadow-lg hover:shadow-hover transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="text-lg">Simular financiación</span>
      </button>

      {/* Resultados */}
      {resultado && (
        <div className="animate-slide-up">
          <ResultadoFinanciacion
            resultado={resultado}
            colorAccent="primary"
          />
        </div>
      )}
    </div>
  );
}
