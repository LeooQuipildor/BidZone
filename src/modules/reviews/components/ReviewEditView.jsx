import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReviewStore } from '../states/reviewStore';
import { useAuthStore } from '../../auth/states/authStore';
import {
  Card,
  Select,
  Textarea,
  Button,
  PageHeader,
  Alert,
  Spinner,
} from '../../core/design-system/ui';
import { Save, ArrowLeft } from 'lucide-react';

function ReviewEditForm({ review, updateReview, navigate }) {
  const [rating, setRating] = useState(String(review.rating ?? '5'));
  const [comment, setComment] = useState(review.comment || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!comment.trim()) {
      setErrorMsg('El comentario no puede estar vacío.');
      return;
    }

    try {
      await updateReview(review.id, {
        rating: Number(rating),
        comment: comment.trim(),
      });
      navigate('/reviews');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

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
        {errorMsg && (
          <div className="mb-4">
            <Alert type="error" onClose={() => setErrorMsg('')}>
              {errorMsg}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            id="rating"
            label="Puntuación (1 a 5 Estrellas) *"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            options={[
              { value: '5', label: '★★★★★ (5) — Excelente' },
              { value: '4', label: '★★★★☆ (4) — Muy buena' },
              { value: '3', label: '★★★☆☆ (3) — Regular' },
              { value: '2', label: '★★☆☆☆ (2) — Deficiente' },
              { value: '1', label: '★☆☆☆☆ (1) — Incumplimiento' },
            ]}
          />

          <Textarea
            id="comment"
            label="Comentario de la Reseña *"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => navigate('/reviews')}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

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

  const review = reviews.find((rv) => Number(rv.id) === Number(id));
  const isAdmin = currentUser?.role === 'admin';

  if (reviewsLoading && !review) {
    return <Spinner label="Cargando calificación..." />;
  }

  if (!review) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Alert type="error" title="Calificación no encontrada">
          El registro solicitado no existe.
        </Alert>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/reviews')}
        >
          Volver a Calificaciones
        </Button>
      </div>
    );
  }

  if (!isAdmin && Number(currentUser?.id) !== Number(review.reviewerId)) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Alert type="error" title="Sin permisos de edición">
          Solo el autor de la reseña o un administrador puede modificarla.
        </Alert>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/reviews')}
        >
          Volver a Calificaciones
        </Button>
      </div>
    );
  }

  return (
    <ReviewEditForm
      key={`${review.id}-${review.updatedAt || review.rating}`}
      review={review}
      updateReview={updateReview}
      navigate={navigate}
    />
  );
}

