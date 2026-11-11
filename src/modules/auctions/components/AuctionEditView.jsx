import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuctionStore } from '../states/auctionStore';
import { useBidStore } from '../../bids/states/bidStore';
import { useAuthStore } from '../../auth/states/authStore';
import { AuctionForm } from './AuctionForm';
import { findById, sameId } from '../../core/utils/formatters';
import {
  Button,
  Card,
  ErrorStateCard,
  PageHeader,
  Spinner,
} from '../../core/design-system/ui';
import { ArrowLeft } from 'lucide-react';

export function AuctionEditView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const auctions = useAuctionStore((s) => s.auctions);
  const currentAuctionDetail = useAuctionStore((s) => s.currentAuctionDetail);
  const detailLoading = useAuctionStore((s) => s.detailLoading);
  const fetchAuctionById = useAuctionStore((s) => s.fetchAuctionById);
  const updateAuction = useAuctionStore((s) => s.updateAuction);
  const bids = useBidStore((s) => s.bids);
  const fetchBids = useBidStore((s) => s.fetchBids);
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    fetchAuctionById(id);
    fetchBids();
  }, [id, fetchAuctionById, fetchBids]);

  const auction =
    currentAuctionDetail && sameId(currentAuctionDetail.id, id)
      ? currentAuctionDetail
      : findById(auctions, id);

  if (detailLoading && !auction) {
    return <Spinner label="Cargando subasta..." />;
  }

  if (!auction) {
    return (
      <ErrorStateCard
        title="Subasta no encontrada"
        message="La subasta que intentas editar no existe."
        buttonLabel="Volver al catálogo"
        onBack={() => navigate('/auctions')}
      />
    );
  }

  const isAdmin = currentUser?.role === 'admin';
  const isOwner = sameId(currentUser?.id, auction.sellerId);

  if (!isAdmin && !isOwner) {
    return (
      <ErrorStateCard
        title="Sin permisos de edición"
        message="Solo el vendedor propietario o un administrador puede editar esta subasta."
        buttonLabel="Volver al detalle"
        onBack={() => navigate(`/auctions/${auction.id}`)}
      />
    );
  }

  const hasBids =
    Number(auction.bidCount || 0) > 0 ||
    (Array.isArray(auction.bids) && auction.bids.length > 0) ||
    bids.some((b) => sameId(b.auctionId, id));

  async function handleUpdate(payload) {
    await updateAuction(auction.id, payload);
    navigate(`/auctions/${auction.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={`Editar Subasta #${auction.id}`}
        subtitle="Actualiza la información del artículo o las condiciones de la publicación."
        action={
          <Button variant="outline" onClick={() => navigate(`/auctions/${auction.id}`)}>
            <ArrowLeft className="w-4 h-4" />
            Volver al detalle
          </Button>
        }
      />

      <Card className="p-6">
        <AuctionForm
          key={`${auction.id}-${auction.updatedAt || auction.endTime}`}
          auction={auction}
          hasBids={hasBids}
          isAdmin={isAdmin}
          onSubmitForm={handleUpdate}
          onCancel={() => navigate(`/auctions/${auction.id}`)}
        />
      </Card>
    </div>
  );
}
