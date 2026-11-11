import React from 'react';
import { DEFAULT_AUCTION_IMAGE_URL, formatCurrency } from '../../utils/formatters';
import { formatCountdownFromNow } from './dashboardHelpers';
import { ArrowUpRight, Clock, Edit3, Trash2 } from 'lucide-react';

function getCardStatusInfo(auction, isLive, countdown) {
  if (auction.status === 'cancelada') {
    return { timerText: 'Cancelada', badgeText: 'Cancelada', badgeClass: 'bg-red-50 text-red-700 border-red-200' };
  }
  if (isLive) {
    return { timerText: countdown, badgeText: 'En subasta', badgeClass: 'bg-[#EAFFD0] text-[#224F10] border-[#224F10]/20' };
  }
  return { timerText: 'Finalizada', badgeText: 'Finalizada', badgeClass: 'bg-red-50 text-red-700 border-red-200' };
}

// Tarjeta de cada subasta dentro de la pestaña Subastas del panel
export function DashboardAuctionCard({
  auction,
  seller,
  bidsCount,
  nowMs,
  canManage,
  onEdit,
  onDelete,
  onOpenDetail,
}) {
  const countdown = formatCountdownFromNow(auction.endTime, nowMs);
  const isLive = auction.status === 'activa' && countdown !== '00:00:00';
  const statusInfo = getCardStatusInfo(auction, isLive, countdown);

  return (
    <div className="group rounded-2xl bg-white border border-[#224F10]/10 p-3 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
      <div>
        <div
          onClick={() => onOpenDetail(auction.id)}
          className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#F1F8E9] cursor-pointer"
        >
          <img
            src={auction.imageUrl || DEFAULT_AUCTION_IMAGE_URL}
            alt={auction.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-2 pointer-events-none">
            <span className="px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white text-[10px] font-medium border border-white/20">
              {auction.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20 inline-flex items-center gap-1 tabular-nums">
              <Clock className="w-3 h-3 text-[#B0E454]" />
              {statusInfo.timerText}
            </span>
          </div>
        </div>

        <div className="mt-3 px-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onOpenDetail(auction.id)}
              className="text-sm font-bold text-[#0D0D0D] line-clamp-1 hover:text-[#224F10] cursor-pointer"
            >
              {auction.title}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 border ${statusInfo.badgeClass}`}>
              {statusInfo.badgeText}
            </span>
          </div>

          <p className="text-[11px] text-[#0D0D0D]/55 truncate">
            {bidsCount} {bidsCount === 1 ? 'oferta' : 'ofertas'} · Vende:{' '}
            {seller?.name || auction.sellerName || 'Socio'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#224F10]/8 flex items-center justify-between gap-2 px-1">
        <div>
          <span className="text-[10px] text-[#0D0D0D]/50 block leading-none">Oferta actual</span>
          <span className="text-base font-bold text-[#224F10] tabular-nums">
            {formatCurrency(auction.currentPrice)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => onEdit(auction)}
                title="Editar en el panel"
                className="w-8 h-8 rounded-full border border-[#224F10]/15 hover:bg-[#EAFFD0] text-[#0D0D0D]/75 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(auction)}
                title="Eliminar subasta"
                className="w-8 h-8 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onOpenDetail(auction.id)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] pl-3.5 pr-1.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <span>{isLive ? 'Pujar' : 'Detalle'}</span>
            <span className="w-5 h-5 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center">
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

