import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBidStore } from '../../bids/states/bidStore';
import {
  DEFAULT_AUCTION_IMAGE_URL,
  formatCurrency,
  getRemainingTime,
  sameId,
} from '../../core/utils/formatters';
import { Clock, ArrowUpRight, Edit3, Trash2 } from 'lucide-react';
import { Button } from '../../core/design-system/ui';

export function AuctionCard({
  auction,
  canManage = false,
  onDelete,
  className = '',
}) {
  const navigate = useNavigate();
  const bids = useBidStore((s) => s.bids);

  const [remaining, setRemaining] = useState(() =>
    getRemainingTime(auction.endTime)
  );

  // Actualizamos el contador de tiempo restante cada 1 segundo si la subasta está activa
  useEffect(() => {
    if (auction.status !== 'activa') return;

    const interval = setInterval(() => {
      setRemaining(getRemainingTime(auction.endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [auction.endTime, auction.status]);

  const auctionBids = bids.filter((b) => sameId(b.auctionId, auction.id));
  let bidCount = auctionBids.length;
  if (auction.bidCount !== undefined) {
    bidCount = Number(auction.bidCount);
  }

  const isLive = auction.status === 'activa' && !remaining.expired;
  const bidsWord = bidCount === 1 ? 'oferta' : 'ofertas';

  function handleCardClick() {
    navigate(`/auctions/${auction.id}`);
  }

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-[26px] bg-white border border-neutral-200/90 p-2 sm:p-1 pb-3.5 sm:pb-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer ${className}`}
    >
      <div>
        {/* Foto de la subasta + etiquetas flotantes */}
        <div className="relative w-full aspect-[4/3] rounded-[20px] overflow-hidden bg-neutral-100">
          <img
            src={auction.imageUrl || DEFAULT_AUCTION_IMAGE_URL}
            alt={auction.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-[11px] font-medium tracking-wide shadow-xs border border-white/20">
              {auction.category}
            </span>

            <div className="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide shadow-xs border border-white/20 flex items-center gap-1.5 shrink-0">
              <Clock className="w-3 h-3 text-[#B0E454]" />
              <span className="tabular-nums">
                {isLive ? remaining.formatted : 'Finalizada'}
              </span>
            </div>
          </div>
        </div>

        {/* Título, estado y cantidad de ofertas */}
        <div className="mt-3 px-1.5 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-[#0D0D0D] tracking-tight truncate group-hover:text-[#224F10] transition-colors">
              {auction.title}
            </h3>

            {isLive ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAFFD0] text-[#224F10] border border-[#224F10]/20 text-[11px] font-semibold shrink-0">
                En subasta
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold shrink-0">
                Finalizada
              </span>
            )}
          </div>

          <p className="text-xs text-neutral-400 font-normal truncate">
            {bidCount} {bidsWord}
          </p>
        </div>
      </div>

      {/* Precio actual y botón para entrar a pujar */}
      <div className="mt-3.5 px-1 pt-1 flex items-center justify-between gap-2">
        <div className="px-3.5 py-1.5 sm:py-2 rounded-full bg-neutral-100 text-[#0D0D0D] font-bold text-sm sm:text-base tracking-tight shrink-0">
          {formatCurrency(auction.currentPrice)}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/auctions/${auction.id}`);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs group-hover:shadow-md"
        >
          <span>Pujar ahora</span>
          <span className="w-6 h-6 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </span>
        </button>
      </div>

      {/* Botones de editar y eliminar visibles solo para el dueño o admin */}
      {canManage && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-end gap-2 pt-2.5 mt-2.5 mx-1 border-t border-neutral-100"
        >
          <Link to={`/auctions/${auction.id}/edit`}>
            <Button variant="outline" size="sm" withArrow={false}>
              <Edit3 className="w-3 h-3" />
              Editar
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            withArrow={false}
            onClick={() => {
              if (onDelete) {
                onDelete(auction);
              }
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default AuctionCard;
