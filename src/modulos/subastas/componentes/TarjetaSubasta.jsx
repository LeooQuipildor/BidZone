import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, Clock, Edit3, Trash2 } from 'lucide-react';
import {
  IMAGEN_SUBASTA_POR_DEFECTO,
  calcularTiempoRestante,
  formatearMoneda,
} from '../../nucleo/utilidades/formatos';
import { Button } from '../../nucleo/diseno/ui';

// Tarjeta única de subasta reutilizada en Inicio, Explorar y Panel de Control
export function TarjetaSubasta({
  subasta,
  vendedor = null,
  cantidadOfertas,
  ahoraMs,
  esPropietario = false,
  esAdmin = false,
  alEditar = null,
  alSolicitarRevision = null,
  alEliminar = null,
  claseExtra = '',
}) {
  const navegar = useNavigate();
  const tiempoRestante = calcularTiempoRestante(subasta.endTime, ahoraMs);
  const estaEnVivo = subasta.status === 'activa' && !tiempoRestante.vencida;

  const totalOfertas =
    cantidadOfertas !== undefined ? Number(cantidadOfertas) : Number(subasta.bidCount ?? 0);
  const palabraOfertas = totalOfertas === 1 ? 'oferta' : 'ofertas';
  const nombreVendedor = esPropietario ? 'Tú' : vendedor?.name || subasta.sellerName;

  function abrirDetalle() {
    navegar(`/subastas/${subasta.id}`);
  }

  return (
    <div
      onClick={abrirDetalle}
      className={`group relative rounded-[26px] bg-white border border-neutral-200/90 p-2 sm:p-1 pb-3.5 sm:pb-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer ${claseExtra}`}
    >
      <div>
        <div className="relative w-full aspect-[4/3] rounded-[20px] overflow-hidden bg-neutral-100">
          <img
            src={subasta.imageUrl || IMAGEN_SUBASTA_POR_DEFECTO}
            alt={subasta.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-[11px] font-medium tracking-wide shadow-xs border border-white/20">
              {subasta.category}
            </span>

            <div className="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide shadow-xs border border-white/20 flex items-center gap-1.5 shrink-0">
              <Clock className="w-3 h-3 text-[#B0E454]" />
              <span className="tabular-nums">
                {estaEnVivo ? tiempoRestante.textoFormateado : 'Finalizada'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 px-1.5 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-[#0D0D0D] tracking-tight truncate group-hover:text-[#224F10] transition-colors">
              {subasta.title}
            </h3>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 border ${
                estaEnVivo
                  ? 'bg-[#EAFFD0] text-[#224F10] border-[#224F10]/20'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {estaEnVivo ? 'En subasta' : 'Finalizada'}
            </span>
          </div>

          <p className="text-xs text-neutral-400 font-normal truncate">
            {totalOfertas} {palabraOfertas}
            {vendedor && nombreVendedor ? ` · Vende: ${nombreVendedor}` : ''}
          </p>
        </div>
      </div>

      <div className="mt-3.5 px-1 pt-1 flex items-center justify-between gap-2">
        <div className="px-3.5 py-1.5 sm:py-2 rounded-full bg-neutral-100 text-[#0D0D0D] font-bold text-sm sm:text-base tracking-tight shrink-0">
          {formatearMoneda(subasta.currentPrice)}
        </div>

        <button
          type="button"
          onClick={(evento) => {
            evento.stopPropagation();
            abrirDetalle();
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs group-hover:shadow-md"
        >
          <span>{estaEnVivo ? 'Pujar ahora' : 'Ver detalle'}</span>
          <span className="w-6 h-6 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </span>
        </button>
      </div>

      {(esPropietario || esAdmin) && (
        <div
          onClick={(evento) => evento.stopPropagation()}
          className="flex items-center justify-end gap-2 pt-2.5 mt-2.5 mx-1 border-t border-neutral-100"
        >
          {esPropietario &&
            (alEditar ? (
              <Button variant="outline" size="sm" withArrow={false} onClick={() => alEditar(subasta)}>
                <Edit3 className="w-3 h-3" />
                Editar
              </Button>
            ) : (
              <Link to={`/subastas/${subasta.id}/editar`}>
                <Button variant="outline" size="sm" withArrow={false}>
                  <Edit3 className="w-3 h-3" />
                  Editar
                </Button>
              </Link>
            ))}

          {!esPropietario && esAdmin && alSolicitarRevision && (
            <button
              type="button"
              onClick={() => alSolicitarRevision(subasta)}
              className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3" />
              Solicitar revisión
            </button>
          )}

          {alEliminar && (
            <Button
              variant="danger"
              size="sm"
              withArrow={false}
              title={esPropietario ? 'Eliminar subasta' : 'Cancelar y eliminar subasta'}
              onClick={() => alEliminar(subasta)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
