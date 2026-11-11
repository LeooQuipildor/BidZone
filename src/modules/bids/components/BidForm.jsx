import React, { useState } from 'react';
import { BidConfirmModal } from './BidConfirmModal';
import {
  findById,
  formatCurrency,
  getMaxBidAmount,
  getSuggestedBidAmount,
  pickValidId,
  validateBidInput,
} from '../../core/utils/formatters';
import { Alert, Button, Input, Select } from '../../core/design-system/ui';
import { Gavel, Save } from 'lucide-react';

// Formulario único para crear o editar una puja vinculante (Panel y vistas /new y /edit)
export function BidForm({
  bid = null,
  auctions = [],
  currentUserId,
  isAdmin = false,
  onCreateBid,
  onUpdateBid,
  onSaved,
  onCancel,
}) {
  const isEditing = Boolean(bid);
  const activeAuctions = auctions.filter((a) => a.status === 'activa');

  const [selectedAuctionId, setSelectedAuctionId] = useState(bid ? String(bid.auctionId) : '');
  const [amountInput, setAmountInput] = useState(bid ? String(bid.amount ?? '') : null);
  const [note, setNote] = useState(bid?.note || '');
  const [commitment, setCommitment] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveAuctionId = isEditing ? String(bid.auctionId) : pickValidId(activeAuctions, selectedAuctionId);
  const selectedAuction = findById(isEditing ? auctions : activeAuctions, effectiveAuctionId);
  const suggestedAmount = getSuggestedBidAmount(selectedAuction);
  const maxAllowed = getMaxBidAmount(selectedAuction);
  const amount = amountInput !== null ? amountInput : suggestedAmount;

  if (!isEditing && activeAuctions.length === 0) {
    return (
      <Alert type="info" title="Sin subastas activas">
        Actualmente no hay subastas activas disponibles para ofertar. Puedes publicar una o esperar nuevos lotes.
      </Alert>
    );
  }

  function handleAuctionChange(e) {
    setSelectedAuctionId(e.target.value);
    if (!isEditing) setAmountInput(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (isEditing) {
      const payload = isAdmin ? { amount: Number(amount), note: note.trim() } : { note: note.trim() };
      try {
        const updated = await onUpdateBid(bid.id, payload);
        onSaved?.(updated, amount);
      } catch (err) {
        setErrorMsg(err.message);
      }
      return;
    }

    const validationError = validateBidInput({ auction: selectedAuction, amount, commitmentAccepted: commitment });
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }
    setShowConfirmModal(true);
  }

  async function handleConfirmBid() {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const created = await onCreateBid({
        auctionId: effectiveAuctionId,
        bidderId: currentUserId,
        amount,
        note,
        commitmentAccepted: commitment,
      });
      setShowConfirmModal(false);
      onSaved?.(created, amount);
    } catch (err) {
      setShowConfirmModal(false);
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const auctionOptions = (isEditing ? auctions : activeAuctions).map((a) => ({
    value: String(a.id),
    label: `${a.title} (Actual: ${formatCurrency(a.currentPrice)})`,
  }));

  let amountHelper;
  if (isEditing && !isAdmin) {
    amountHelper = 'RN04: El monto ofertado es vinculante e irrevocable.';
  } else if (maxAllowed) {
    amountHelper = `Máximo permitido (10x precio inicial): ${formatCurrency(maxAllowed)}`;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isEditing && !isAdmin && (
          <Alert type="info" title="Regla de Negocio RN04 (Irrevocabilidad del Monto)">
            Como postor puedes actualizar tu nota de coordinación, pero el importe ofertado es irrevocable.
          </Alert>
        )}

        {errorMsg && <Alert type="error" onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select id="auctionId" label={isEditing ? 'Subasta Asociada' : 'Seleccionar Subasta Activa *'} disabled={isEditing} value={effectiveAuctionId} onChange={handleAuctionChange} options={auctionOptions} />
          <Input id="amount" type="number" label="Monto de la Oferta (ARS) *" disabled={isEditing && !isAdmin} max={maxAllowed} helperText={amountHelper} value={amount} onChange={(e) => setAmountInput(e.target.value)} />
        </div>

        {!isEditing && selectedAuction && (
          <div className="p-3.5 rounded-2xl bg-[#F7FBF3] border border-[#224F10]/15 text-xs flex flex-wrap gap-x-6 gap-y-1">
            <span>Precio actual: <strong className="text-[#224F10]">{formatCurrency(selectedAuction.currentPrice)}</strong></span>
            <span>Incremento RN01: <strong>+{formatCurrency(selectedAuction.minIncrement)}</strong></span>
            <span>Mínimo sugerido: <strong className="text-[#224F10]">{formatCurrency(suggestedAmount)}</strong></span>
          </div>
        )}

        <Input id="note" label="Nota de Coordinación / Observación" placeholder="Ej: Pago por transferencia inmediata al liberarse el contacto." value={note} onChange={(e) => setNote(e.target.value)} />

        {!isEditing && (
          <label className="flex items-start gap-2.5 text-xs text-[#0D0D0D]/80 cursor-pointer bg-[#B0E454]/25 p-3.5 rounded-2xl border border-[#224F10]/20">
            <input type="checkbox" checked={commitment} onChange={(e) => setCommitment(e.target.checked)} className="mt-0.5 accent-[#224F10]" />
            <span>
              Acepto el compromiso vinculante e irrevocable de compra (RN04) para concretar el pago si resulto ganador.
            </span>
          </label>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">
            {isEditing ? <Save className="w-4 h-4" /> : <Gavel className="w-4 h-4" />}
            {isEditing ? 'Guardar Cambios' : 'Confirmar Puja'}
          </Button>
        </div>
      </form>

      <BidConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={handleConfirmBid} isSubmitting={isSubmitting} auction={selectedAuction} bidAmount={amount} bidNote={note} />
    </>
  );
}
