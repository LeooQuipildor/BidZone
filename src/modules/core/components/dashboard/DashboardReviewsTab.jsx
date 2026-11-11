import React, { useState } from 'react';
import { useReviewStore } from '../../../reviews/states/reviewStore';
import { ReviewForm } from '../../../reviews/components/ReviewForm';
import { sameId, findById, matchesSearch } from '../../utils/formatters';
import { DashboardFeedback, DashboardFormPanel, DashboardStatCard } from './DashboardShared';
import { DashboardReviewCard } from './DashboardReviewCard';
import { Plus, Star } from 'lucide-react';

export function DashboardReviewsTab({ currentUser, users, auctions, reviews, searchQuery, prefill }) {
  const createReview = useReviewStore((s) => s.createReview);
  const updateReview = useReviewStore((s) => s.updateReview);
  const deleteReview = useReviewStore((s) => s.deleteReview);

  const isAdmin = currentUser?.role === 'admin';
  const eligibleClosedAuctions = auctions.filter((auction) => {
    if (auction.status !== 'finalizada' || !auction.winnerId) return false;
    return isAdmin || sameId(auction.winnerId, currentUser?.id) || sameId(auction.sellerId, currentUser?.id);
  });
  const otherUsers = users.filter((u) => !sameId(u.id, currentUser?.id));

  const [feedback, setFeedback] = useState(null);
  const [formOpen, setFormOpen] = useState(Boolean(prefill?.openCreate));
  const [editingReviewId, setEditingReviewId] = useState(null);

  const editingReview = editingReviewId ? findById(reviews, editingReviewId) : null;
  const fiveStarCount = reviews.filter((r) => Number(r.rating) === 5).length;

  const filteredReviews = reviews.filter((rv) => {
    const target = findById(users, rv.targetUserId);
    const reviewer = findById(users, rv.reviewerId);
    const auction = findById(auctions, rv.auctionId);
    return matchesSearch(
      [rv.comment, target?.name || rv.targetUserName, reviewer?.name || rv.reviewerName, auction?.title || rv.auctionTitle],
      searchQuery
    );
  });

  function closeForm() {
    setFormOpen(false);
    setEditingReviewId(null);
  }

  function handleSaved() {
    setFeedback({
      type: 'success',
      text: editingReview
        ? `Calificación #${editingReview.id} actualizada y reputación recalculada.`
        : 'Calificación publicada y reputación actualizada (RN07).',
    });
    closeForm();
  }

  async function handleDelete(rv) {
    if (!window.confirm(`¿Confirmas eliminar la calificación #${rv.id}?`)) return;
    try {
      await deleteReview(rv.id);
      setFeedback({ type: 'success', text: `Calificación #${rv.id} eliminada y reputación recalculada.` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">Reseñas y Reputación</h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">
            Evaluaciones mutuas de 1 a 5 estrellas emitidas en subastas finalizadas (RN07).
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setEditingReviewId(null); setFormOpen(true); setFeedback(null); }}
          className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Emitir Calificación</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard highlight title="Total Reseñas" icon={<Star className="w-3.5 h-3.5" />} value={reviews.length} subtitle="Operaciones evaluadas RN07" />
        <DashboardStatCard title="Mi Reputación" value={`${currentUser?.reputation || '5.0'} ★`} valueClassName="text-4xl text-[#224F10]" subtitle="Escala promedio 1 a 5" />
        <DashboardStatCard title="Máxima Puntuación (5★)" value={fiveStarCount} subtitle="Cumplimiento destacado" subtitleClassName="text-[#224F10] font-semibold" />
        <DashboardStatCard title="Cierres Calificables" value={eligibleClosedAuctions.length} subtitle="Subastas elegibles" />
      </div>

      <DashboardFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      {formOpen && (
        <DashboardFormPanel
          title={editingReview ? `Editar Calificación #${editingReview.id}` : 'Emitir Calificación (RN07)'}
          onClose={closeForm}
        >
          <ReviewForm
            key={editingReview ? `${editingReview.id}-${editingReview.rating}` : `new-${prefill?.auctionId || ''}`}
            review={editingReview}
            eligibleAuctions={eligibleClosedAuctions}
            otherUsers={otherUsers}
            reviews={reviews}
            currentUserId={currentUser?.id}
            isAdmin={isAdmin}
            initialAuctionId={prefill?.auctionId || ''}
            initialTargetUserId={prefill?.targetUserId || ''}
            onCreateReview={createReview}
            onUpdateReview={updateReview}
            onSaved={handleSaved}
            onCancel={closeForm}
          />
        </DashboardFormPanel>
      )}

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
            const canEdit = isAdmin || sameId(currentUser?.id, rv.reviewerId);

            return (
              <DashboardReviewCard
                key={rv.id}
                review={rv}
                auctionTitle={auction?.title || rv.auctionTitle || `Subasta #${rv.auctionId}`}
                reviewerName={reviewer?.name || rv.reviewerName || `Usuario #${rv.reviewerId}`}
                targetName={target?.name || rv.targetUserName || `Usuario #${rv.targetUserId}`}
                canEdit={canEdit}
                onEdit={() => { setEditingReviewId(rv.id); setFormOpen(true); setFeedback(null); }}
                onDelete={() => handleDelete(rv)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
