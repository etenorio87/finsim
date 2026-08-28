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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Simulador de Financiación
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Decisiones inteligentes, no solo cuotas bajas
          </p>
        </div>
      </header>

      {/* Selector de vista */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-slate-800 rounded-lg p-1 grid grid-cols-2 gap-1">
          <button
            onClick={() => setVista('financiaciones')}
            className={`py-3 px-4 rounded-md font-medium transition-all ${
              vista === 'financiaciones'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Comparar ofertas
          </button>
          <button
            onClick={() => setVista('contado')}
            className={`py-3 px-4 rounded-md font-medium transition-all ${
              vista === 'contado'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ¿Financiar o contado?
          </button>
        </div>
      </div>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-4 pb-8">
        {vista === 'financiaciones' ? (
          <ComparadorFinanciaciones />
        ) : (
          <ComparadorContado />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
        <p>
          El precio del dinero es la TAE, no la cuota mensual.
        </p>
      </footer>
    </div>
  );
}

export default App;
