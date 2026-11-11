import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card } from '../../core/design-system/ui';
import { findById, formatCurrency, formatDateTime } from '../../core/utils/formatters';

// Tarjeta con el historial público y auditable de ofertas de una subasta
export function AuctionBidHistory({ bids, users }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#224F10]/15 pb-2">
        <h3 className="font-serif-display text-2xl text-[#0D0D0D]">
          Historial auditable ({bids.length})
        </h3>
        <Link to="/bids" className="text-xs font-semibold text-[#224F10] hover:underline">
          Ver todas →
        </Link>
      </div>

      {bids.length === 0 ? (
        <p className="text-xs text-[#0D0D0D]/60 py-4 text-center">
          Aún no hay ofertas registradas. ¡Sé el primero en pujar!
        </p>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {bids.map((bid, index) => {
            const bidderFromStore = findById(users, bid.bidderId);
            const bidderName = bid.bidderName || bidderFromStore?.name || `Usuario #${bid.bidderId}`;
            const isTopBid = index === 0;

            return (
              <div
                key={bid.id}
                className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
                  isTopBid ? 'bg-[#0D0D0D] text-[#EAFFD0] border-[#0D0D0D]' : 'bg-white/80 text-[#0D0D0D] border-[#224F10]/15'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{bidderName}</span>
                    {isTopBid && <Badge variant="lime" className="text-[10px]">Líder</Badge>}
                  </div>
                  <p className="text-[11px] opacity-75 mt-0.5">{bid.note}</p>
                  <span className="text-[10px] opacity-60">{formatDateTime(bid.createdAt)}</span>
                </div>
                <span className={`font-serif-display text-2xl font-semibold ${isTopBid ? 'text-[#B0E454]' : 'text-[#224F10]'}`}>
                  {formatCurrency(bid.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

