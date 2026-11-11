import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReviewStore } from '../states/reviewStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import { findById, sameId } from '../../core/utils/formatters';
import { getReviewDefaults } from '../../core/components/dashboard/dashboardHelpers';
import {
  Card,
  Select,
  Textarea,
  Button,
  PageHeader,
  Alert,
  Spinner,
} from '../../core/design-system/ui';
import { Star, ArrowLeft } from 'lucide-react';

const RATING_OPTIONS = [
  { value: '5', label: '★★★★★ (5) — Excelente cumplimiento y trato' },
  { value: '4', label: '★★★★☆ (4) — Muy buena coordinación' },
  { value: '3', label: '★★★☆☆ (3) — Cumplió con demoras' },
  { value: '2', label: '★★☆☆☆ (2) — Dificultades en el acuerdo' },
  { value: '1', label: '★☆☆☆☆ (1) — Mala experiencia' },
];

export function ReviewCreateView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAuctionId = searchParams.get('auctionId') || '';

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
  const eligibleAuctions = useMemo(() => {
    return auctions.filter((a) => {
      if (a.status !== 'finalizada' || !a.winnerId) {
        return false;
      }
      if (isAdmin) {
        return true;
      }
      return (
        sameId(a.winnerId, currentUser?.id) ||
        sameId(a.sellerId, currentUser?.id)
      );
    });
  }, [auctions, isAdmin, currentUser?.id]);

  const otherUsers = useMemo(
    () => users.filter((u) => !sameId(u.id, currentUser?.id)),
    [users, currentUser?.id]
  );

  const [formData, setFormData] = useState({
    auctionId: preselectedAuctionId,
    targetUserId: '',
    rating: '5',
    roleContext: '',
    comment: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const selectedAuction =
    findById(eligibleAuctions, formData.auctionId) ||
    eligibleAuctions[0] ||
    null;

  const effectiveAuctionId = selectedAuction ? String(selectedAuction.id) : '';
  const defaultTarget = getReviewDefaults(
    selectedAuction,
    currentUser?.id,
    otherUsers
  );
  const effectiveTargetUserId =
    formData.targetUserId || defaultTarget.targetUserId;
  const effectiveRoleContext =
    formData.roleContext || defaultTarget.roleContext;

  const isSelectedParticipant = Boolean(
    selectedAuction &&
      (sameId(selectedAuction.winnerId, currentUser?.id) ||
        sameId(selectedAuction.sellerId, currentUser?.id))
  );

  function handleChange(e) {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;

    if (fieldName === 'auctionId') {
      const nextAuction = findById(eligibleAuctions, fieldValue);
      const nextDefaults = getReviewDefaults(
        nextAuction,
        currentUser?.id,
        otherUsers
      );
      setFormData((prev) => ({
        ...prev,
        auctionId: fieldValue,
        targetUserId: nextDefaults.targetUserId,
        roleContext: nextDefaults.roleContext,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [fieldName]: fieldValue }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!effectiveAuctionId) {
      setErrorMsg('Debes seleccionar una subasta finalizada elegible.');
      return;
    }

    if (!formData.comment.trim()) {
      setErrorMsg('Por favor escribe un breve comentario sobre la experiencia.');
      return;
    }

    try {
      await createReview({
        auctionId: effectiveAuctionId,
        targetUserId: effectiveTargetUserId,
        rating: Number(formData.rating),
        roleContext: effectiveRoleContext,
        comment: formData.comment.trim(),
      });
      navigate('/reviews');
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  const auctionOptions = eligibleAuctions.map((a) => {
    const alreadyReviewed = reviews.some(
      (rv) =>
        sameId(rv.auctionId, a.id) && sameId(rv.reviewerId, currentUser?.id)
    );
    const suffix = alreadyReviewed ? ' (Ya calificada)' : '';
    return {
      value: String(a.id),
      label: `#${a.id} — ${a.title}${suffix}`,
    };
  });

  const targetUserOptions =
    otherUsers.length > 0
      ? otherUsers.map((u) => ({
          value: String(u.id),
          label: u.email
            ? `${u.name} (${u.email})`
            : `${u.name} (${u.city || 'Socio BidZone'})`,
        }))
      : [{ value: '', label: 'Sin contraparte disponible' }];

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
        ) : eligibleAuctions.length === 0 ? (
          <Alert type="info" title="Sin operaciones calificables aún">
            Solo puedes calificar subastas finalizadas con ganador adjudicado en
            las que hayas participado como vendedor o comprador ganador (RN07).
          </Alert>
        ) : (
          <>
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
                value={effectiveAuctionId}
                onChange={handleChange}
                options={auctionOptions}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  id="targetUserId"
                  name="targetUserId"
                  label="Usuario a Calificar *"
                  disabled={!isAdmin && isSelectedParticipant}
                  value={effectiveTargetUserId}
                  onChange={handleChange}
                  options={targetUserOptions}
                />
                <Select
                  id="roleContext"
                  name="roleContext"
                  label="Tu Rol en la Operación"
                  disabled={!isAdmin && isSelectedParticipant}
                  value={effectiveRoleContext}
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
                options={RATING_OPTIONS}
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
          </>
        )}
      </Card>
    </div>
  );
}
