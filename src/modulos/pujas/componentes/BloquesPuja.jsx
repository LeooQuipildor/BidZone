import React from 'react';
import { formatearMoneda } from '../../nucleo/utilidades/formatos';

// Casilla obligatoria de aceptación de oferta vinculante (RN04) compartida en sala y formulario
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

// Tarjeta compacta que resume precio actual, incremento mínimo RN01 y monto sugerido
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

