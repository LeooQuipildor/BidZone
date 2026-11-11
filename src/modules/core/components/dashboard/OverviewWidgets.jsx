import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Clock, Gavel, Tag } from 'lucide-react';

const RECENT_BADGE_COLORS = [
  'bg-[#224F10] text-[#EAFFD0]',
  'bg-[#B0E454] text-[#0D0D0D]',
  'bg-[#EAFFD0] text-[#224F10]',
  'bg-[#0D0D0D] text-[#EAFFD0]',
  'bg-[#B0E454]/40 text-[#224F10]',
];

// Tarjeta con la subasta activa más próxima a cerrar
export function NextClosingCard({ auction, countdown, onAction }) {
  return (
    <div className="lg:col-span-6 rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-[#0D0D0D]">Próximo Cierre</h2>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#224F10] bg-[#EAFFD0] px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#224F10] animate-pulse" />
          En vivo
        </span>
      </div>

      {auction ? (
        <div className="my-4 space-y-2">
          <p className="text-lg font-bold text-[#224F10] leading-snug line-clamp-2">{auction.title}</p>
          <p className="text-xs text-[#0D0D0D]/60 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#224F10]" />
            <span>Cierre en {countdown}</span>
          </p>
          <p className="text-xs font-semibold text-[#0D0D0D]">
            Oferta líder: <span className="text-[#224F10]">{formatCurrency(auction.currentPrice)}</span>
          </p>
        </div>
      ) : (
        <div className="my-4">
          <p className="text-sm font-semibold text-[#0D0D0D]/70">No hay subastas activas pendientes</p>
          <p className="text-xs text-[#0D0D0D]/50 mt-1">
            Publica un nuevo lote para iniciar una sala en tiempo real.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onAction}
        className="w-full py-2.5 px-4 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Gavel className="w-3.5 h-3.5" />
        <span>{auction ? 'Entrar a Pujar' : 'Publicar Nuevo Lote'}</span>
      </button>
    </div>
  );
}

// Tarjeta con las subastas recientes encontradas
export function RecentAuctionsCard({ auctions, onCreateClick, onOpenAuction }) {
  return (
    <div className="lg:col-span-6 rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
      <div className="flex items-center justify-between gap-2 pb-3">
        <h2 className="text-sm font-bold text-[#0D0D0D]">Subastas Recientes</h2>
        <button
          type="button"
          onClick={onCreateClick}
          className="px-2.5 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[11px] font-semibold text-[#0D0D0D] transition-colors cursor-pointer"
        >
          + Nueva
        </button>
      </div>

      <div className="space-y-2.5 flex-1">
        {auctions.length === 0 ? (
          <p className="text-xs text-[#0D0D0D]/50 py-6 text-center">Sin coincidencias.</p>
        ) : (
          auctions.map((auction, idx) => {
            const badgeColor = RECENT_BADGE_COLORS[idx % RECENT_BADGE_COLORS.length];
            const estadoTexto = auction.status === 'activa' ? 'En subasta' : 'Finalizada';
            return (
              <button
                key={auction.id}
                type="button"
                onClick={() => onOpenAuction(auction.id)}
                className="w-full flex items-center gap-2.5 text-left hover:bg-[#F7FBF3] p-1.5 -mx-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${badgeColor}`}>
                  <Tag className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#0D0D0D] truncate">{auction.title}</p>
                  <p className="text-[10px] text-[#0D0D0D]/50 truncate">
                    {formatCurrency(auction.currentPrice)} · {estadoTexto}
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
