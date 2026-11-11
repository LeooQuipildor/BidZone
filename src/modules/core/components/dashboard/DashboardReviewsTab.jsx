import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReviewStore } from '../../../reviews/states/reviewStore';
import { formatDateTime } from '../../utils/formatters';
import {
  Plus,
  X,
  Star,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

function deriveReviewTarget(auction, currentUserId, otherUsers) {
  if (!auction) {
    return {
      targetUserId: otherUsers[0] ? String(otherUsers[0].id) : '',
      roleContext: 'comprador_a_vendedor',
    };
  }
  if (Number(auction.winnerId) === Number(currentUserId)) {
    return {
      targetUserId: String(auction.sellerId),
      roleContext: 'comprador_a_vendedor',
    };
  }
  if (Number(auction.sellerId) === Number(currentUserId)) {
    return {
      targetUserId: String(auction.winnerId),
      roleContext: 'vendedor_a_comprador',
    };
  }
  return {
    targetUserId: String(auction.sellerId || otherUsers[0]?.id || ''),
    roleContext: 'comprador_a_vendedor',
  };
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

  const eligibleClosedAuctions = useMemo(
    () =>
      auctions.filter((a) => {
        if (a.status !== 'finalizada' || !a.winnerId) return false;
        if (isAdmin) return true;
        return (
          Number(a.winnerId) === Number(currentUser?.id) ||
          Number(a.sellerId) === Number(currentUser?.id)
        );
      }),
    [auctions, isAdmin, currentUser?.id]
  );

  const otherUsers = useMemo(
    () => users.filter((u) => Number(u.id) !== Number(currentUser?.id)),
    [users, currentUser?.id]
  );

  const [feedback, setFeedback] = useState(null);
  const [formOpen, setFormOpen] = useState(Boolean(prefill?.openCreate));
  const [editingReviewId, setEditingReviewId] = useState(null);

  const initialAuction =
    eligibleClosedAuctions.find(
      (a) => String(a.id) === String(prefill?.auctionId)
    ) || eligibleClosedAuctions[0];
  const initialDerived = deriveReviewTarget(
    initialAuction,
    currentUser?.id,
    otherUsers
  );

  const [formData, setFormData] = useState(() => ({
    auctionId:
      prefill?.auctionId || (initialAuction ? String(initialAuction.id) : ''),
    targetUserId: prefill?.targetUserId || initialDerived.targetUserId,
    rating: '5',
    roleContext: initialDerived.roleContext,
    comment: '',
  }));

  const selectedAuction = editingReviewId
    ? null
    : eligibleClosedAuctions.find(
        (a) => String(a.id) === String(formData.auctionId)
      ) ||
      eligibleClosedAuctions[0] ||
      null;
  const effectiveDerived = deriveReviewTarget(
    selectedAuction,
    currentUser?.id,
    otherUsers
  );
  const effectiveAuctionId = editingReviewId
    ? formData.auctionId
    : selectedAuction
      ? String(selectedAuction.id)
      : '';
  const effectiveTargetUserId = editingReviewId
    ? formData.targetUserId
    : formData.targetUserId || effectiveDerived.targetUserId;
  const effectiveRoleContext = editingReviewId
    ? formData.roleContext
    : formData.roleContext || effectiveDerived.roleContext;

  const fiveStarCount = reviews.filter((r) => Number(r.rating) === 5).length;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredReviews = reviews.filter((rv) => {
    if (!normalizedQuery) return true;
    const target = users.find(
      (u) => Number(u.id) === Number(rv.targetUserId)
    );
    const reviewer = users.find(
      (u) => Number(u.id) === Number(rv.reviewerId)
    );
    const auction = auctions.find(
      (a) => Number(a.id) === Number(rv.auctionId)
    );
    return (
      (rv.comment || '').toLowerCase().includes(normalizedQuery) ||
      (target?.name || rv.targetUserName || '').toLowerCase().includes(normalizedQuery) ||
      (reviewer?.name || rv.reviewerName || '').toLowerCase().includes(normalizedQuery) ||
      (auction?.title || rv.auctionTitle || '').toLowerCase().includes(normalizedQuery)
    );
  });

  const openCreateForm = () => {
    setEditingReviewId(null);
    const first = eligibleClosedAuctions[0];
    const derived = deriveReviewTarget(first, currentUser?.id, otherUsers);
    setFormData({
      auctionId: first ? String(first.id) : '',
      targetUserId: derived.targetUserId,
      rating: '5',
      roleContext: derived.roleContext,
      comment: '',
    });
    setFormOpen(true);
    setFeedback(null);
  };

  const openEditForm = (rv) => {
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
  };

  const handleSubmit = async (e) => {
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
  };

  const handleDelete = async (rv) => {
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
  };

  const isParticipantInSelected =
    selectedAuction &&
    (Number(selectedAuction.winnerId) === Number(currentUser?.id) ||
      Number(selectedAuction.sellerId) === Number(currentUser?.id));

  return (
    <div className="space-y-6">
      {/* Header */}
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
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Emitir Calificación</span>
        </button>
      </div>

      {/* 4 Donezo KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#224F10] to-[#122B08] text-[#EAFFD0] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#EAFFD0]/90">
              Total Reseñas
            </span>
            <span className="w-7 h-7 rounded-full bg-[#EAFFD0]/15 text-[#B0E454] flex items-center justify-center">
              <Star className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-4xl font-bold tracking-tight my-2">
            {reviews.length}
          </p>
          <span className="text-[11px] text-[#EAFFD0]/75">
            Operaciones evaluadas RN07
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-xs font-semibold text-[#0D0D0D]/75">
            Mi Reputación
          </span>
          <p className="text-4xl font-bold tracking-tight text-[#224F10] my-2">
            {currentUser?.reputation || '5.0'} ★
          </p>
          <span className="text-[11px] text-[#0D0D0D]/55">
            Escala promedio 1 a 5
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-xs font-semibold text-[#0D0D0D]/75">
            Máxima Puntuación (5★)
          </span>
          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-2">
            {fiveStarCount}
          </p>
          <span className="text-[11px] text-[#224F10] font-semibold">
            Cumplimiento destacado
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-xs font-semibold text-[#0D0D0D]/75">
            Cierres Calificables
          </span>
          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-2">
            {eligibleClosedAuctions.length}
          </p>
          <span className="text-[11px] text-[#0D0D0D]/55">
            Subastas finalizadas elegibles
          </span>
        </div>
      </div>

      {/* Inline Feedback */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs font-medium border ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-[#EAFFD0] border-[#224F10]/20 text-[#224F10]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Inline Create / Edit Review Panel */}
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
              Solo puedes calificar subastas finalizadas con ganador adjudicado en las que hayas participado como vendedor o comprador ganador (RN07).
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
                      onChange={(e) => {
                        const val = e.target.value;
                        const nextAuction = eligibleClosedAuctions.find(
                          (a) => String(a.id) === String(val)
                        );
                        const derived = deriveReviewTarget(
                          nextAuction,
                          currentUser?.id,
                          otherUsers
                        );
                        setFormData((p) => ({
                          ...p,
                          auctionId: val,
                          targetUserId: derived.targetUserId,
                          roleContext: derived.roleContext,
                        }));
                      }}
                      className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                    >
                      {eligibleClosedAuctions.map((a) => {
                        const already = reviews.some(
                          (rv) =>
                            Number(rv.auctionId) === Number(a.id) &&
                            Number(rv.reviewerId) === Number(currentUser?.id)
                        );
                        return (
                          <option key={a.id} value={String(a.id)}>
                            #{a.id} — {a.title}
                            {already ? ' (Ya calificada)' : ''}
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
                      disabled={Boolean(!isAdmin && isParticipantInSelected)}
                      value={effectiveTargetUserId}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          targetUserId: e.target.value,
                        }))
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
                      disabled={Boolean(!isAdmin && isParticipantInSelected)}
                      value={effectiveRoleContext}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          roleContext: e.target.value,
                        }))
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
                  {['5', '4', '3', '2', '1'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, rating: val }))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                        formData.rating === val
                          ? 'bg-[#224F10] text-[#EAFFD0] border-[#224F10]'
                          : 'bg-[#F7FBF3] text-[#0D0D0D]/75 border-[#224F10]/15 hover:bg-[#EAFFD0]'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          formData.rating === val
                            ? 'fill-[#B0E454] text-[#B0E454]'
                            : 'fill-[#B0E454] text-[#224F10]'
                        }`}
                      />
                      <span>{val} ★</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Comentario de la Experiencia *
                </label>
                <textarea
                  rows={2}
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, comment: e.target.value }))
                  }
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

      {/* Donezo Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-10 text-center text-xs text-[#0D0D0D]/60">
          No se encontraron reseñas para los criterios actuales.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rv) => {
            const auction = auctions.find(
              (a) => Number(a.id) === Number(rv.auctionId)
            );
            const reviewer = users.find(
              (u) => Number(u.id) === Number(rv.reviewerId)
            );
            const target = users.find(
              (u) => Number(u.id) === Number(rv.targetUserId)
            );
            const canEdit =
              isAdmin || Number(currentUser?.id) === Number(rv.reviewerId);

            return (
              <div
                key={rv.id}
                className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-4 h-4 ${
                            idx < Number(rv.rating)
                              ? 'text-[#224F10] fill-[#B0E454]'
                              : 'text-[#0D0D0D]/15'
                          }`}
                        />
                      ))}
                      <span className="ml-1.5 text-xs font-bold text-[#224F10]">
                        {rv.rating}.0
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-[#EAFFD0] text-[#224F10] border border-[#224F10]/15 text-[10px] font-bold">
                      {rv.roleContext === 'comprador_a_vendedor'
                        ? 'Comprador → Vendedor'
                        : 'Vendedor → Comprador'}
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
                          onClick={() => openEditForm(rv)}
                          title="Editar calificación"
                          className="w-7 h-7 rounded-full border border-[#224F10]/15 hover:bg-[#EAFFD0] text-[#0D0D0D]/75 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
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

