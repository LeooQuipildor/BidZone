import React, { useState } from 'react';
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
} from '../../core/design-system/ui';
import { Save, ArrowLeft } from 'lucide-react';

export function BidEditView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const bids = useBidStore((s) => s.bids);
  const updateBid = useBidStore((s) => s.updateBid);
  const auctions = useAuctionStore((s) => s.auctions);
  const currentUser = useAuthStore((s) => s.currentUser);

  const bid = bids.find((b) => Number(b.id) === Number(id));
  const isAdmin = currentUser?.role === 'admin';

  const [amount, setAmount] = useState(() => (bid ? String(bid.amount) : ''));
  const [note, setNote] = useState(() => bid?.note || '');
  const [errorMsg, setErrorMsg] = useState('');

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

  const auction = auctions.find(
    (a) => Number(a.id) === Number(bid.auctionId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await updateBid(bid.id, {
        amount: isAdmin ? Number(amount) : bid.amount,
        note: note.trim(),
      });
      navigate('/bids');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={`Editar Registro de Puja #${bid.id}`}
        subtitle={`Subasta asociada: ${auction?.title || `#${bid.auctionId}`}`}
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
            helperText={
              isAdmin
                ? 'Modo Administrador: Puedes ajustar el importe por auditoría.'
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

