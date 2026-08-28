/**
 * App principal - Simulador de financiación
 *
 * Mobile-first: diseñado para usar en una tienda con el móvil en la mano.
 */

import { useState } from 'react';
import ComparadorFinanciaciones from './components/ComparadorFinanciaciones';
import ComparadorContado from './components/ComparadorContado';

type Vista = 'financiaciones' | 'contado';

function App() {
  const [vista, setVista] = useState<Vista>('financiaciones');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white text-xl font-bold">%</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary">
                Simulador de Financiación
              </h1>
              <p className="text-sm text-gray-600">
                Decisiones inteligentes, no solo cuotas bajas
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Selector de vista */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-1.5 shadow-soft inline-flex gap-1">
          <button
            onClick={() => setVista('financiaciones')}
            className={`py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
              vista === 'financiaciones'
                ? 'bg-secondary text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-secondary hover:bg-gray-50'
            }`}
          >
            Comparar ofertas
          </button>
          <button
            onClick={() => setVista('contado')}
            className={`py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
              vista === 'contado'
                ? 'bg-secondary text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-secondary hover:bg-gray-50'
            }`}
          >
            ¿Financiar o contado?
          </button>
        </div>
      </div>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        {vista === 'financiaciones' ? (
          <ComparadorFinanciaciones />
        ) : (
          <ComparadorContado />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-8 mt-12 border-t border-gray-200">
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            💡 El precio del dinero es la <strong className="text-primary">TAE</strong>, no la cuota mensual
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Herramienta de decisión financiera · Datos no persistidos
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
