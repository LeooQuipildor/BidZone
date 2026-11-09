import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReviewStore } from '../states/reviewStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import {
  Card,
  Select,
  Textarea,
  Button,
  PageHeader,
  Alert,
} from '../../core/design-system/ui';
import { Star, ArrowLeft } from 'lucide-react';

export function ReviewCreateView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAuctionId = searchParams.get('auctionId') || '';

  const createReview = useReviewStore((s) => s.createReview);
  const auctions = useAuctionStore((s) => s.auctions);
  const users = useAuthStore((s) => s.users);
  const currentUser = useAuthStore((s) => s.currentUser);

  const closedAuctions = auctions.filter((a) => a.status === 'finalizada');
  const initialAuction =
    closedAuctions.find(
      (a) => String(a.id) === String(preselectedAuctionId)
    ) || closedAuctions[0];

  const otherUsers = users.filter(
    (u) => Number(u.id) !== Number(currentUser?.id)
  );

  const [formData, setFormData] = useState({
    auctionId: initialAuction ? String(initialAuction.id) : '',
    targetUserId: otherUsers[0] ? String(otherUsers[0].id) : '',
    rating: '5',
    roleContext: 'comprador_a_vendedor',
    comment: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.comment.trim()) {
      setErrorMsg('Por favor escribe un breve comentario sobre la experiencia.');
      return;
    }

    try {
      await createReview({
        ...formData,
        reviewerId: currentUser.id,
      });
      navigate('/reviews');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

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
        {errorMsg && (
          <div className="mb-4">
            <Alert type="error" onClose={() => setErrorMsg('')}>
              {errorMsg}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            id="auctionId"
            name="auctionId"
            label="Subasta Finalizada *"
            value={formData.auctionId}
            onChange={handleChange}
            options={closedAuctions.map((a) => ({
              value: String(a.id),
              label: `#${a.id} — ${a.title}`,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="targetUserId"
              name="targetUserId"
              label="Usuario a Calificar *"
              value={formData.targetUserId}
              onChange={handleChange}
              options={otherUsers.map((u) => ({
                value: String(u.id),
                label: `${u.name} (${u.email})`,
              }))}
            />
            <Select
              id="roleContext"
              name="roleContext"
              label="Tu Rol en la Operación"
              value={formData.roleContext}
              onChange={handleChange}
              options={[
                {
                  value: 'comprador_a_vendedor',
                  label: 'Soy Comprador (Califico al Vendedor)',
                },
                {
                  value: 'vendedor_a_comprador',
                  label: 'Soy Vendedor (Califico al Ganador)',
                },
              ]}
            />
          </div>

          <Select
            id="rating"
            name="rating"
            label="Puntuación (1 a 5 Estrellas) *"
            value={formData.rating}
            onChange={handleChange}
            options={[
              { value: '5', label: '★★★★★ (5) — Excelente cumplimiento y trato' },
              { value: '4', label: '★★★★☆ (4) — Muy buena coordinación' },
              { value: '3', label: '★★★☆☆ (3) — Cumplió con demoras' },
              { value: '2', label: '★★☆☆☆ (2) — Dificultades en el acuerdo' },
              { value: '1', label: '★☆☆☆☆ (1) — Mala experiencia' },
            ]}
          />

          <Textarea
            id="comment"
            name="comment"
            label="Reseña sobre el Pago y Entrega *"
            placeholder="Cuenta cómo fue la comunicación telefónica, el pago y el retiro del producto..."
            value={formData.comment}
            onChange={handleChange}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => navigate('/reviews')}>
              Cancelar
            </Button>
            <Button type="submit">
              <Star className="w-4 h-4" />
              Publicar Calificación
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

