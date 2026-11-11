import React from 'react';
import { Badge } from '../../nucleo/diseno/ui';
import {
  IMAGEN_SUBASTA_POR_DEFECTO,
  formatearMoneda,
} from '../../nucleo/utilidades/formatos';

function obtenerEtiquetaEstado(estado) {
  if (estado === 'activa') return { variant: 'success', texto: 'Subasta en Vivo' };
  if (estado === 'cancelada') return { variant: 'default', texto: 'Cancelada' };
  return { variant: 'default', texto: 'Subasta Finalizada' };
}

// Ficha principal de una subasta: fotografía, descripción, precio base e incremento RN01
export function FichaProductoSubasta({ subasta, vendedor }) {
  const etiquetaEstado = obtenerEtiquetaEstado(subasta.status);

  return (
    <div className="rounded-3xl bg-[#F5FFEB] border border-[#224F10]/15 overflow-hidden shadow-xs">
      <div className="relative h-80 sm:h-96 bg-white">
        <img
          src={subasta.imageUrl || IMAGEN_SUBASTA_POR_DEFECTO}
          alt={subasta.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="lime">{subasta.category}</Badge>
          <Badge variant={etiquetaEstado.variant}>{etiquetaEstado.texto}</Badge>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-4">
        <h1 className="font-serif-display text-3xl sm:text-5xl text-[#0D0D0D] leading-tight">
          {subasta.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#0D0D0D]/75 leading-relaxed">
          {subasta.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#224F10]/15 text-xs">
          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#224F10]/15">
            <span className="text-[11px] text-[#0D0D0D]/55 block">Precio Base</span>
            <strong className="font-serif-display text-2xl text-[#0D0D0D]">
              {formatearMoneda(subasta.basePrice)}
            </strong>
          </div>
          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#224F10]/15">
            <span className="text-[11px] text-[#0D0D0D]/55 block">Incremento Mín. (RN01)</span>
            <strong className="font-serif-display text-2xl text-[#224F10]">
              + {formatearMoneda(subasta.minIncrement)}
            </strong>
          </div>
          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#224F10]/15">
            <span className="text-[11px] text-[#0D0D0D]/55 block">Dueño / Vendedor</span>
            <strong className="text-sm font-semibold text-[#0D0D0D] block mt-1">
              {vendedor?.name || 'Usuario'} ({vendedor?.reputation || '5.0'} ★)
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

