import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBidStore } from '../states/bidStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import {
  Card,
  Input,
  Select,
  Button,
  PageHeader,
  Alert,
} from '../../core/design-system/ui';
import { formatCurrency } from '../../core/utils/formatters';
import { Gavel, ArrowLeft } from 'lucide-react';

export function BidCreateView() {
  const navigate = useNavigate();
  const createBid = useBidStore((s) => s.createBid);
  const auctions = useAuctionStore((s) => s.auctions);
  const currentUser = useAuthStore((s) => s.currentUser);

  const activeAuctions = auctions.filter((a) => a.status === 'activa');
  const firstAuction = activeAuctions[0];

  const [auctionId, setAuctionId] = useState(
    firstAuction ? String(firstAuction.id) : ''
  );
  const [amount, setAmount] = useState(
    firstAuction
      ? String(
          Number(firstAuction.currentPrice) + Number(firstAuction.minIncrement)
        )
      : ''
  );
  const [note, setNote] = useState('');
  const [commitment, setCommitment] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedAuction = auctions.find(
    (a) => Number(a.id) === Number(auctionId)
  );

  const handleAuctionChange = (e) => {
    const val = e.target.value;
    setAuctionId(val);
    const found = auctions.find((a) => Number(a.id) === Number(val));
    if (found) {
      setAmount(
        String(Number(found.currentPrice) + Number(found.minIncrement))
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await createBid({
        auctionId,
        bidderId: currentUser.id,
        amount,
        note,
        commitmentAccepted: commitment,
      });
      navigate('/bids');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Registrar Nueva Puja"
        subtitle="Emite una oferta vinculante sobre cualquiera de las subastas activas."
        action={
          <Button variant="outline" onClick={() => navigate('/bids')}>
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
            label="Seleccionar Subasta Activa *"
            value={auctionId}
            onChange={handleAuctionChange}
            options={activeAuctions.map((a) => ({
              value: String(a.id),
              label: `${a.title} (Actual: ${formatCurrency(a.currentPrice)})`,
            }))}
          />

          {selectedAuction && (
            <div className="p-3.5 rounded-xl bg-[#0D0D0D]/80 border border-[#224F10] text-xs space-y-1">
              <p>
                Precio actual:{' '}
                <strong className="text-[#B0E454]">
                  {formatCurrency(selectedAuction.currentPrice)}
                </strong>
              </p>
              <p>
                Incremento mínimo (RN01):{' '}
                <strong className="text-[#EAFFD0]">
                  {formatCurrency(selectedAuction.minIncrement)}
                </strong>
              </p>
              <p>
                Oferta mínima requerida:{' '}
                <strong className="text-[#B0E454]">
                  {formatCurrency(
                    Number(selectedAuction.currentPrice) +
                      Number(selectedAuction.minIncrement)
                  )}
                </strong>
              </p>
            </div>
          )}

          <Input
            id="amount"
            type="number"
            label="Monto a Ofertar (ARS) *"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Input
            id="note"
            label="Nota / Condición de Coordinación"
            placeholder="Ej: Pago por transferencia inmediata al liberarse el contacto."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <label className="flex items-start gap-2.5 text-xs text-[#EAFFD0]/80 cursor-pointer bg-[#0D0D0D]/60 p-3 rounded-xl border border-[#224F10]">
            <input
              type="checkbox"
              checked={commitment}
              onChange={(e) => setCommitment(e.target.checked)}
              className="mt-0.5 accent-[#B0E454]"
            />
            <span>
              Acepto la irrevocabilidad de la oferta (RN04) y me comprometo a concretar el pago directamente con el vendedor si resulto ganador.
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => navigate('/bids')}>
              Cancelar
            </Button>
            <Button type="submit">
              <Gavel className="w-4 h-4" />
              Confirmar Puja
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

