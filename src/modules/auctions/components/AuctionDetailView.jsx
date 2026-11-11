import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuctionStore } from '../states/auctionStore';
import { useBidStore } from '../../bids/states/bidStore';
import { useAuthStore } from '../../auth/states/authStore';
import {
  Card,
  Button,
  Badge,
  Input,
  Alert,
  Modal,
  Spinner,
} from '../../core/design-system/ui';
import {
  DEFAULT_AUCTION_IMAGE_URL,
  formatCurrency,
  formatDateTime,
  getRemainingTime,
} from '../../core/utils/formatters';
import {
  Gavel,
  Clock,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  AlertOctagon,
  Star,
  ArrowLeft,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export function AuctionDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const auctions = useAuctionStore((s) => s.auctions);
  const currentAuctionDetail = useAuctionStore((s) => s.currentAuctionDetail);
  const detailLoading = useAuctionStore((s) => s.detailLoading);
  const storeError = useAuctionStore((s) => s.error);
  const fetchAuctionById = useAuctionStore((s) => s.fetchAuctionById);
  const closeAuctionNow = useAuctionStore((s) => s.closeAuctionNow);

  const bids = useBidStore((s) => s.bids);
  const createBid = useBidStore((s) => s.createBid);
  const currentUser = useAuthStore((s) => s.currentUser);
  const users = useAuthStore((s) => s.users);

  useEffect(() => {
    fetchAuctionById(id);
  }, [id, currentUser?.id, fetchAuctionById]);

  const detailAuction =
    currentAuctionDetail && Number(currentAuctionDetail.id) === Number(id)
      ? currentAuctionDetail
      : null;

  const auction =
    detailAuction || auctions.find((a) => Number(a.id) === Number(id));

  const [nowMs, setNowMs] = useState(() => Date.now());
  const [bidDraft, setBidDraft] = useState({ auctionId: null, value: '' });
  const [bidNote, setBidNote] = useState('');
  const [commitment, setCommitment] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const endTime = auction?.endTime;
  const auctionStatus = auction?.status;

  useEffect(() => {
    if (!endTime || auctionStatus !== 'activa') return;
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime, auctionStatus]);

  const remaining = endTime
    ? getRemainingTime(endTime, nowMs)
    : { formatted: '—' };

  const defaultBidAmount = auction
    ? String(Number(auction.currentPrice) + Number(auction.minIncrement))
    : '';
  const bidAmount =
    bidDraft.auctionId === String(id) ? bidDraft.value : defaultBidAmount;

  if (detailLoading && !auction) {
    return <Spinner label="Cargando subasta..." />;
  }

  if (!auction) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Alert type="error" title="Subasta no encontrada">
          {storeError || 'El artículo que buscas no existe o fue eliminado.'}
        </Alert>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/auctions')}
        >
          Volver al catálogo
        </Button>
      </div>
    );
  }

  const auctionBids = (
    Array.isArray(detailAuction?.bids)
      ? detailAuction.bids
      : bids.filter((b) => Number(b.auctionId) === Number(auction.id))
  )
    .slice()
    .sort((a, b) => Number(b.amount) - Number(a.amount));

  const topBid = auctionBids[0];
  const seller =
    detailAuction?.seller ||
    users.find((u) => Number(u.id) === Number(auction.sellerId)) || {
      id: auction.sellerId,
      name: auction.sellerName || 'Vendedor',
      city: auction.sellerCity || '',
      reputation: auction.sellerReputation || 5.0,
    };

  const winner =
    detailAuction?.winner ||
    (auction.winnerId
      ? users.find((u) => Number(u.id) === Number(auction.winnerId)) || {
          id: auction.winnerId,
          name: auction.winnerName || 'Ganador',
        }
      : null);

  const isSeller =
    currentUser && Number(currentUser.id) === Number(auction.sellerId);
  const isAdmin = currentUser?.role === 'admin';
  const isLeader =
    currentUser && topBid && Number(topBid.bidderId) === Number(currentUser.id);
  const hasParticipated =
    currentUser &&
    auctionBids.some((b) => Number(b.bidderId) === Number(currentUser.id));

  const canSeeUnlockedContact = detailAuction
    ? Boolean(detailAuction.contactUnlocked)
    : Boolean(
        auction.status === 'finalizada' &&
          winner &&
          currentUser &&
          (isSeller ||
            Number(currentUser.id) === Number(winner.id) ||
            isAdmin)
      );

  const counterpartUserId = isSeller ? winner?.id : seller?.id;

  const handleOpenConfirmation = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentUser) {
      navigate('/login');
      return;
    }

    const numericAmount = Number(bidAmount);
    if (!bidAmount || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Por favor ingresa un monto numérico válido para ofertar.');
      return;
    }

    const minAllowed =
      Number(auction.currentPrice) + Number(auction.minIncrement);
    if (numericAmount < minAllowed) {
      setErrorMsg(
        `RN01: La oferta debe ser de al menos ${formatCurrency(
          minAllowed
        )} (Precio actual + incremento mínimo).`
      );
      return;
    }

    const initialPrice = Number(auction.basePrice || auction.currentPrice);
    const maxAllowed = initialPrice * 10;
    if (numericAmount > maxAllowed) {
      setErrorMsg(
        `La oferta no puede superar 10 veces el precio inicial de la subasta (${formatCurrency(maxAllowed)}).`
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
    setSuccessMsg('');
    const confirmedAmount = bidAmount;
    try {
      await createBid({
        auctionId: auction.id,
        bidderId: currentUser.id,
        amount: confirmedAmount,
        note: bidNote,
        commitmentAccepted: commitment,
      });
      setShowConfirmModal(false);
      setSuccessMsg(
        `¡Tu oferta de ${formatCurrency(
          confirmedAmount
        )} fue registrada exitosamente! Ahora eres el postor líder.`
      );
      setBidDraft({ auctionId: null, value: '' });
      setBidNote('');
    } catch (err) {
      setShowConfirmModal(false);
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseNow = async () => {
    const confirmed = window.confirm(
      '¿Deseas finalizar la subasta ahora mismo? Se adjudicará al postor líder y se liberarán los datos de contacto entre ambas partes.'
    );
    if (!confirmed) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await closeAuctionNow(auction.id);
      setSuccessMsg(
        'Subasta finalizada. Se han liberado los datos de contacto entre el vendedor y el ganador.'
      );
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/auctions')}>
          <ArrowLeft className="w-4 h-4" />
          Volver al Catálogo
        </Button>

        <div className="flex items-center gap-2">
          {(isSeller || isAdmin) && auction.status === 'activa' && (
            <Button variant="secondary" size="sm" onClick={handleCloseNow}>
              <CheckCircle2 className="w-4 h-4" />
              Finalizar y Adjudicar Ahora
            </Button>
          )}
          {(isSeller || isAdmin) && (
            <Link to={`/auctions/${auction.id}/edit`}>
              <Button variant="outline" size="sm">
                Editar Subasta
              </Button>
            </Link>
          )}
        </div>
      </div>

      {errorMsg && (
        <Alert type="error" onClose={() => setErrorMsg('')}>
          {errorMsg}
        </Alert>
      )}
      {successMsg && (
        <Alert type="success" onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {/* Bloque Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna Izquierda: Producto */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-[#F5FFEB] border border-[#224F10]/15 overflow-hidden shadow-xs">
            <div className="relative h-80 sm:h-96 bg-white">
              <img
                src={auction.imageUrl || DEFAULT_AUCTION_IMAGE_URL}
                alt={auction.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="lime">{auction.category}</Badge>
                <Badge
                  variant={auction.status === 'activa' ? 'success' : 'dark'}
                >
                  {auction.status === 'activa'
                    ? 'Subasta en Vivo'
                    : auction.status === 'cancelada'
                      ? 'Cancelada'
                      : 'Subasta Finalizada'}
                </Badge>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <h1 className="font-serif-display text-3xl sm:text-5xl text-[#0D0D0D] leading-tight">
                {auction.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#0D0D0D]/75 leading-relaxed">
                {auction.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#224F10]/15 text-xs">
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#224F10]/15">
                  <span className="text-[11px] text-[#0D0D0D]/55 block">
                    Precio Base
                  </span>
                  <strong className="font-serif-display text-2xl text-[#0D0D0D]">
                    {formatCurrency(auction.basePrice)}
                  </strong>
                </div>
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#224F10]/15">
                  <span className="text-[11px] text-[#0D0D0D]/55 block">
                    Incremento Mín. (RN01)
                  </span>
                  <strong className="font-serif-display text-2xl text-[#224F10]">
                    + {formatCurrency(auction.minIncrement)}
                  </strong>
                </div>
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#224F10]/15">
                  <span className="text-[11px] text-[#0D0D0D]/55 block">
                    Dueño / Vendedor
                  </span>
                  <strong className="text-sm font-semibold text-[#0D0D0D] block mt-1">
                    {seller?.name || 'Usuario'} ({seller?.reputation || '5.0'} ★)
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* RN05: Tarjeta de Liberación de Datos de Contacto tras Cierre */}
          {auction.status === 'finalizada' && (
            <div className="rounded-3xl bg-[#0D0D0D] text-[#EAFFD0] p-6 sm:p-8 shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-[#EAFFD0]/15 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#B0E454]" />
                  <h2 className="font-serif-display text-2xl sm:text-3xl text-[#EAFFD0]">
                    Coordinación directa liberada (RN05 / RN06)
                  </h2>
                </div>
                <Badge variant="lime">{winner ? 'Adjudicada' : 'Cerrada'}</Badge>
              </div>

              {!winner ? (
                <p className="text-sm text-[#EAFFD0]/80">
                  Esta subasta finalizó sin recibir ofertas.
                </p>
              ) : canSeeUnlockedContact ? (
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-[#EAFFD0]/85 leading-relaxed">
                    ¡Felicitaciones! Como parte involucrada en la adjudicación,{' '}
                    <strong className="text-[#B0E454]">
                      BidZone ha liberado los datos de contacto oficiales
                    </strong>{' '}
                    para que coordinen el pago y la entrega del artículo por su cuenta. Ante cualquier incumplimiento puedes elevar un reporte para sancionar o cerrar la cuenta infractora.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#224F10]/35 p-5 rounded-2xl border border-[#B0E454]/30 text-xs">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#B0E454]">
                        Datos del Dueño del Artículo
                      </span>
                      <p className="font-serif-display text-2xl text-[#EAFFD0]">
                        {seller?.name}
                      </p>
                      <p className="flex items-center gap-2 text-[#EAFFD0]">
                        <Phone className="w-3.5 h-3.5 text-[#B0E454]" />
                        {seller?.phone || 'Sin teléfono'}
                      </p>
                      <p className="flex items-center gap-2 text-[#EAFFD0]">
                        <Mail className="w-3.5 h-3.5 text-[#B0E454]" />
                        {seller?.email || 'Sin correo'}
                      </p>
                      <p className="flex items-center gap-2 text-[#EAFFD0]">
                        <MapPin className="w-3.5 h-3.5 text-[#B0E454]" />
                        {seller?.city || 'Argentina'}
                      </p>
                    </div>

                    <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-[#EAFFD0]/20 pt-3 sm:pt-0 sm:pl-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#B0E454]">
                        Datos del Postor Ganador
                      </span>
                      <p className="font-serif-display text-2xl text-[#EAFFD0]">
                        {winner?.name}
                      </p>
                      <p className="flex items-center gap-2 text-[#EAFFD0]">
                        <Phone className="w-3.5 h-3.5 text-[#B0E454]" />
                        {winner?.phone || 'Sin teléfono'}
                      </p>
                      <p className="flex items-center gap-2 text-[#EAFFD0]">
                        <Mail className="w-3.5 h-3.5 text-[#B0E454]" />
                        {winner?.email || 'Sin correo'}
                      </p>
                      <p className="flex items-center gap-2 text-[#EAFFD0]">
                        <MapPin className="w-3.5 h-3.5 text-[#B0E454]" />
                        {winner?.city || 'Argentina'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link to={`/reviews/new?auctionId=${auction.id}`}>
                      <Button size="sm">
                        <Star className="w-4 h-4" />
                        Calificar Operación (1 a 5 ★)
                      </Button>
                    </Link>
                    <Link
                      to={`/reports/new?auctionId=${auction.id}${
                        counterpartUserId
                          ? `&reportedUserId=${counterpartUserId}`
                          : ''
                      }`}
                    >
                      <Button variant="secondary" size="sm">
                        <AlertOctagon className="w-4 h-4" />
                        Informar Incumplimiento / Denunciar
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-[#224F10]/30 p-4 rounded-2xl border border-[#B0E454]/30 text-xs text-[#EAFFD0]">
                  <Lock className="w-5 h-5 text-[#B0E454] shrink-0" />
                  <div>
                    Subasta adjudicada a{' '}
                    <strong className="text-[#B0E454]">{winner.name}</strong> por{' '}
                    <strong className="text-[#B0E454]">
                      {formatCurrency(auction.currentPrice)}
                    </strong>
                    . Por privacidad (RN05), los teléfonos y correos de coordinación solo son visibles para el vendedor y el ganador.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna Derecha: Sala de Pujas en Vivo */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#224F10]/15 pb-4">
              <div>
                <span className="text-[11px] text-[#0D0D0D]/60 block">
                  Oferta Líder Actual
                </span>
                <p className="font-serif-display text-4xl font-semibold text-[#224F10]">
                  {formatCurrency(auction.currentPrice)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#0D0D0D]/60 block">
                  Tiempo Restante
                </span>
                <p className="text-sm font-mono font-bold text-[#0D0D0D] flex items-center justify-end gap-1.5 mt-1">
                  <Clock className="w-4 h-4 text-[#224F10]" />
                  {auction.status === 'activa'
                    ? remaining.formatted
                    : 'Finalizada'}
                </p>
              </div>
            </div>

            {currentUser && auction.status === 'activa' && (
              <div>
                {isLeader ? (
                  <Badge variant="lime" className="w-full justify-center py-2">
                    ★ Eres el postor líder actual en esta subasta
                  </Badge>
                ) : hasParticipated ? (
                  <Badge
                    variant="success"
                    className="w-full justify-center py-2"
                  >
                    ⚠ Tu oferta fue superada — Puja nuevamente para liderar
                  </Badge>
                ) : null}
              </div>
            )}

            {auction.status === 'activa' ? (
              isSeller ? (
                <Alert type="info" title="Eres el dueño de este artículo (RN02)">
                  Como vendedor no puedes realizar auto-pujas sobre tu propia publicación. Puedes finalizar y adjudicar la subasta cuando lo desees desde el botón superior.
                </Alert>
              ) : (
                <form onSubmit={handleOpenConfirmation} className="space-y-4">
                  <Input
                    id="bidAmount"
                    type="number"
                    label={`Tu Oferta en ARS (Mínimo ${formatCurrency(
                      Number(auction.currentPrice) + Number(auction.minIncrement)
                    )})`}
                    helperText={`Máximo permitido: ${formatCurrency(
                      Number(auction.basePrice || auction.currentPrice) * 10
                    )} (10 veces el precio inicial)`}
                    max={Number(auction.basePrice || auction.currentPrice) * 10}
                    value={bidAmount}
                    onChange={(e) =>
                      setBidDraft({
                        auctionId: String(id),
                        value: e.target.value,
                      })
                    }
                  />
                  <Input
                    id="bidNote"
                    label="Nota de coordinación (Opcional)"
                    placeholder="Ej: Pago en efectivo o transferencia y retiro en el día"
                    value={bidNote}
                    onChange={(e) => setBidNote(e.target.value)}
                  />

                  <label className="flex items-start gap-2.5 text-xs text-[#0D0D0D]/85 cursor-pointer bg-[#B0E454]/25 p-3.5 rounded-2xl border border-[#224F10]/20">
                    <input
                      type="checkbox"
                      checked={commitment}
                      onChange={(e) => setCommitment(e.target.checked)}
                      className="mt-0.5 accent-[#224F10]"
                    />
                    <span>
                      <strong>Compromiso vinculante (RN04 / RN06):</strong> Si resulto ganador, me comprometo a coordinar el pago con el dueño. Comprendo que el incumplimiento conlleva infracción o cierre de cuenta.
                    </span>
                  </label>

                  <Button type="submit" size="lg" className="w-full">
                    <Gavel className="w-4 h-4" />
                    Enviar Oferta Vinculante
                  </Button>
                </form>
              )
            ) : (
              <div className="bg-[#0D0D0D] text-[#EAFFD0] p-4 rounded-2xl text-center text-xs font-medium">
                Esta subasta se encuentra cerrada y ya no admite nuevas pujas (RN03).
              </div>
            )}
          </Card>

          {/* Historial Cronológico Auditable de Pujas */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#224F10]/15 pb-2">
              <h3 className="font-serif-display text-2xl text-[#0D0D0D]">
                Historial auditable de pujas ({auctionBids.length})
              </h3>
              <Link
                to="/bids"
                className="text-xs font-semibold text-[#224F10] hover:underline"
              >
                Ver todas →
              </Link>
            </div>

            {auctionBids.length === 0 ? (
              <p className="text-xs text-[#0D0D0D]/60 py-4 text-center">
                Aún no hay ofertas registradas. ¡Sé el primero en pujar!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {auctionBids.map((bid, index) => {
                  const bidderName =
                    bid.bidderName ||
                    users.find((u) => Number(u.id) === Number(bid.bidderId))
                      ?.name ||
                    `Usuario #${bid.bidderId}`;
                  return (
                    <div
                      key={bid.id}
                      className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
                        index === 0
                          ? 'bg-[#0D0D0D] text-[#EAFFD0] border-[#0D0D0D]'
                          : 'bg-white/80 text-[#0D0D0D] border-[#224F10]/15'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{bidderName}</span>
                          {index === 0 && (
                            <Badge variant="lime" className="text-[10px]">
                              Líder
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] opacity-75 mt-0.5">
                          {bid.note}
                        </p>
                        <span className="text-[10px] opacity-60">
                          {formatDateTime(bid.createdAt)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-serif-display text-2xl font-semibold ${
                            index === 0 ? 'text-[#B0E454]' : 'text-[#224F10]'
                          }`}
                        >
                          {formatCurrency(bid.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

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
            <div className="flex flex-col gap-1 pb-3 border-b border-[#224F10]/10">
              <span className="text-[10px] font-bold text-[#0D0D0D]/55 uppercase tracking-wider">
                Artículo / Subasta
              </span>
              <span className="text-sm font-semibold text-[#0D0D0D] line-clamp-2">
                {auction.title}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#224F10]/10 text-xs">
              <div>
                <span className="text-[11px] text-[#0D0D0D]/55 block">
                  Oferta líder actual
                </span>
                <strong className="text-sm font-semibold text-[#0D0D0D]">
                  {formatCurrency(auction.currentPrice)}
                </strong>
              </div>
              <div>
                <span className="text-[11px] text-[#0D0D0D]/55 block">
                  Incremento mínimo
                </span>
                <strong className="text-sm font-semibold text-[#224F10]">
                  +{formatCurrency(auction.minIncrement)}
                </strong>
              </div>
            </div>

            {/* Cuadro destacado del monto ofertado */}
            <div className="bg-[#EAFFD0] p-4 rounded-2xl border-2 border-[#224F10]/30 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#224F10] block mb-1">
                Monto que estás ofertando:
              </span>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-serif-display text-3xl sm:text-4xl font-extrabold text-[#224F10]">
                  {formatCurrency(bidAmount)}
                </span>
                <span className="text-[11px] font-medium text-[#224F10]/80">
                  +{formatCurrency(Number(bidAmount) - Number(auction.currentPrice))} vs actual
                </span>
              </div>
            </div>

            {bidNote && (
              <div className="text-xs text-[#0D0D0D]/80 pt-1">
                <span className="font-semibold block text-[#0D0D0D]">
                  Nota de coordinación:
                </span>
                <p className="italic bg-[#F5FFEB] p-2.5 rounded-xl border border-[#224F10]/10 mt-1">
                  &ldquo;{bidNote}&rdquo;
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
