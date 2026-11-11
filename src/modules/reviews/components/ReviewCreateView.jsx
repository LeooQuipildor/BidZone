import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReviewStore } from '../states/reviewStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import { sameId } from '../../core/utils/formatters';
import { ReviewForm } from './ReviewForm';
import { Button, Card, PageHeader, Spinner } from '../../core/design-system/ui';
import { ArrowLeft } from 'lucide-react';

export function ReviewCreateView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAuctionId = searchParams.get('auctionId') || '';

  const reviews = useReviewStore((s) => s.reviews);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);
  const createReview = useReviewStore((s) => s.createReview);
  const auctions = useAuctionStore((s) => s.auctions);
  const auctionsLoading = useAuctionStore((s) => s.loading);
  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);
  const users = useAuthStore((s) => s.users);
  const fetchUsers = useAuthStore((s) => s.fetchUsers);
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    fetchAuctions();
    fetchUsers();
    fetchReviews();
  }, [fetchAuctions, fetchUsers, fetchReviews]);

  const isAdmin = currentUser?.role === 'admin';

  // Solo se pueden calificar subastas finalizadas donde participó el usuario (o todas si es admin)
  const eligibleAuctions = auctions.filter((a) => {
    if (a.status !== 'finalizada' || !a.winnerId) return false;
    return isAdmin || sameId(a.winnerId, currentUser?.id) || sameId(a.sellerId, currentUser?.id);
  });
  const otherUsers = users.filter((u) => !sameId(u.id, currentUser?.id));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Emitir Calificación (RN07)"
        subtitle="Califica de 1 a 5 estrellas a tu contraparte luego de finalizar la subasta y coordinar la entrega."
        action={
          <Button variant="outline" onClick={() => navigate('/reviews')}>
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
          </Button>
        }
      />

      <Card className="p-6">
        {auctionsLoading && auctions.length === 0 ? (
          <Spinner label="Cargando operaciones calificables..." />
        ) : (
          <ReviewForm
            eligibleAuctions={eligibleAuctions}
            otherUsers={otherUsers}
            reviews={reviews}
            currentUserId={currentUser?.id}
            isAdmin={isAdmin}
            initialAuctionId={initialAuctionId}
            onCreateReview={createReview}
            onSaved={() => navigate('/reviews')}
            onCancel={() => navigate('/reviews')}
          />
        )}
      </Card>
    </div>
  );
}
