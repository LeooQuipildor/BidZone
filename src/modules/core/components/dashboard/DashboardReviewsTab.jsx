import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReviewStore } from '../../../reviews/states/reviewStore';
import {
  formatDateTime,
  sameId,
  findById,
  matchesSearch,
} from '../../utils/formatters';
import { getReviewDefaults } from './dashboardHelpers';
import { DashboardFeedback, DashboardStatCard } from './DashboardShared';
import { Plus, X, Star, Edit3, Trash2, Save } from 'lucide-react';

const RATING_OPTIONS = ['5', '4', '3', '2', '1'];
const STAR_POSITIONS = [1, 2, 3, 4, 5];

// Convierte el código interno de rol en un texto claro para mostrar en pantalla
function getRoleContextLabel(roleContext) {
  if (roleContext === 'comprador_a_vendedor') {
    return 'Comprador → Vendedor';
  }
  return 'Vendedor → Comprador';
}

export function DashboardReviewsTab({
  currentUser,
  users,
  auctions,
  reviews,
  searchQuery,
  prefill,
}) {
  const createReview = useReviewStore((s) => s.createReview);
  const updateReview = useReviewStore((s) => s.updateReview);
  const deleteReview = useReviewStore((s) => s.deleteReview);

  const isAdmin = currentUser?.role === 'admin';

  // Solo se pueden calificar subastas finalizadas con ganador en las que participó el usuario
  const eligibleClosedAuctions = auctions.filter((auction) => {
    const tieneGanador = auction.status === 'finalizada' && auction.winnerId;
    if (!tieneGanador) {
      return false;
    }
    if (isAdmin) {
      return true;
    }
    return (
      sameId(auction.winnerId, currentUser?.id) ||
      sameId(auction.sellerId, currentUser?.id)
    );
  });

  const otherUsers = users.filter((u) => !sameId(u.id, currentUser?.id));

  const [feedback, setFeedback] = useState(null);
  const [formOpen, setFormOpen] = useState(Boolean(prefill?.openCreate));
  const [editingReviewId, setEditingReviewId] = useState(null);

  const initialAuction =
    findById(eligibleClosedAuctions, prefill?.auctionId) ||
    eligibleClosedAuctions[0] ||
    null;
  const initialDefaults = getReviewDefaults(
    initialAuction,
    currentUser?.id,
    otherUsers
  );

  const [formData, setFormData] = useState(() => ({
    auctionId:
      prefill?.auctionId || (initialAuction ? String(initialAuction.id) : ''),
    targetUserId: prefill?.targetUserId || initialDefaults.targetUserId,
    rating: '5',
    roleContext: initialDefaults.roleContext,
    comment: '',
  }));

  // Al crear una reseña nueva, calculamos automáticamente quién es la contraparte
  let selectedAuction = null;
  if (!editingReviewId) {
    selectedAuction =
      findById(eligibleClosedAuctions, formData.auctionId) ||
      eligibleClosedAuctions[0] ||
      null;
  }

  const derivedDefaults = getReviewDefaults(
    selectedAuction,
    currentUser?.id,
    otherUsers
  );

  let effectiveAuctionId = formData.auctionId;
  let effectiveTargetUserId = formData.targetUserId;
  let effectiveRoleContext = formData.roleContext;

  if (!editingReviewId) {
    effectiveAuctionId = selectedAuction ? String(selectedAuction.id) : '';
    effectiveTargetUserId =
      formData.targetUserId || derivedDefaults.targetUserId;
    effectiveRoleContext =
      formData.roleContext || derivedDefaults.roleContext;
  }

  const fiveStarCount = reviews.filter((r) => Number(r.rating) === 5).length;

  const filteredReviews = reviews.filter((rv) => {
    const target = findById(users, rv.targetUserId);
    const reviewer = findById(users, rv.reviewerId);
    const auction = findById(auctions, rv.auctionId);

    return matchesSearch(
      [
        rv.comment,
        target?.name || rv.targetUserName,
        reviewer?.name || rv.reviewerName,
        auction?.title || rv.auctionTitle,
      ],
      searchQuery
    );
  });

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleAuctionChange(nextAuctionId) {
    const nextAuction = findById(eligibleClosedAuctions, nextAuctionId);
    const nextDefaults = getReviewDefaults(
      nextAuction,
      currentUser?.id,
      otherUsers
    );
    setFormData((prev) => ({
      ...prev,
      auctionId: nextAuctionId,
      targetUserId: nextDefaults.targetUserId,
      roleContext: nextDefaults.roleContext,
    }));
  }

  function openCreateForm() {
    setEditingReviewId(null);
    const primeraSubasta = eligibleClosedAuctions[0] || null;
    const defaults = getReviewDefaults(
      primeraSubasta,
      currentUser?.id,
      otherUsers
    );

    setFormData({
      auctionId: primeraSubasta ? String(primeraSubasta.id) : '',
      targetUserId: defaults.targetUserId,
      rating: '5',
      roleContext: defaults.roleContext,
      comment: '',
    });
    setFormOpen(true);
    setFeedback(null);
  }

  function openEditForm(rv) {
    setEditingReviewId(rv.id);
    setFormData({
      auctionId: String(rv.auctionId),
      targetUserId: String(rv.targetUserId),
      rating: String(rv.rating),
      roleContext: rv.roleContext || 'comprador_a_vendedor',
      comment: rv.comment || '',
    });
    setFormOpen(true);
    setFeedback(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);

    if (!formData.comment.trim()) {
      setFeedback({
        type: 'error',
        text: 'Por favor escribe un breve comentario sobre la experiencia.',
      });
      return;
    }

    try {
      if (editingReviewId) {
        await updateReview(editingReviewId, {
          rating: Number(formData.rating),
          comment: formData.comment.trim(),
        });
        setFeedback({
          type: 'success',
          text: `Calificación #${editingReviewId} actualizada y reputación recalculada.`,
        });
      } else {
        if (!effectiveAuctionId) {
          setFeedback({
            type: 'error',
            text: 'Debes seleccionar una subasta finalizada elegible.',
          });
          return;
        }
        await createReview({
          auctionId: effectiveAuctionId,
          targetUserId: effectiveTargetUserId,
          rating: Number(formData.rating),
          roleContext: effectiveRoleContext,
          comment: formData.comment.trim(),
        });
        setFeedback({
          type: 'success',
          text: 'Calificación publicada y reputación actualizada (RN07).',
        });
      }
      setFormOpen(false);
      setEditingReviewId(null);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  }

  async function handleDelete(rv) {
    const confirmed = window.confirm(
      `¿Confirmas eliminar la calificación #${rv.id}?`
    );
    if (!confirmed) return;

    try {
      await deleteReview(rv.id);
      setFeedback({
        type: 'success',
        text: `Calificación #${rv.id} eliminada y reputación recalculada.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  }

  const isParticipantInSelected =
    selectedAuction &&
    (sameId(selectedAuction.winnerId, currentUser?.id) ||
      sameId(selectedAuction.sellerId, currentUser?.id));

  const lockCounterpartFields = Boolean(!isAdmin && isParticipantInSelected);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
            Reseñas y Reputación
          </h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">
            Evaluaciones mutuas de 1 a 5 estrellas emitidas tras concretar la
            entrega en subastas finalizadas (RN07).
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Emitir Calificación</span>
        </button>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard
          highlight
          title="Total Reseñas"
          icon={<Star className="w-3.5 h-3.5" />}
          value={reviews.length}
          subtitle="Operaciones evaluadas RN07"
        />
        <DashboardStatCard
          title="Mi Reputación"
          value={`${currentUser?.reputation || '5.0'} ★`}
          valueClassName="text-4xl text-[#224F10]"
          subtitle="Escala promedio 1 a 5"
        />
        <DashboardStatCard
          title="Máxima Puntuación (5★)"
          value={fiveStarCount}
          subtitle="Cumplimiento destacado"
          subtitleClassName="text-[#224F10] font-semibold"
        />
        <DashboardStatCard
          title="Cierres Calificables"
          value={eligibleClosedAuctions.length}
          subtitle="Subastas finalizadas elegibles"
        />
      </div>

      <DashboardFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      {/* Formulario integrado para crear o editar reseña */}
      {formOpen && (
        <div className="rounded-2xl bg-white border border-[#224F10]/20 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-[#224F10]/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0D0D0D]">
                {editingReviewId
                  ? `Editar Calificación #${editingReviewId}`
                  : 'Emitir Calificación (RN07)'}
              </h2>
              <p className="text-[11px] text-[#0D0D0D]/60">
                Califica de 1 a 5 estrellas la experiencia de pago o entrega tras
                el cierre.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditingReviewId(null);
              }}
              className="w-8 h-8 rounded-full bg-[#F7FBF3] hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!editingReviewId && eligibleClosedAuctions.length === 0 ? (
            <p className="text-xs text-[#0D0D0D]/65 py-2">
              Solo puedes calificar subastas finalizadas con ganador adjudicado
              en las que hayas participado como vendedor o comprador ganador
              (RN07).
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingReviewId && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                      Subasta Finalizada *
                    </label>
                    <select
                      value={effectiveAuctionId}
                      onChange={(e) => handleAuctionChange(e.target.value)}
                      className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                    >
                      {eligibleClosedAuctions.map((a) => {
                        const yaCalificada = reviews.some(
                          (rv) =>
                            sameId(rv.auctionId, a.id) &&
                            sameId(rv.reviewerId, currentUser?.id)
                        );
                        return (
                          <option key={a.id} value={String(a.id)}>
                            #{a.id} — {a.title}
                            {yaCalificada ? ' (Ya calificada)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                      Usuario a Calificar *
                    </label>
                    <select
                      disabled={lockCounterpartFields}
                      value={effectiveTargetUserId}
                      onChange={(e) =>
                        updateField('targetUserId', e.target.value)
                      }
                      className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] disabled:opacity-65 focus:outline-none"
                    >
                      {otherUsers.length > 0 ? (
                        otherUsers.map((u) => (
                          <option key={u.id} value={String(u.id)}>
                            {u.name}
                          </option>
                        ))
                      ) : (
                        <option value="">Sin contraparte</option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                      Rol en la Operación
                    </label>
                    <select
                      disabled={lockCounterpartFields}
                      value={effectiveRoleContext}
                      onChange={(e) =>
                        updateField('roleContext', e.target.value)
                      }
                      className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] disabled:opacity-65 focus:outline-none"
                    >
                      <option value="comprador_a_vendedor">
                        Comprador → Vendedor
                      </option>
                      <option value="vendedor_a_comprador">
                        Vendedor → Comprador
                      </option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75 block">
                  Puntuación (1 a 5 Estrellas) *
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {RATING_OPTIONS.map((val) => {
                    const isSelected = formData.rating === val;
                    const buttonStyle = isSelected
                      ? 'bg-[#224F10] text-[#EAFFD0] border-[#224F10]'
                      : 'bg-[#F7FBF3] text-[#0D0D0D]/75 border-[#224F10]/15 hover:bg-[#EAFFD0]';
                    const starColor = isSelected
                      ? 'fill-[#B0E454] text-[#B0E454]'
                      : 'fill-[#B0E454] text-[#224F10]';

                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateField('rating', val)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${buttonStyle}`}
                      >
                        <Star className={`w-3.5 h-3.5 ${starColor}`} />
                        <span>{val} ★</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Comentario de la Experiencia *
                </label>
                <textarea
                  rows={2}
                  value={formData.comment}
                  onChange={(e) => updateField('comment', e.target.value)}
                  placeholder="Describe el cumplimiento de entrega, comunicación y estado del artículo..."
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#224F10]/15 text-xs font-semibold text-[#0D0D0D]/75 hover:bg-[#F7FBF3] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] text-xs font-semibold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingReviewId ? 'Guardar Cambios' : 'Publicar Reseña'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Grilla de reseñas */}
      {filteredReviews.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-10 text-center text-xs text-[#0D0D0D]/60">
          No se encontraron reseñas para los criterios actuales.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rv) => {
            const auction = findById(auctions, rv.auctionId);
            const reviewer = findById(users, rv.reviewerId);
            const target = findById(users, rv.targetUserId);
            const canEdit =
              isAdmin || sameId(currentUser?.id, rv.reviewerId);

            return (
              <div
                key={rv.id}
                className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {STAR_POSITIONS.map((starNum) => {
                        const isFilled = starNum <= Number(rv.rating);
                        const starClass = isFilled
                          ? 'text-[#224F10] fill-[#B0E454]'
                          : 'text-[#0D0D0D]/15';

                        return (
                          <Star
                            key={starNum}
                            className={`w-4 h-4 ${starClass}`}
                          />
                        );
                      })}
                      <span className="ml-1.5 text-xs font-bold text-[#224F10]">
                        {rv.rating}.0
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-[#EAFFD0] text-[#224F10] border border-[#224F10]/15 text-[10px] font-bold">
                      {getRoleContextLabel(rv.roleContext)}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-[#0D0D0D] leading-relaxed">
                    &ldquo;{rv.comment}&rdquo;
                  </p>

                  <div className="text-xs text-[#0D0D0D]/75 space-y-1 bg-[#F7FBF3] p-3.5 rounded-xl border border-[#224F10]/10">
                    <p>
                      Calificado:{' '}
                      <strong className="text-[#224F10]">
                        {target?.name ||
                          rv.targetUserName ||
                          `Usuario #${rv.targetUserId}`}
                      </strong>
                    </p>
                    <p>
                      Autor:{' '}
                      <strong className="text-[#0D0D0D]">
                        {reviewer?.name ||
                          rv.reviewerName ||
                          `Usuario #${rv.reviewerId}`}
                      </strong>
                    </p>
                    <p className="truncate">
                      Operación:{' '}
                      <Link
                        to={`/auctions/${rv.auctionId}`}
                        className="font-semibold text-[#224F10] hover:underline"
                      >
                        {auction?.title ||
                          rv.auctionTitle ||
                          `Subasta #${rv.auctionId}`}
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#224F10]/8 text-[11px] text-[#0D0D0D]/55">
                  <span>{formatDateTime(rv.createdAt)}</span>
                  <div className="flex items-center gap-1.5">
                    {canEdit && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditForm(rv)}
                          title="Editar calificación"
                          className="w-7 h-7 rounded-full border border-[#224F10]/15 hover:bg-[#EAFFD0] text-[#0D0D0D]/75 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rv)}
                          title="Eliminar calificación"
                          className="w-7 h-7 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
