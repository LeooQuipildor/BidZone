import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BidConfirmModal } from '../../bids/components/BidConfirmModal';
import { AuctionBidHistory } from './AuctionBidHistory';
import { Alert, Badge, Button, Card, Input } from '../../core/design-system/ui';
import {
  formatCurrency,
  getMaxBidAmount,
  getRemainingTime,
  getSuggestedBidAmount,
  sameId,
  validateBidInput,
} from '../../core/utils/formatters';
import { Clock, Gavel } from 'lucide-react';

// Columna derecha del detalle: formulario de puja en vivo e historial auditable
export function AuctionBidPanel({
  auction,
  auctionBids,
  users,
  currentUser,
  nowMs,
  isSeller,
  onCreateBid,
  onSuccess,
  onError,
}) {
  const navigate = useNavigate();
  const [customAmount, setCustomAmount] = useState(null);
  const [bidNote, setBidNote] = useState('');
  const [commitment, setCommitment] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remaining = auction.endTime ? getRemainingTime(auction.endTime, nowMs) : { formatted: '—' };
  const suggestedAmount = getSuggestedBidAmount(auction);
  const maxAllowedBid = getMaxBidAmount(auction);
  const bidAmount = customAmount !== null ? customAmount : suggestedAmount;

  const topBid = auctionBids[0] || null;
  const isLeader = Boolean(currentUser && topBid && sameId(topBid.bidderId, currentUser.id));
  const hasParticipated = Boolean(currentUser && auctionBids.some((b) => sameId(b.bidderId, currentUser.id)));

  function handleOpenConfirmation(e) {
    e.preventDefault();
    onError('');
    onSuccess('');

    if (!currentUser) {
      navigate('/login');
      return;
    }

    const validationError = validateBidInput({ auction, amount: bidAmount, commitmentAccepted: commitment });
    if (validationError) {
      onError(validationError);
      return;
    }
    setShowConfirmModal(true);
  }

  async function handleConfirmBid() {
    setIsSubmitting(true);
    onError('');
    onSuccess('');
    const confirmedAmount = bidAmount;

    try {
      await onCreateBid({
        auctionId: auction.id,
        bidderId: currentUser.id,
        amount: confirmedAmount,
        note: bidNote,
        commitmentAccepted: commitment,
      });
      setShowConfirmModal(false);
      onSuccess(`¡Tu oferta de ${formatCurrency(confirmedAmount)} fue registrada exitosamente! Ahora eres el postor líder.`);
      setCustomAmount(null);
      setBidNote('');
    } catch (err) {
      setShowConfirmModal(false);
      onError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="lg:col-span-5 space-y-6">
      <Card className="space-y-5">
        <div className="flex items-center justify-between border-b border-[#224F10]/15 pb-4">
          <div>
            <span className="text-[11px] text-[#0D0D0D]/60 block">Oferta Líder Actual</span>
            <p className="font-serif-display text-4xl font-semibold text-[#224F10]">{formatCurrency(auction.currentPrice)}</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#0D0D0D]/60 block">Tiempo Restante</span>
            <p className="text-sm font-mono font-bold text-[#0D0D0D] flex items-center justify-end gap-1.5 mt-1">
              <Clock className="w-4 h-4 text-[#224F10]" />
              {auction.status === 'activa' ? remaining.formatted : 'Finalizada'}
            </p>
          </div>
        </div>

        {currentUser && auction.status === 'activa' && isLeader && (
          <Badge variant="lime" className="w-full justify-center py-2">
            ★ Eres el postor líder actual en esta subasta
          </Badge>
        )}
        {currentUser && auction.status === 'activa' && !isLeader && hasParticipated && (
          <Badge variant="success" className="w-full justify-center py-2">
            ⚠ Tu oferta fue superada — Puja nuevamente para liderar
          </Badge>
        )}

        {auction.status === 'activa' ? (
          isSeller ? (
            <Alert type="info" title="Eres el dueño de este artículo (RN02)">
              Como vendedor no puedes realizar auto-pujas sobre tu propia publicación. Puedes finalizar y adjudicar la subasta desde el botón superior.
            </Alert>
          ) : (
            <form onSubmit={handleOpenConfirmation} className="space-y-4">
              <Input
                id="bidAmount"
                type="number"
                label={`Tu Oferta en ARS (Mínimo ${formatCurrency(suggestedAmount)})`}
                helperText={`Máximo permitido: ${formatCurrency(maxAllowedBid)} (10 veces el precio inicial)`}
                max={maxAllowedBid}
                value={bidAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
              <Input
                id="bidNote"
                label="Nota de coordinación (Opcional)"
                placeholder="Ej: Pago en efectivo o transferencia y retiro en el día"
                value={bidNote}
                onChange={(e) => setBidNote(e.target.value)}
              />

              <label className="flex items-start gap-2.5 text-xs text-[#0D0D0D]/85 cursor-pointer bg-[#B0E454]/25 p-3.5 rounded-2xl border border-[#224F10]/20">
                <input type="checkbox" checked={commitment} onChange={(e) => setCommitment(e.target.checked)} className="mt-0.5 accent-[#224F10]" />
                <span>
                  <strong>Compromiso vinculante (RN04 / RN06):</strong> Si resulto ganador, me comprometo a coordinar el pago con el dueño. El incumplimiento conlleva sanción.
                </span>
              </label>

              <Button type="submit" size="lg" className="w-full">
                <Gavel className="w-4 h-4" />
                Enviar Oferta Vinculante
              </Button>
            </form>
          )
        ) : (
          <div className="bg-[#0D0D0D] text-[#EAFFD0] p-4 rounded-2xl text-center text-xs font-medium">
            Esta subasta se encuentra cerrada y ya no admite nuevas pujas (RN03).
          </div>
        )}
      </Card>

      <AuctionBidHistory bids={auctionBids} users={users} />

      <BidConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmBid}
        isSubmitting={isSubmitting}
        auction={auction}
        bidAmount={bidAmount}
        bidNote={bidNote}
      />
    </div>
  );
}
