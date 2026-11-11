import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReviewStore } from '../states/reviewStore';
import { useAuthStore } from '../../auth/states/authStore';
import { findById, sameId } from '../../core/utils/formatters';
import { ReviewForm } from './ReviewForm';
import {
  Button,
  Card,
  ErrorStateCard,
  PageHeader,
  Spinner,
} from '../../core/design-system/ui';
import { ArrowLeft } from 'lucide-react';

export function ReviewEditView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const reviews = useReviewStore((s) => s.reviews);
  const reviewsLoading = useReviewStore((s) => s.loading);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);
  const updateReview = useReviewStore((s) => s.updateReview);
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const review = findById(reviews, id);
  const isAdmin = currentUser?.role === 'admin';

  if (reviewsLoading && !review) return <Spinner label="Cargando calificación..." />;

  if (!review) {
    return (
      <ErrorStateCard
        title="Calificación no encontrada"
        message="El registro solicitado no existe."
        buttonLabel="Volver a Calificaciones"
        onBack={() => navigate('/reviews')}
      />
    );
  }

  const isReviewAuthor = sameId(currentUser?.id, review.reviewerId);
  if (!isAdmin && !isReviewAuthor) {
    return (
      <ErrorStateCard
        title="Sin permisos de edición"
        message="Solo el autor de la reseña o un administrador puede modificarla."
        buttonLabel="Volver a Calificaciones"
        onBack={() => navigate('/reviews')}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={`Editar Calificación #${review.id}`}
        subtitle="Modifica la puntuación o el comentario asociado a esta operación."
        action={
          <Button variant="outline" onClick={() => navigate('/reviews')}>
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
          </Button>
        }
      />

      <Card className="p-6">
        <ReviewForm
          key={`${review.id}-${review.updatedAt || review.rating}`}
          review={review}
          onUpdateReview={updateReview}
          onSaved={() => navigate('/reviews')}
          onCancel={() => navigate('/reviews')}
        />
      </Card>
    </div>
  );
}
