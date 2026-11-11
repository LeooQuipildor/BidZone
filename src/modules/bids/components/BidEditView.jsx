import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBidStore } from '../states/bidStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import { BidForm } from './BidForm';
import { findById, sameId } from '../../core/utils/formatters';
import {
  Button,
  Card,
  ErrorStateCard,
  PageHeader,
  Spinner,
} from '../../core/design-system/ui';
import { ArrowLeft } from 'lucide-react';

export function BidEditView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const bids = useBidStore((s) => s.bids);
  const bidsLoading = useBidStore((s) => s.loading);
  const fetchBids = useBidStore((s) => s.fetchBids);
  const updateBid = useBidStore((s) => s.updateBid);
  const auctions = useAuctionStore((s) => s.auctions);
  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    fetchBids();
    fetchAuctions();
  }, [fetchBids, fetchAuctions]);

  const bid = findById(bids, id);
  const isAdmin = currentUser?.role === 'admin';

  if (bidsLoading && !bid) return <Spinner label="Cargando puja..." />;

  if (!bid) {
    return (
      <ErrorStateCard
        title="Puja no encontrada"
        message="El registro de oferta solicitado no existe."
        buttonLabel="Volver a Pujas"
        onBack={() => navigate('/bids')}
      />
    );
  }

  const isBidderOwner = sameId(currentUser?.id, bid.bidderId);
  if (!isAdmin && !isBidderOwner) {
    return (
      <ErrorStateCard
        title="Sin permisos de edición"
        message="Solo el postor titular o un administrador puede modificar esta puja."
        buttonLabel="Volver a Pujas"
        onBack={() => navigate('/bids')}
      />
    );
  }

  const auction = findById(auctions, bid.auctionId);
  const auctionLabel = auction?.title || bid.auctionTitle || `#${bid.auctionId}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={`Editar Registro de Puja #${bid.id}`}
        subtitle={`Subasta asociada: ${auctionLabel}`}
        action={
          <Button variant="outline" onClick={() => navigate('/bids')}>
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
          </Button>
        }
      />

      <Card className="p-6">
        <BidForm
          key={bid.id}
          bid={bid}
          auctions={auctions}
          currentUserId={currentUser?.id}
          isAdmin={isAdmin}
          onUpdateBid={updateBid}
          onSaved={() => navigate('/bids')}
          onCancel={() => navigate('/bids')}
        />
      </Card>
    </div>
  );
}
