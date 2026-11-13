/**
 * ==============================================================================
 * ARCHIVO: src/modulos/pujas/componentes/BloquesPuja.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Contiene componentes de presentación modulares y reutilizables relacionados con las ofertas:
 * 1. `CasillaCompromisoPuja`: Casilla de verificación para aceptar los términos vinculantes (RN04 / RN06).
 * 2. `ResumenOfertaSubasta`: Recuadro informativo con el precio actual, incremento mínimo y sugerido.
 *
 * ¿QUÉ HACEN ESTOS COMPONENTES?
 * - `CasillaCompromisoPuja`: Obliga al usuario a consentir expresamente que su oferta es irrevocable.
 *   Si el postor gana la subasta y luego se niega a pagar, incurre en falta grave según la Regla RN06.
 * - `ResumenOfertaSubasta`: Muestra un desglose claro de los números de la subasta antes de ofertar.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Checkbox controlado en React:
 *   `<input type="checkbox" checked={aceptado} onChange={(evento) => alCambiar(evento.target.checked)} />`
 *   En React, los checkboxes leen su estado booleano de la propiedad `checked` (no de `value`) y notifican
 *   el nuevo booleano mediante `evento.target.checked`.
 * - Renderizado Condicional de Textos con Fragments (`<> ... </>`):
 *   Permite alternar entre una versión breve del compromiso o una extendida según `textoDetallado`.
 */

import React from 'react';
import { formatearMoneda } from '../../nucleo/utilidades/formatos';

/**
 * Componente `CasillaCompromisoPuja`:
 *
 * @param {Object} props
 * @param {boolean} props.aceptado - Estado booleano de si la casilla está tildada.
 * @param {Function} props.alCambiar - Callback que recibe el nuevo booleano.
 * @param {boolean} [props.textoDetallado=false] - Si es true, muestra la versión legal ampliada.
 */
export function CasillaCompromisoPuja({ aceptado, alCambiar, textoDetallado = false }) {
  return (
    <label className="flex items-start gap-2.5 text-xs text-[#0D0D0D]/85 cursor-pointer bg-[#B0E454]/25 p-3.5 rounded-2xl border border-[#224F10]/20">
      <input
        type="checkbox"
        checked={aceptado}
        onChange={(evento) => alCambiar(evento.target.checked)}
        className="mt-0.5 accent-[#224F10]"
      />
      <span>
        {textoDetallado ? (
          <>
            <strong>Compromiso vinculante (RN04 / RN06):</strong> Si resulto ganador, me comprometo a coordinar el pago con el dueño. El incumplimiento conlleva sanción.
          </>
        ) : (
          'Acepto el compromiso vinculante e irrevocable de compra (RN04) para concretar el pago si resulto ganador.'
        )}
      </span>
    </label>
  );
}

/**
 * Componente `ResumenOfertaSubasta`:
 *
 * @param {Object} props
 * @param {Object} props.subasta - Objeto de subasta para leer precios actuales.
 * @param {number|string} props.montoSugerido - Valor mínimo recomendado para la próxima puja.
 */
export function ResumenOfertaSubasta({ subasta, montoSugerido }) {
  if (!subasta) return null;

  return (
    <div className="p-3.5 rounded-2xl bg-[#F7FBF3] border border-[#224F10]/15 text-xs flex flex-wrap gap-x-6 gap-y-1">
      <span>
        Precio actual: <strong className="text-[#224F10]">{formatearMoneda(subasta.currentPrice)}</strong>
      </span>
      <span>
        Incremento RN01: <strong>+{formatearMoneda(subasta.minIncrement)}</strong>
      </span>
      <span>
        Mínimo sugerido: <strong className="text-[#224F10]">{formatearMoneda(montoSugerido)}</strong>
      </span>
    </div>
  );
}

