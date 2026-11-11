import React from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/formatters';
import { Edit3, Star, Trash2 } from 'lucide-react';

const STAR_POSITIONS = [1, 2, 3, 4, 5];

// Tarjeta de una reseña emitida tras finalizar una subasta (RN07)
export function DashboardReviewCard({
  review,
  auctionTitle,
  reviewerName,
  targetName,
  canEdit,
  onEdit,
  onDelete,
}) {
  return (
    <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between gap-4 shadow-2xs">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {STAR_POSITIONS.map((starNum) => (
              <Star
                key={starNum}
                className={`w-4 h-4 ${starNum <= Number(review.rating) ? 'text-[#224F10] fill-[#B0E454]' : 'text-[#0D0D0D]/15'}`}
              />
            ))}
            <span className="ml-1.5 text-xs font-bold text-[#224F10]">{review.rating}.0</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EAFFD0] text-[#224F10] border border-[#224F10]/15 text-[10px] font-bold">
            {review.roleContext === 'comprador_a_vendedor' ? 'Comprador → Vendedor' : 'Vendedor → Comprador'}
          </span>
        </div>

        <p className="text-sm font-medium text-[#0D0D0D] leading-relaxed">&ldquo;{review.comment}&rdquo;</p>

        <div className="text-xs text-[#0D0D0D]/75 space-y-1 bg-[#F7FBF3] p-3.5 rounded-xl border border-[#224F10]/10">
          <p>Calificado: <strong className="text-[#224F10]">{targetName}</strong></p>
          <p>Autor: <strong className="text-[#0D0D0D]">{reviewerName}</strong></p>
          <p className="truncate">
            Operación:{' '}
            <Link to={`/auctions/${review.auctionId}`} className="font-semibold text-[#224F10] hover:underline">
              {auctionTitle}
            </Link>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#224F10]/8 text-[11px] text-[#0D0D0D]/55">
        <span>{formatDateTime(review.createdAt)}</span>
        {canEdit && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onEdit}
              title="Editar calificación"
              className="w-7 h-7 rounded-full border border-[#224F10]/15 hover:bg-[#EAFFD0] text-[#0D0D0D]/75 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Eliminar calificación"
              className="w-7 h-7 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

