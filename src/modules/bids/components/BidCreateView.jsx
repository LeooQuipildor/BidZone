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
  Modal,
} from '../../core/design-system/ui';
import { formatCurrency } from '../../core/utils/formatters';
import { Gavel, ArrowLeft, CheckCircle2 } from 'lucide-react';

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleOpenConfirmation = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!selectedAuction) {
      setErrorMsg('Debes seleccionar una subasta activa.');
      return;
    }

    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Por favor ingresa un monto numérico válido para ofertar.');
      return;
    }

    const minAllowed =
      Number(selectedAuction.currentPrice) +
      Number(selectedAuction.minIncrement);
    if (numericAmount < minAllowed) {
      setErrorMsg(
        `RN01: La oferta debe ser de al menos ${formatCurrency(
          minAllowed
        )} (Precio actual + incremento mínimo).`
      );
      return;
    }

    if (!commitment) {
      setErrorMsg(
        'Debes aceptar el compromiso vinculante (RN04) antes de enviar tu oferta.'
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmBid = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await createBid({
        auctionId,
        bidderId: currentUser.id,
        amount,
        note,
        commitmentAccepted: commitment,
      });
      setShowConfirmModal(false);
      navigate('/bids');
    } catch (err) {
      setShowConfirmModal(false);
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {errorMsg && (
          <div className="mb-4">
            <Alert type="error" onClose={() => setErrorMsg('')}>
              {errorMsg}
            </Alert>
          </div>
        )}

        <form onSubmit={handleOpenConfirmation} className="space-y-4">
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
            <div className="p-4 rounded-2xl bg-white/80 border border-[#224F10]/20 text-xs space-y-1">
              <p>
                Precio actual:{' '}
                <strong className="text-[#224F10]">
                  {formatCurrency(selectedAuction.currentPrice)}
                </strong>
              </p>
              <p>
                Incremento mínimo (RN01):{' '}
                <strong className="text-[#0D0D0D]">
                  {formatCurrency(selectedAuction.minIncrement)}
                </strong>
              </p>
              <p>
                Oferta mínima requerida:{' '}
                <strong className="text-[#224F10]">
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

          <label className="flex items-start gap-2.5 text-xs text-[#0D0D0D]/80 cursor-pointer bg-[#B0E454]/25 p-3.5 rounded-2xl border border-[#224F10]/20">
            <input
              type="checkbox"
              checked={commitment}
              onChange={(e) => setCommitment(e.target.checked)}
              className="mt-0.5 accent-[#224F10]"
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
              Enviar Puja
            </Button>
          </div>
        </form>
      </Card>

      {/* Modal de Confirmación de Oferta */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        title="Confirmar oferta"
      >
        <div className="space-y-5">
          <div className="p-3.5 bg-[#B0E454]/30 rounded-2xl border border-[#224F10]/20 text-xs text-[#0D0D0D]">
            <p className="font-bold text-sm mb-1 text-[#224F10] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#224F10]" />
              Confirmar oferta
            </p>
            <p className="text-[#0D0D0D]/80">
              ¿Estás seguro de que deseas enviar esta puja? Por favor revisa el monto antes de confirmar, ya que las ofertas son vinculantes (RN04).
            </p>
          </div>

          <div className="bg-white/90 rounded-2xl p-4 sm:p-5 border border-[#224F10]/15 space-y-4">
            {selectedAuction && (
              <>
                <div className="flex flex-col gap-1 pb-3 border-b border-[#224F10]/10">
                  <span className="text-[10px] font-bold text-[#0D0D0D]/55 uppercase tracking-wider">
                    Artículo / Subasta
                  </span>
                  <span className="text-sm font-semibold text-[#0D0D0D] line-clamp-2">
                    {selectedAuction.title}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#224F10]/10 text-xs">
                  <div>
                    <span className="text-[11px] text-[#0D0D0D]/55 block">
                      Oferta líder actual
                    </span>
                    <strong className="text-sm font-semibold text-[#0D0D0D]">
                      {formatCurrency(selectedAuction.currentPrice)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#0D0D0D]/55 block">
                      Incremento mínimo
                    </span>
                    <strong className="text-sm font-semibold text-[#224F10]">
                      +{formatCurrency(selectedAuction.minIncrement)}
                    </strong>
                  </div>
                </div>
              </>
            )}

            {/* Cuadro destacado del monto ofertado */}
            <div className="bg-[#EAFFD0] p-4 rounded-2xl border-2 border-[#224F10]/30 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#224F10] block mb-1">
                Monto que estás ofertando:
              </span>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-serif-display text-3xl sm:text-4xl font-extrabold text-[#224F10]">
                  {formatCurrency(amount)}
                </span>
                {selectedAuction && (
                  <span className="text-[11px] font-medium text-[#224F10]/80">
                    +{formatCurrency(Number(amount) - Number(selectedAuction.currentPrice))} vs actual
                  </span>
                )}
              </div>
            </div>

            {note && (
              <div className="text-xs text-[#0D0D0D]/80 pt-1">
                <span className="font-semibold block text-[#0D0D0D]">
                  Nota de coordinación:
                </span>
                <p className="italic bg-[#F5FFEB] p-2.5 rounded-xl border border-[#224F10]/10 mt-1">
                  &ldquo;{note}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-1">
            <Button
              variant="outline"
              size="md"
              disabled={isSubmitting}
              onClick={() => setShowConfirmModal(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={isSubmitting}
              onClick={handleConfirmBid}
              className="w-full sm:w-auto"
            >
              <Gavel className="w-4 h-4" />
              {isSubmitting ? 'Enviando...' : 'Confirmar oferta'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
