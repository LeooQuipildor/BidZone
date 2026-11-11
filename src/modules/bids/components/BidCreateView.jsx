import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBidStore } from '../states/bidStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import { BidForm } from './BidForm';
import { Button, Card, PageHeader, Spinner } from '../../core/design-system/ui';
import { ArrowLeft } from 'lucide-react';

export function BidCreateView() {
  const navigate = useNavigate();
  const createBid = useBidStore((s) => s.createBid);
  const auctions = useAuctionStore((s) => s.auctions);
  const auctionsLoading = useAuctionStore((s) => s.loading);
  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Registrar nueva puja"
        subtitle="Emite una oferta vinculante sobre cualquiera de las subastas activas."
        action={
          <Button variant="outline" onClick={() => navigate('/bids')}>
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
          </Button>
        }
      />

      <Card className="p-6 sm:p-8 rounded-3xl">
        {auctionsLoading && auctions.length === 0 ? (
          <Spinner label="Cargando subastas activas..." />
        ) : (
          <BidForm
            auctions={auctions}
            currentUserId={currentUser?.id}
            onCreateBid={createBid}
            onSaved={() => navigate('/bids')}
            onCancel={() => navigate('/bids')}
          />
        )}
      </Card>
    </div>
  );
}
