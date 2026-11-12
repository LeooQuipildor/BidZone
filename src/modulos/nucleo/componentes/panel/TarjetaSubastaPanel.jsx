import React from 'react';
import { AlertTriangle, ArrowUpRight, Clock, Edit3, Trash2 } from 'lucide-react';
import {
  IMAGEN_SUBASTA_POR_DEFECTO,
  formatearMoneda,
} from '../../utilidades/formatos';
import { formatearCuentaRegresiva } from './ayudasPanel';

function obtenerEstadoTarjeta(subasta, estaEnVivo, cuentaRegresiva) {
  if (subasta.status === 'cancelada') {
    return {
      textoReloj: 'Cancelada',
      textoInsignia: 'Cancelada',
      claseInsignia: 'bg-red-50 text-red-700 border-red-200',
    };
  }
  if (estaEnVivo) {
    return {
      textoReloj: cuentaRegresiva,
      textoInsignia: 'En subasta',
      claseInsignia: 'bg-[#EAFFD0] text-[#224F10] border-[#224F10]/20',
    };
  }
  return {
    textoReloj: 'Finalizada',
    textoInsignia: 'Finalizada',
    claseInsignia: 'bg-red-50 text-red-700 border-red-200',
  };
}

// Tarjeta individual de subasta: el propietario edita/elimina; el admin modera las ajenas pidiendo corrección o eliminando
export function TarjetaSubastaPanel({
  subasta,
  vendedor,
  cantidadPujas,
  ahoraMs,
  esPropia,
  esAdmin,
  alEditar,
  alSolicitarCorreccion,
  alEliminar,
  alAbrirDetalle,
}) {
  const cuentaRegresiva = formatearCuentaRegresiva(subasta.endTime, ahoraMs);
  const estaEnVivo = subasta.status === 'activa' && cuentaRegresiva !== '00:00:00';
  const infoEstado = obtenerEstadoTarjeta(subasta, estaEnVivo, cuentaRegresiva);
  const puedeEliminar = esPropia || esAdmin;

  return (
    <div className="group rounded-2xl bg-white border border-[#224F10]/10 p-3 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
      <div>
        <div
          onClick={() => alAbrirDetalle(subasta.id)}
          className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#F1F8E9] cursor-pointer"
        >
          <img
            src={subasta.imageUrl || IMAGEN_SUBASTA_POR_DEFECTO}
            alt={subasta.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-2 pointer-events-none">
            <span className="px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white text-[10px] font-medium border border-white/20">
              {subasta.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20 inline-flex items-center gap-1 tabular-nums">
              <Clock className="w-3 h-3 text-[#B0E454]" />
              {infoEstado.textoReloj}
            </span>
          </div>
        </div>

        <div className="mt-3 px-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => alAbrirDetalle(subasta.id)}
              className="text-sm font-bold text-[#0D0D0D] line-clamp-1 hover:text-[#224F10] cursor-pointer"
            >
              {subasta.title}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 border ${infoEstado.claseInsignia}`}
            >
              {infoEstado.textoInsignia}
            </span>
          </div>

          <p className="text-[11px] text-[#0D0D0D]/55 truncate">
            {cantidadPujas} {cantidadPujas === 1 ? 'oferta' : 'ofertas'} · Vende:{' '}
            {esPropia ? 'Tú' : vendedor?.name || subasta.sellerName || 'Socio'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#224F10]/8 flex items-center justify-between gap-2 px-1">
        <div>
          <span className="text-[10px] text-[#0D0D0D]/50 block leading-none">
            Oferta actual
          </span>
          <span className="text-base font-bold text-[#224F10] tabular-nums">
            {formatearMoneda(subasta.currentPrice)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {esPropia && (
            <button
              type="button"
              onClick={() => alEditar(subasta)}
              title="Editar mi subasta"
              className="w-8 h-8 rounded-full border border-[#224F10]/15 hover:bg-[#EAFFD0] text-[#0D0D0D]/75 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {!esPropia && esAdmin && (
            <button
              type="button"
              onClick={() => alSolicitarCorreccion(subasta)}
              title="Solicitar corrección al vendedor"
              className="w-8 h-8 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
          )}

          {puedeEliminar && (
            <button
              type="button"
              onClick={() => alEliminar(subasta)}
              title="Eliminar subasta"
              className="w-8 h-8 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => alAbrirDetalle(subasta.id)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] pl-3.5 pr-1.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <span>{estaEnVivo ? 'Pujar' : 'Detalle'}</span>
            <span className="w-5 h-5 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center">
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

