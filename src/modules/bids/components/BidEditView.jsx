import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBidStore } from '../states/bidStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import {
  Card,
  Input,
  Button,
  PageHeader,
  Alert,
  Spinner,
} from '../../core/design-system/ui';
import { formatCurrency } from '../../core/utils/formatters';
import { Save, ArrowLeft } from 'lucide-react';

function BidEditForm({ bid, auction, isAdmin, updateBid, navigate }) {
  const [amount, setAmount] = useState(String(bid.amount ?? ''));
  const [note, setNote] = useState(bid.note || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const payload = isAdmin
      ? { amount: Number(amount), note: note.trim() }
      : { note: note.trim() };

    try {
      await updateBid(bid.id, payload);
      navigate('/bids');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={`Editar Registro de Puja #${bid.id}`}
        subtitle={`Subasta asociada: ${
          auction?.title || bid.auctionTitle || `#${bid.auctionId}`
        }`}
        action={
          <Button variant="outline" onClick={() => navigate('/bids')}>
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
          </Button>
        }
      />

      {!isAdmin && (
        <Alert type="info" title="Regla de Negocio RN04 (Irrevocabilidad del Monto)">
          Como postor puedes actualizar tu nota de coordinación/entrega, pero el importe económico ofertado es vinculante e irrevocable.
        </Alert>
      )}

      <Card className="p-6">
        {errorMsg && (
          <div className="mb-4">
            <Alert type="error" onClose={() => setErrorMsg('')}>
              {errorMsg}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="amount"
            type="number"
            label="Importe de la Puja (ARS)"
            disabled={!isAdmin}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            max={
              auction
                ? Number(auction.basePrice || auction.currentPrice) * 10
                : undefined
            }
            helperText={
              isAdmin
                ? `Modo Administrador: Puedes ajustar el importe por auditoría (Máximo 10x precio inicial: ${formatCurrency(
                    Number(auction?.basePrice || auction?.currentPrice || 0) * 10
                  )}).`
                : 'El importe no puede reducirse ni anularse por parte del postor.'
            }
          />

          <Input
            id="note"
            label="Nota de Coordinación / Observación *"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => navigate('/bids')}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4" />
              Guardar Actualización
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

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

  const bid = bids.find((b) => Number(b.id) === Number(id));
  const isAdmin = currentUser?.role === 'admin';

  if (bidsLoading && !bid) {
    return <Spinner label="Cargando puja..." />;
  }

  if (!bid) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Alert type="error" title="Puja no encontrada">
          El registro de oferta solicitado no existe.
        </Alert>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/bids')}
        >
          Volver a Pujas
        </Button>
      </div>
    );
  }

  if (!isAdmin && Number(currentUser?.id) !== Number(bid.bidderId)) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Alert type="error" title="Sin permisos de edición">
          Solo el postor titular o un administrador puede modificar esta puja.
        </Alert>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/bids')}
        >
          Volver a Pujas
        </Button>
      </div>
    );
  }

  const auction = auctions.find(
    (a) => Number(a.id) === Number(bid.auctionId)
  );

  return (
    <BidEditForm
      key={bid.id}
      bid={bid}
      auction={auction}
      isAdmin={isAdmin}
      updateBid={updateBid}
      navigate={navigate}
    />
  );
}

