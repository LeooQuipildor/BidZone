import React, { useState } from 'react';
import { findById, sameId } from '../../core/utils/formatters';
import { getReviewDefaults } from '../../core/components/dashboard/dashboardHelpers';
import { Alert, Button, Select, Textarea } from '../../core/design-system/ui';
import { Save, Star } from 'lucide-react';

const RATING_VALUES = ['5', '4', '3', '2', '1'];
const REVIEW_ROLE_OPTIONS = [
  { value: 'comprador_a_vendedor', label: 'Comprador → Vendedor' },
  { value: 'vendedor_a_comprador', label: 'Vendedor → Comprador' },
];

// Formulario único para crear o editar una calificación (RN07)
export function ReviewForm({
  review = null,
  eligibleAuctions = [],
  otherUsers = [],
  reviews = [],
  currentUserId,
  isAdmin = false,
  initialAuctionId = '',
  initialTargetUserId = '',
  onCreateReview,
  onUpdateReview,
  onSaved,
  onCancel,
}) {
  const isEditing = Boolean(review);
  const [formData, setFormData] = useState(() => ({
    auctionId: initialAuctionId,
    targetUserId: initialTargetUserId,
    rating: review ? String(review.rating ?? '5') : '5',
    roleContext: review?.roleContext || '',
    comment: review?.comment || '',
  }));
  const [errorMsg, setErrorMsg] = useState('');

  if (!isEditing && eligibleAuctions.length === 0) {
    return (
      <Alert type="info" title="Sin operaciones calificables aún">
        Solo puedes calificar subastas finalizadas con ganador adjudicado en las que hayas participado (RN07).
      </Alert>
    );
  }

  const selectedAuction = !isEditing
    ? findById(eligibleAuctions, formData.auctionId) || eligibleAuctions[0] || null
    : null;
  const defaults = getReviewDefaults(selectedAuction, currentUserId, otherUsers);

  const effectiveAuctionId = selectedAuction ? String(selectedAuction.id) : '';
  const effectiveTargetUserId = formData.targetUserId || defaults.targetUserId;
  const effectiveRoleContext = formData.roleContext || defaults.roleContext;
  const isParticipant = Boolean(
    selectedAuction && (sameId(selectedAuction.winnerId, currentUserId) || sameId(selectedAuction.sellerId, currentUserId))
  );
  const lockCounterpart = Boolean(!isAdmin && isParticipant);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'auctionId') {
      const nextDefaults = getReviewDefaults(findById(eligibleAuctions, value), currentUserId, otherUsers);
      setFormData((prev) => ({
        ...prev,
        auctionId: value,
        targetUserId: nextDefaults.targetUserId,
        roleContext: nextDefaults.roleContext,
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.comment.trim()) {
      setErrorMsg('Por favor escribe un breve comentario sobre la experiencia.');
      return;
    }

    try {
      if (isEditing) {
        const updated = await onUpdateReview(review.id, { rating: Number(formData.rating), comment: formData.comment.trim() });
        onSaved?.(updated);
      } else {
        if (!effectiveAuctionId) {
          setErrorMsg('Debes seleccionar una subasta finalizada elegible.');
          return;
        }
        const created = await onCreateReview({
          auctionId: effectiveAuctionId,
          targetUserId: effectiveTargetUserId,
          rating: Number(formData.rating),
          roleContext: effectiveRoleContext,
          comment: formData.comment.trim(),
        });
        onSaved?.(created);
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  const auctionOptions = eligibleAuctions.map((a) => {
    const alreadyReviewed = reviews.some((rv) => sameId(rv.auctionId, a.id) && sameId(rv.reviewerId, currentUserId));
    return { value: String(a.id), label: `#${a.id} — ${a.title}${alreadyReviewed ? ' (Ya calificada)' : ''}` };
  });

  const targetOptions = otherUsers.length > 0
    ? otherUsers.map((u) => ({ value: String(u.id), label: u.email ? `${u.name} (${u.email})` : u.name }))
    : [{ value: '', label: 'Sin contraparte disponible' }];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && <Alert type="error" onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}

      {!isEditing && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select id="auctionId" name="auctionId" label="Subasta Finalizada *" value={effectiveAuctionId} onChange={handleChange} options={auctionOptions} />
          <Select id="targetUserId" name="targetUserId" label="Usuario a Calificar *" disabled={lockCounterpart} value={effectiveTargetUserId} onChange={handleChange} options={targetOptions} />
          <Select id="roleContext" name="roleContext" label="Rol en la Operación" disabled={lockCounterpart} value={effectiveRoleContext} onChange={handleChange} options={REVIEW_ROLE_OPTIONS} />
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#0D0D0D]/80 block">Puntuación (1 a 5 Estrellas) *</label>
        <div className="flex flex-wrap items-center gap-2">
          {RATING_VALUES.map((val) => {
            const isSelected = formData.rating === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, rating: val }))}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#224F10] text-[#EAFFD0] border-[#224F10]' : 'bg-white text-[#0D0D0D]/75 border-[#224F10]/20 hover:bg-[#EAFFD0]'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isSelected ? 'fill-[#B0E454] text-[#B0E454]' : 'fill-[#B0E454] text-[#224F10]'}`} />
                <span>{val} ★</span>
              </button>
            );
          })}
        </div>
      </div>

      <Textarea id="comment" name="comment" label="Comentario de la Experiencia *" placeholder="Describe el cumplimiento de entrega, comunicación y estado del artículo..." value={formData.comment} onChange={handleChange} />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">
          {isEditing ? <Save className="w-4 h-4" /> : <Star className="w-4 h-4" />}
          {isEditing ? 'Guardar Cambios' : 'Publicar Reseña'}
        </Button>
      </div>
    </form>
  );
}
