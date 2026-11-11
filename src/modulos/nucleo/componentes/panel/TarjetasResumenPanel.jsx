import React from 'react';
import { Clock, Gavel, Tag } from 'lucide-react';
import { formatearMoneda } from '../../utilidades/formatos';

const COLORES_INSIGNIAS_RECIENTES = [
  'bg-[#224F10] text-[#EAFFD0]',
  'bg-[#B0E454] text-[#0D0D0D]',
  'bg-[#EAFFD0] text-[#224F10]',
  'bg-[#0D0D0D] text-[#EAFFD0]',
  'bg-[#B0E454]/40 text-[#224F10]',
];

// Tarjeta con la subasta activa que cierra más pronto
export function TarjetaProximoCierre({ subasta, cuentaRegresiva, alAccionar }) {
  return (
    <div className="lg:col-span-6 rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-[#0D0D0D]">Próximo Cierre</h2>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#224F10] bg-[#EAFFD0] px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#224F10] animate-pulse" />
          En vivo
        </span>
      </div>

      {subasta ? (
        <div className="my-4 space-y-2">
          <p className="text-lg font-bold text-[#224F10] leading-snug line-clamp-2">
            {subasta.title}
          </p>
          <p className="text-xs text-[#0D0D0D]/60 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#224F10]" />
            <span>Cierre en {cuentaRegresiva}</span>
          </p>
          <p className="text-xs font-semibold text-[#0D0D0D]">
            Oferta líder:{' '}
            <span className="text-[#224F10]">{formatearMoneda(subasta.currentPrice)}</span>
          </p>
        </div>
      ) : (
        <div className="my-4">
          <p className="text-sm font-semibold text-[#0D0D0D]/70">
            No hay subastas activas pendientes
          </p>
          <p className="text-xs text-[#0D0D0D]/50 mt-1">
            Publica un nuevo lote para iniciar una sala en tiempo real.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={alAccionar}
        className="w-full py-2.5 px-4 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Gavel className="w-3.5 h-3.5" />
        <span>{subasta ? 'Entrar a Pujar' : 'Publicar Nuevo Lote'}</span>
      </button>
    </div>
  );
}

// Tarjeta con el listado corto de las subastas más recientes
export function TarjetaSubastasRecientes({ subastas, alCrearNueva, alAbrirSubasta }) {
  return (
    <div className="lg:col-span-6 rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
      <div className="flex items-center justify-between gap-2 pb-3">
        <h2 className="text-sm font-bold text-[#0D0D0D]">Subastas Recientes</h2>
        <button
          type="button"
          onClick={alCrearNueva}
          className="px-2.5 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[11px] font-semibold text-[#0D0D0D] transition-colors cursor-pointer"
        >
          + Nueva
        </button>
      </div>

      <div className="space-y-2.5 flex-1">
        {subastas.length === 0 ? (
          <p className="text-xs text-[#0D0D0D]/50 py-6 text-center">Sin coincidencias.</p>
        ) : (
          subastas.map((subasta, indice) => {
            const colorInsignia =
              COLORES_INSIGNIAS_RECIENTES[indice % COLORES_INSIGNIAS_RECIENTES.length];
            const estadoTexto = subasta.status === 'activa' ? 'En subasta' : 'Finalizada';
            return (
              <button
                key={subasta.id}
                type="button"
                onClick={() => alAbrirSubasta(subasta.id)}
                className="w-full flex items-center gap-2.5 text-left hover:bg-[#F7FBF3] p-1.5 -mx-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${colorInsignia}`}
                >
                  <Tag className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#0D0D0D] truncate">{subasta.title}</p>
                  <p className="text-[10px] text-[#0D0D0D]/50 truncate">
                    {formatearMoneda(subasta.currentPrice)} · {estadoTexto}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

