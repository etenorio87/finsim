/**
 * Simulador de Amortización Parcial
 *
 * Permite simular el efecto de una amortización parcial anticipada
 * con dos estrategias: reducir cuota o reducir plazo.
 */

import { useState } from 'react';
import type { Condiciones, Resultado, EstrategiaAmortizacion } from '../../core/types';
import { simularAmortizacionParcial } from '../../core/amortizacionParcial';
import ResultadoFinanciacion from './ResultadoFinanciacion';

interface Props {
  condiciones: Condiciones;
  resultadoOriginal: Resultado;
  onCerrar: () => void;
}

export default function AmortizacionParcial({ condiciones, resultadoOriginal, onCerrar }: Props) {
  const [capitalAmortizado, setCapitalAmortizado] = useState<string>('1000');
  const [cuotaAmortizacion, setCuotaAmortizacion] = useState<string>('6');
  const [estrategia, setEstrategia] = useState<EstrategiaAmortizacion>('reducirPlazo');
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [error, setError] = useState<string>('');

  // Validar inputs y simular
  const handleSimular = () => {
    setError('');

    const capitalNum = parseFloat(capitalAmortizado);
    const cuotaNum = parseInt(cuotaAmortizacion);

    // Validaciones
    if (isNaN(capitalNum) || capitalNum <= 0) {
      setError('El capital a amortizar debe ser mayor que 0');
      return;
    }

    if (isNaN(cuotaNum) || cuotaNum < 1 || cuotaNum > condiciones.numeroCuotas) {
      setError(`La cuota debe estar entre 1 y ${condiciones.numeroCuotas}`);
      return;
    }

    // Obtener capital pendiente en esa cuota
    const filaAmortizacion = resultadoOriginal.cuadro?.[cuotaNum - 1];
    if (!filaAmortizacion) {
      setError('Error: no se pudo obtener el cuadro de amortización');
      return;
    }

    if (capitalNum > filaAmortizacion.capitalPendiente) {
      setError(
        `El capital a amortizar no puede ser mayor que el capital pendiente en esa cuota (${filaAmortizacion.capitalPendiente.toFixed(2)}€)`
      );
      return;
    }

    setMostrarResultado(true);
  };

  // Calcular resultado si se está mostrando
  const resultado = mostrarResultado
    ? simularAmortizacionParcial({
        condicionesOriginales: condiciones,
        capitalAmortizado: parseFloat(capitalAmortizado),
        cuotaAmortizacion: parseInt(cuotaAmortizacion),
        estrategia,
      })
    : null;

  return (
    <div className="space-y-6 animate-fade-in mt-6">
      {/* Header pedagógico */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200 shadow-soft">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="font-bold text-xl mb-3 text-secondary">💰 Simulador de Amortización Parcial</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              La amortización parcial reduce tu deuda antes de tiempo. Puedes elegir:
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/60 p-3 rounded-lg">
                <div className="font-bold text-green-700 mb-1">✓ Reducir cuota</div>
                <div className="text-gray-600">Pagas menos cada mes (liberas liquidez mensual)</div>
              </div>
              <div className="bg-white/60 p-3 rounded-lg">
                <div className="font-bold text-blue-700 mb-1">✓ Reducir plazo</div>
                <div className="text-gray-600">Terminas antes (minimizas intereses totales)</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              💡 En general, <strong>reducir plazo</strong> ahorra más dinero, pero{' '}
              <strong>reducir cuota</strong> da más flexibilidad mensual.
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="ml-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            title="Cerrar"
          >
            ×
          </button>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-card rounded-2xl p-6 border-2 border-primary shadow-card">
        <h3 className="font-bold text-lg mb-4 text-secondary">Parámetros de la amortización</h3>

        <div className="space-y-4">
          {/* Capital a amortizar */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cantidad a amortizar (€)
            </label>
            <input
              type="number"
              value={capitalAmortizado}
              onChange={(e) => setCapitalAmortizado(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              placeholder="1000"
              step="100"
              min="0"
            />
          </div>

          {/* Cuota de amortización */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ¿En qué cuota harás la amortización? (1 a {condiciones.numeroCuotas})
            </label>
            <input
              type="number"
              value={cuotaAmortizacion}
              onChange={(e) => setCuotaAmortizacion(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              placeholder="6"
              min="1"
              max={condiciones.numeroCuotas}
            />
          </div>

          {/* Estrategia */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Estrategia de amortización
            </label>
            <div className="space-y-3">
              {/* Reducir cuota */}
              <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                <input
                  type="radio"
                  name="estrategia"
                  value="reducirCuota"
                  checked={estrategia === 'reducirCuota'}
                  onChange={(e) => setEstrategia(e.target.value as EstrategiaAmortizacion)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Reducir cuota</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Mantén el mismo número de cuotas, pero paga menos cada mes
                  </div>
                </div>
              </label>

              {/* Reducir plazo */}
              <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="estrategia"
                  value="reducirPlazo"
                  checked={estrategia === 'reducirPlazo'}
                  onChange={(e) => setEstrategia(e.target.value as EstrategiaAmortizacion)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Reducir plazo</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Mantén una cuota similar, pero termina de pagar antes
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Botón simular */}
          <button
            onClick={handleSimular}
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-hover transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="text-lg">Simular amortización parcial</span>
          </button>
        </div>
      </div>

      {/* Resultados */}
      {resultado && (
        <div className="space-y-6 animate-slide-up">
          {/* Cuadro de ahorros */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border-2 border-green-200 shadow-card">
            <h3 className="text-2xl font-black text-secondary mb-6">
              💰 Tu ahorro con la amortización parcial
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Ahorro en intereses</div>
                <div className="text-3xl font-bold text-green-600">
                  {resultado.ahorro.intereses.toFixed(2)}€
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Ahorro en coste total</div>
                <div className="text-3xl font-bold text-green-600">
                  {resultado.ahorro.costeTotal.toFixed(2)}€
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Reducción de TAE</div>
                <div className="text-3xl font-bold text-blue-600">
                  {(resultado.ahorro.diferenciaAhorroTAE * 100).toFixed(2)}%
                </div>
              </div>

              {resultado.ahorro.cuotasEliminadas !== undefined && (
                <div className="bg-white/80 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Cuotas eliminadas</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {resultado.ahorro.cuotasEliminadas}
                  </div>
                </div>
              )}

              {resultado.ahorro.reduccionCuota !== undefined && (
                <div className="bg-white/80 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Reducción de cuota</div>
                  <div className="text-3xl font-bold text-green-600">
                    {resultado.ahorro.reduccionCuota.toFixed(2)}€
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600 mt-4 text-center">
              Has ahorrado <strong className="text-green-700">{resultado.ahorro.intereses.toFixed(2)}€</strong> en intereses
              amortizando anticipadamente
            </p>
          </div>

          {/* Comparación lado a lado */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ResultadoFinanciacion
              resultado={resultado.escenarioOriginal}
              condiciones={condiciones}
              label="Situación actual"
              colorAccent="primary"
            />
            <ResultadoFinanciacion
              resultado={resultado.escenarioNuevo}
              condiciones={resultado.condicionesNuevas}
              label="Después de amortizar"
              colorAccent="positive"
              esGanadora={true}
              textoBadge="Nuevo escenario"
            />
          </div>
        </div>
      )}
    </div>
  );
}
