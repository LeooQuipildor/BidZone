import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuctionStore } from '../states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import { AuctionForm } from './AuctionForm';
import { Button, Card, PageHeader } from '../../core/design-system/ui';
import { ArrowLeft } from 'lucide-react';

export function AuctionCreateView() {
  const navigate = useNavigate();
  const createAuction = useAuctionStore((s) => s.createAuction);
  const currentUser = useAuthStore((s) => s.currentUser);

  async function handleCreate(payload) {
    const created = await createAuction({ ...payload, sellerId: currentUser.id });
    navigate(`/auctions/${created.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Publicar Nueva Subasta"
        subtitle="Define las condiciones de subasta. Al finalizar con ganador, se liberarán mutuamente los datos de contacto."
        action={
          <Button variant="outline" onClick={() => navigate('/auctions')}>
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </Button>
        }
      />

      <Card className="p-6">
        <AuctionForm
          onSubmitForm={handleCreate}
          onCancel={() => navigate('/auctions')}
          submitLabel="Publicar Subasta"
        />
      </Card>
    </div>
  );
}
