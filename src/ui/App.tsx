/**
 * App principal - Simulador de financiación
 *
 * FASE 1: Motor de cálculo (tests primero)
 * FASE 2: Interfaz de usuario (cuando los tests pasen)
 */

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Simulador de Financiación</h1>
        <p className="text-gray-400 mb-8">
          Herramienta de decisión para comparar ofertas de financiación
        </p>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Estado: Fase 1</h2>
          <p className="text-gray-300">
            Motor de cálculo en desarrollo. La interfaz se activará cuando
            todos los tests pasen.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
