import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReviewStore } from '../states/reviewStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import {
  Card,
  Button,
  Badge,
  PageHeader,
  Alert,
} from '../../core/design-system/ui';
import { formatDateTime } from '../../core/utils/formatters';
import { Star, PlusCircle, Edit3, Trash2 } from 'lucide-react';

export function ReviewsListView() {
  const navigate = useNavigate();
  const reviews = useReviewStore((s) => s.reviews);
  const reviewsError = useReviewStore((s) => s.error);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);
  const deleteReview = useReviewStore((s) => s.deleteReview);
  const auctions = useAuctionStore((s) => s.auctions);
  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);
  const users = useAuthStore((s) => s.users);
  const fetchUsers = useAuthStore((s) => s.fetchUsers);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchReviews();
    fetchAuctions();
    fetchUsers();
  }, [fetchReviews, fetchAuctions, fetchUsers]);

  const isAdmin = currentUser?.role === 'admin';

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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Calificaciones y reputación"
        subtitle="Evaluaciones mutuas de 1 a 5 estrellas emitidas tras concretar el pago y entrega de las subastas cerradas (RN07)."
        action={
          <Button onClick={() => navigate('/reviews/new')}>
            <PlusCircle className="w-4 h-4" />
            Nueva Calificación
          </Button>
        }
      />

      {feedback && (
        <Alert type={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.text}
        </Alert>
      )}

      {!feedback && reviewsError && <Alert type="error">{reviewsError}</Alert>}

      {reviews.length === 0 ? (
        <Card className="text-center py-12 text-sm text-[#0D0D0D]/60">
          Aún no se han registrado calificaciones.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((rv) => {
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
              <Card key={rv.id} className="flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-4 h-4 ${
                            idx < Number(rv.rating)
                              ? 'text-[#224F10] fill-[#B0E454]'
                              : 'text-[#0D0D0D]/20'
                          }`}
                        />
                      ))}
                      <span className="ml-1.5 text-xs font-bold text-[#224F10]">
                        {rv.rating}.0 / 5.0
                      </span>
                    </div>
                    <Badge variant="default">
                      {rv.roleContext === 'comprador_a_vendedor'
                        ? 'Comprador → Vendedor'
                        : 'Vendedor → Comprador'}
                    </Badge>
                  </div>

                  <p className="font-serif-display text-xl italic text-[#0D0D0D]">
                    &ldquo;{rv.comment}&rdquo;
                  </p>

                  <div className="text-xs text-[#0D0D0D]/75 space-y-1 bg-white/80 p-3.5 rounded-2xl border border-[#224F10]/15">
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
                    <p>
                      Operación:{' '}
                      <Link
                        to={`/auctions/${rv.auctionId}`}
                        className="underline hover:text-[#224F10]"
                      >
                        {auction?.title ||
                          rv.auctionTitle ||
                          `Subasta #${rv.auctionId}`}
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#224F10]/15 text-xs text-[#0D0D0D]/55">
                  <span>{formatDateTime(rv.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <>
                        <Link to={`/reviews/${rv.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            <Edit3 className="w-3.5 h-3.5" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(rv)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
