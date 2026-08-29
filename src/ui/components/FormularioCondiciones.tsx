/**
 * Formulario para entrada de condiciones de financiación
 */

import { useState } from 'react';
import type { Condiciones, Frecuencia } from '../../core/types';

interface Props {
  label: string;
  condiciones: Condiciones;
  onChange: (condiciones: Condiciones) => void;
  colorAccent?: 'primary' | 'accent';
}

/**
 * Normaliza separadores decimales: convierte coma a punto
 */
function normalizarDecimal(valor: string): string {
  return valor.replace(',', '.');
}

/**
 * Parsea un string a número aceptando coma o punto como separador decimal
 */
function parseDecimal(valor: string): number {
  const normalizado = normalizarDecimal(valor);
  const numero = parseFloat(normalizado);
  return isNaN(numero) ? 0 : numero;
}

export default function FormularioCondiciones({
  label,
  condiciones,
  onChange,
  colorAccent = 'primary',
}: Props) {
  // Estados locales para mantener texto libre mientras el usuario escribe
  const [importeTexto, setImporteTexto] = useState<string>('');
  const [tinTexto, setTinTexto] = useState<string>('');
  const [importeEnFoco, setImporteEnFoco] = useState(false);
  const [tinEnFoco, setTinEnFoco] = useState(false);

  const borderColor = colorAccent === 'primary' ? 'border-primary' : 'border-accent';
  const bgGradient = colorAccent === 'primary'
    ? 'from-primary/5 to-transparent'
    : 'from-accent/5 to-transparent';

  return (
    <div className="space-y-5">
      <div className={`flex items-center gap-2 pb-3 border-b-2 ${borderColor}`}>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${bgGradient} ${borderColor} border-2 flex items-center justify-center`}>
          <span className={`font-bold ${colorAccent === 'primary' ? 'text-primary' : 'text-accent'}`}>
            {label === 'Oferta A' ? 'A' : label === 'Oferta B' ? 'B' : 'F'}
          </span>
        </div>
        <h3 className="font-bold text-lg text-secondary">{label}</h3>
      </div>

      {/* Importe */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Importe (€)
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={importeEnFoco ? importeTexto : condiciones.importe.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          onFocus={(e) => {
            setImporteEnFoco(true);
            setImporteTexto(condiciones.importe.toString().replace('.', ','));
            e.target.select();
          }}
          onChange={(e) => {
            setImporteTexto(e.target.value);
          }}
          onBlur={() => {
            const valor = parseDecimal(importeTexto);
            onChange({ ...condiciones, importe: valor });
            setImporteEnFoco(false);
          }}
          className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-secondary transition-all focus:border-primary"
          placeholder="10000"
        />
      </div>

      {/* Número de cuotas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
          className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-secondary transition-all focus:border-primary"
          placeholder="24"
        />
      </div>

      {/* Frecuencia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia</label>
        <select
          value={condiciones.frecuencia}
          onChange={(e) =>
            onChange({
              ...condiciones,
              frecuencia: e.target.value as Frecuencia,
            })
          }
          className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-secondary transition-all focus:border-primary"
        >
          <option value="mensual">Mensual</option>
          <option value="trimestral">Trimestral</option>
          <option value="anual">Anual</option>
        </select>
      </div>

      {/* TIN */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          TIN anual (%)
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={tinEnFoco ? tinTexto : (condiciones.tin * 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          onFocus={(e) => {
            setTinEnFoco(true);
            setTinTexto((condiciones.tin * 100).toString().replace('.', ','));
            e.target.select();
          }}
          onChange={(e) => {
            setTinTexto(e.target.value);
          }}
          onBlur={() => {
            const valor = parseDecimal(tinTexto) / 100;
            onChange({ ...condiciones, tin: valor });
            setTinEnFoco(false);
          }}
          className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-secondary transition-all focus:border-primary"
          placeholder="5,45"
        />
        <p className="text-xs text-gray-500 mt-2">
          Escribe 0 para "sin intereses"
        </p>
      </div>

      {/* Comisiones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Comisiones (opcional)
        </label>

        {condiciones.comisiones.map((comision, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200 space-y-3"
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
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 mr-2 focus:border-primary"
                placeholder="Descripción"
              />
              <button
                onClick={() => {
                  const nuevasComisiones = condiciones.comisiones.filter(
                    (_, i) => i !== index
                  );
                  onChange({ ...condiciones, comisiones: nuevasComisiones });
                }}
                className="text-negative hover:bg-negative/10 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary"
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
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary"
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
          className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
        >
          <span className="text-lg">+</span> Añadir comisión
        </button>
      </div>
    </div>
  );
}
