/**
 * @finsim/shared — capa de presentación compartida entre la web y la app móvil.
 *
 * Todo lo que NO es una plantilla: estado (signals), formularios, campo
 * decimal, pipes, textos y exportación. Sin dependencias de DOM: los tests
 * se ejecutan en Node y el typecheck se hace sin la lib DOM.
 */

// Textos y valores iniciales
export * from './lib/textos/textos';
export * from './lib/valores-iniciales';

// Formularios
export * from './lib/formularios/validadores';
export * from './lib/formularios/condiciones.form';
export * from './lib/formularios/amortizacion-parcial.form';

// Estado
export { senalesFormulario, type SenalesFormulario } from './lib/estado/senales-formulario';
export { SimuladorStore } from './lib/estado/simulador.store';
export { ComparadorStore } from './lib/estado/comparador.store';
export { ContadoStore } from './lib/estado/contado.store';
export { AmortizacionParcialStore } from './lib/estado/amortizacion-parcial.store';

// Campo decimal
export * from './lib/campo-decimal/campo-decimal';

// Pipes
export { MonedaPipe, PorcentajePipe } from './lib/pipes/pipes';

// Exportación
export * from './lib/exportacion/generadores';
export * from './lib/exportacion/exportacion.service';
