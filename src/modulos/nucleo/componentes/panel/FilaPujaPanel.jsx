import React from 'react';
import { Link } from 'react-router-dom';
import { Edit3, ExternalLink, Gavel, Trash2 } from 'lucide-react';
import { formatearFechaHora, formatearMoneda } from '../../utilidades/formatos';
import { obtenerIniciales } from './ayudasPanel';

// Fila individual de una puja en el listado del Panel
export function FilaPujaPanel({
  puja,
  tituloSubasta,
  nombrePostor,
  esOfertaLider,
  puedeEditar,
  esAdmin,
  alEditar,
  alEliminar,
}) {
  return (
    <div className="p-4 sm:p-5 hover:bg-[#F7FBF3]/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <span
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
            esOfertaLider ? 'bg-[#224F10] text-[#B0E454]' : 'bg-[#EAFFD0] text-[#224F10]'
          }`}
        >
          {obtenerIniciales(nombrePostor, 'PU')}
        </span>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                esOfertaLider ? 'bg-[#B0E454] text-[#0D0D0D]' : 'bg-[#F1F8E9] text-[#224F10]'
              }`}
            >
              {esOfertaLider ? 'Oferta Líder' : `Puja #${puja.id}`}
            </span>
            <Link
              to={`/auctions/${puja.auctionId}`}
              className="text-sm font-bold text-[#0D0D0D] hover:text-[#224F10] inline-flex items-center gap-1 truncate"
            >
              <Gavel className="w-3.5 h-3.5 text-[#224F10] shrink-0" />
              <span className="truncate">{tituloSubasta}</span>
              <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
            </Link>
          </div>
          <p className="text-xs text-[#0D0D0D]/70">
            Postor: <strong className="text-[#0D0D0D]">{nombrePostor}</strong> · &ldquo;
            {puja.note || 'Sin nota adicional'}&rdquo;
          </p>
          <p className="text-[11px] text-[#0D0D0D]/50">
            {formatearFechaHora(puja.createdAt)} · Compromiso RN04 aceptado
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#224F10]/10 shrink-0">
        <div className="text-left sm:text-right">
          <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/45 block">
            Ofertado
          </span>
          <span className="text-xl font-bold text-[#224F10] tabular-nums">
            {formatearMoneda(puja.amount)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {puedeEditar && (
            <button
              type="button"
              onClick={alEditar}
              title="Editar puja"
              className="w-8 h-8 rounded-full border border-[#224F10]/15 hover:bg-[#EAFFD0] text-[#0D0D0D]/75 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {esAdmin && (
            <button
              type="button"
              onClick={alEliminar}
              title="Eliminar puja"
              className="w-8 h-8 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

