/**
 * Formulario para entrada de condiciones de financiación
 */

import type { Condiciones, Frecuencia } from '../../core/types';

interface Props {
  label: string;
  condiciones: Condiciones;
  onChange: (condiciones: Condiciones) => void;
  colorAccent?: string;
}

export default function FormularioCondiciones({
  label,
  condiciones,
  onChange,
  colorAccent = 'blue',
}: Props) {
  const accentClasses = {
    blue: 'focus:ring-blue-500 focus:border-blue-500',
    emerald: 'focus:ring-emerald-500 focus:border-emerald-500',
  };

  const accentClass = accentClasses[colorAccent as keyof typeof accentClasses] || accentClasses.blue;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{label}</h3>

      {/* Importe */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Importe (€)
        </label>
        <input
          type="number"
          value={condiciones.importe}
          onChange={(e) =>
            onChange({ ...condiciones, importe: parseFloat(e.target.value) || 0 })
          }
          className={`w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white ${accentClass}`}
          placeholder="10000"
          step="0.01"
        />
      </div>

      {/* Número de cuotas */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Número de cuotas
        </label>
        <input
          type="number"
          value={condiciones.numeroCuotas}
          onChange={(e) =>
            onChange({
              ...condiciones,
              numeroCuotas: parseInt(e.target.value) || 0,
            })
          }
          className={`w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white ${accentClass}`}
          placeholder="24"
        />
      </div>

      {/* Frecuencia */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">Frecuencia</label>
        <select
          value={condiciones.frecuencia}
          onChange={(e) =>
            onChange({
              ...condiciones,
              frecuencia: e.target.value as Frecuencia,
            })
          }
          className={`w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white ${accentClass}`}
        >
          <option value="mensual">Mensual</option>
          <option value="trimestral">Trimestral</option>
          <option value="anual">Anual</option>
        </select>
      </div>

      {/* TIN */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">
          TIN anual (%)
        </label>
        <input
          type="number"
          value={(condiciones.tin * 100).toFixed(2)}
          onChange={(e) =>
            onChange({
              ...condiciones,
              tin: parseFloat(e.target.value) / 100 || 0,
            })
          }
          className={`w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white ${accentClass}`}
          placeholder="5.45"
          step="0.01"
        />
        <p className="text-xs text-slate-500 mt-1">
          Escribe 0 para "sin intereses"
        </p>
      </div>

      {/* Comisiones */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Comisiones (opcional)
        </label>

        {condiciones.comisiones.map((comision, index) => (
          <div
            key={index}
            className="bg-slate-700/50 rounded-lg p-3 mb-2 space-y-2"
          >
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={comision.descripcion}
                onChange={(e) => {
                  const nuevasComisiones = [...condiciones.comisiones];
                  nuevasComisiones[index] = {
                    ...nuevasComisiones[index]!,
                    descripcion: e.target.value,
                  };
                  onChange({ ...condiciones, comisiones: nuevasComisiones });
                }}
                className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm flex-1 mr-2"
                placeholder="Descripción"
              />
              <button
                onClick={() => {
                  const nuevasComisiones = condiciones.comisiones.filter(
                    (_, i) => i !== index
                  );
                  onChange({ ...condiciones, comisiones: nuevasComisiones });
                }}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={comision.importe || ''}
                onChange={(e) => {
                  const nuevasComisiones = [...condiciones.comisiones];
                  nuevasComisiones[index] = {
                    ...nuevasComisiones[index]!,
                    importe: parseFloat(e.target.value) || undefined,
                  };
                  onChange({ ...condiciones, comisiones: nuevasComisiones });
                }}
                className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm"
                placeholder="Importe (€)"
                step="0.01"
              />

              <select
                value={comision.momento}
                onChange={(e) => {
                  const nuevasComisiones = [...condiciones.comisiones];
                  nuevasComisiones[index] = {
                    ...nuevasComisiones[index]!,
                    momento: e.target.value as 'primeraCuota' | 'descontadaDelImporte',
                  };
                  onChange({ ...condiciones, comisiones: nuevasComisiones });
                }}
                className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm"
              >
                <option value="primeraCuota">1ª cuota</option>
                <option value="descontadaDelImporte">Descontada</option>
              </select>
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            onChange({
              ...condiciones,
              comisiones: [
                ...condiciones.comisiones,
                {
                  descripcion: 'Comisión',
                  importe: 0,
                  momento: 'primeraCuota',
                },
              ],
            });
          }}
          className="text-sm text-slate-400 hover:text-white"
        >
          + Añadir comisión
        </button>
      </div>
    </div>
  );
}
