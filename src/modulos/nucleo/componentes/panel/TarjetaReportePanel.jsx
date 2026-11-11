import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, Edit3, ShieldAlert, Trash2 } from 'lucide-react';
import { formatearFechaHora } from '../../utilidades/formatos';

function obtenerInsigniaReporte(estado) {
  if (estado === 'resuelto_sancion') {
    return { texto: 'Sancionado', claseColor: 'bg-red-50 text-red-700 border-red-200' };
  }
  if (estado === 'en_revision') {
    return {
      texto: 'En Revisión',
      claseColor: 'bg-[#B0E454]/40 text-[#0D0D0D] border-[#224F10]/15',
    };
  }
  return {
    texto: 'Solucionado',
    claseColor: 'bg-[#EAFFD0] text-[#224F10] border-[#224F10]/15',
  };
}

// Tarjeta individual de un expediente de reporte e infracción (RN06)
export function TarjetaReportePanel({
  reporte,
  tituloSubasta,
  nombreDenunciante,
  nombreDenunciado,
  estadoDenunciado,
  puedeEditar,
  esAdmin,
  alEditar,
  alEliminar,
}) {
  const insignia = obtenerInsigniaReporte(reporte.status);

  return (
    <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 space-y-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#224F10]/8 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${insignia.claseColor}`}
          >
            <AlertOctagon className="w-3 h-3" />
            {insignia.texto}
          </span>
          <span className="text-[11px] text-[#0D0D0D]/55">
            Expediente #{reporte.id} · {formatearFechaHora(reporte.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {puedeEditar && (
            <button
              type="button"
              onClick={alEditar}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              {esAdmin ? 'Resolver / Sancionar' : 'Editar'}
            </button>
          )}
          {esAdmin && (
            <button
              type="button"
              onClick={alEliminar}
              className="w-7 h-7 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-[#0D0D0D]">{reporte.reason}</h3>
        <p className="text-xs text-[#0D0D0D]/75 leading-relaxed">{reporte.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F7FBF3] p-3.5 rounded-xl border border-[#224F10]/10 text-xs">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/50 block">
            Subasta Involucrada
          </span>
          <Link
            to={`/auctions/${reporte.auctionId}`}
            className="font-semibold text-[#224F10] hover:underline"
          >
            {tituloSubasta}
          </Link>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/50 block">
            Denunciante → Denunciado
          </span>
          <strong className="text-[#0D0D0D]">
            {nombreDenunciante} →{' '}
            <span className="text-red-700">
              {nombreDenunciado}
              {estadoDenunciado ? ` (${estadoDenunciado})` : ''}
            </span>
          </strong>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/50 block">
            Medida / Sanción
          </span>
          <strong className="text-[#224F10] inline-flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{reporte.sanctionApplied}</span>
          </strong>
        </div>
      </div>
    </div>
  );
}

