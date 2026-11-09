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
} from '../../core/design-system/ui';
import {
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
  const closeAuctionNow = useAuctionStore((s) => s.closeAuctionNow);
  const bids = useBidStore((s) => s.bids);
  const createBid = useBidStore((s) => s.createBid);
  const currentUser = useAuthStore((s) => s.currentUser);
  const users = useAuthStore((s) => s.users);

  const auction = auctions.find((a) => Number(a.id) === Number(id));

  const [remaining, setRemaining] = useState(() =>
    auction ? getRemainingTime(auction.endTime) : { formatted: '—' }
  );
  const [bidAmount, setBidAmount] = useState(() =>
    auction
      ? String(Number(auction.currentPrice) + Number(auction.minIncrement))
      : ''
  );
  const [bidNote, setBidNote] = useState('');
  const [commitment, setCommitment] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!auction || auction.status !== 'activa') return;
    const timer = setInterval(() => {
      setRemaining(getRemainingTime(auction.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [auction]);

  if (!auction) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Alert type="error" title="Subasta no encontrada">
          El artículo que buscas no existe o fue eliminado.
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

  const auctionBids = bids
    .filter((b) => Number(b.auctionId) === Number(auction.id))
    .sort((a, b) => Number(b.amount) - Number(a.amount));

  const topBid = auctionBids[0];
  const seller = users.find((u) => Number(u.id) === Number(auction.sellerId));
  const winner = auction.winnerId
    ? users.find((u) => Number(u.id) === Number(auction.winnerId))
    : topBid
      ? users.find((u) => Number(u.id) === Number(topBid.bidderId))
      : null;

  const isSeller =
    currentUser && Number(currentUser.id) === Number(auction.sellerId);
  const isAdmin = currentUser?.role === 'admin';
  const isLeader =
    currentUser && topBid && Number(topBid.bidderId) === Number(currentUser.id);
  const hasParticipated =
    currentUser &&
    auctionBids.some((b) => Number(b.bidderId) === Number(currentUser.id));

  const canSeeUnlockedContact =
    auction.status === 'finalizada' &&
    winner &&
    currentUser &&
    (isSeller ||
      Number(currentUser.id) === Number(winner.id) ||
      isAdmin);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      await createBid({
        auctionId: auction.id,
        bidderId: currentUser.id,
        amount: bidAmount,
        note: bidNote,
        commitmentAccepted: commitment,
      });
      setSuccessMsg(
        `¡Tu oferta de ${formatCurrency(bidAmount)} fue registrada exitosamente! Ahora eres el postor líder.`
      );
      setBidAmount(
        String(Number(bidAmount) + Number(auction.minIncrement))
      );
      setBidNote('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleCloseNow = async () => {
    const confirmed = window.confirm(
      '¿Deseas finalizar la subasta ahora mismo? Se adjudicará al postor líder y se liberarán los datos de contacto entre ambas partes.'
    );
    if (!confirmed) return;
    await closeAuctionNow(auction.id);
    setSuccessMsg(
      'Subasta finalizada. Se han liberado los datos de contacto entre el vendedor y el ganador.'
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
          <Card className="p-0 overflow-hidden">
            <div className="relative h-80 sm:h-96 bg-[#0D0D0D]">
              <img
                src={auction.imageUrl}
                alt={auction.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="lime">{auction.category}</Badge>
                <Badge
                  variant={auction.status === 'activa' ? 'success' : 'muted'}
                >
                  {auction.status === 'activa'
                    ? 'SUBASTA EN VIVO'
                    : 'SUBASTA FINALIZADA'}
                </Badge>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#EAFFD0]">
                {auction.title}
              </h1>
              <p className="text-sm text-[#EAFFD0]/80 leading-relaxed">
                {auction.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#224F10]/60 text-xs">
                <div className="bg-[#0D0D0D]/60 p-3 rounded-xl border border-[#224F10]/50">
                  <span className="text-[#EAFFD0]/55 block">Precio Base</span>
                  <strong className="text-sm text-[#EAFFD0]">
                    {formatCurrency(auction.basePrice)}
                  </strong>
                </div>
                <div className="bg-[#0D0D0D]/60 p-3 rounded-xl border border-[#224F10]/50">
                  <span className="text-[#EAFFD0]/55 block">
                    Incremento Mínimo (RN01)
                  </span>
                  <strong className="text-sm text-[#B0E454]">
                    + {formatCurrency(auction.minIncrement)}
                  </strong>
                </div>
                <div className="bg-[#0D0D0D]/60 p-3 rounded-xl border border-[#224F10]/50 col-span-2 sm:col-span-1">
                  <span className="text-[#EAFFD0]/55 block">Dueño / Vendedor</span>
                  <strong className="text-sm text-[#EAFFD0]">
                    {seller?.name || 'Usuario'} ({seller?.reputation || '5.0'} ★)
                  </strong>
                </div>
              </div>
            </div>
          </Card>

          {/* RN05: Tarjeta de Liberación de Datos de Contacto tras Cierre */}
          {auction.status === 'finalizada' && (
            <Card className="border-[#B0E454] bg-gradient-to-br from-[#224F10]/40 to-[#141A12] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#B0E454]" />
                  <h2 className="text-lg font-extrabold text-[#EAFFD0]">
                    Resolución y Coordinación Directa (RN05 / RN06)
                  </h2>
                </div>
                <Badge variant="lime">SUBASTA CERRADA</Badge>
              </div>

              {!winner ? (
                <p className="text-sm text-[#EAFFD0]/75">
                  Esta subasta finalizó sin recibir ofertas.
                </p>
              ) : canSeeUnlockedContact ? (
                <div className="space-y-4">
                  <p className="text-xs text-[#EAFFD0]/85 leading-relaxed">
                    ¡Felicitaciones! Como parte involucrada en la adjudicación,{' '}
                    <strong className="text-[#B0E454]">
                      BidZone ha liberado los datos de contacto oficiales
                    </strong>{' '}
                    para que coordinen el pago y la entrega del artículo por su cuenta. Recuerda que ante cualquier incumplimiento puedes elevar un reporte para sancionar o cerrar la cuenta infractora.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0D0D0D]/85 p-4 rounded-xl border border-[#B0E454]/40 text-xs">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B0E454]">
                        Datos del Dueño del Artículo
                      </span>
                      <p className="text-sm font-bold text-[#EAFFD0]">
                        {seller?.name}
                      </p>
                      <p className="flex items-center gap-2 text-[#EAFFD0]/85">
                        <Phone className="w-3.5 h-3.5 text-[#B0E454]" />
                        {seller?.phone}
                      </p>
                      <p className="flex items-center gap-2 text-[#EAFFD0]/85">
                        <Mail className="w-3.5 h-3.5 text-[#B0E454]" />
                        {seller?.email}
                      </p>
                      <p className="flex items-center gap-2 text-[#EAFFD0]/85">
                        <MapPin className="w-3.5 h-3.5 text-[#B0E454]" />
                        {seller?.city}
                      </p>
                    </div>

                    <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-[#224F10] pt-3 sm:pt-0 sm:pl-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B0E454]">
                        Datos del Postor Ganador
                      </span>
                      <p className="text-sm font-bold text-[#EAFFD0]">
                        {winner?.name}
                      </p>
                      <p className="flex items-center gap-2 text-[#EAFFD0]/85">
                        <Phone className="w-3.5 h-3.5 text-[#B0E454]" />
                        {winner?.phone}
                      </p>
                      <p className="flex items-center gap-2 text-[#EAFFD0]/85">
                        <Mail className="w-3.5 h-3.5 text-[#B0E454]" />
                        {winner?.email}
                      </p>
                      <p className="flex items-center gap-2 text-[#EAFFD0]/85">
                        <MapPin className="w-3.5 h-3.5 text-[#B0E454]" />
                        {winner?.city}
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
                    <Link to={`/reports/new?auctionId=${auction.id}`}>
                      <Button variant="danger" size="sm">
                        <AlertOctagon className="w-4 h-4" />
                        Informar Incumplimiento / Denunciar
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-[#0D0D0D]/70 p-4 rounded-xl border border-[#224F10] text-xs text-[#EAFFD0]/75">
                  <Lock className="w-5 h-5 text-[#B0E454] shrink-0" />
                  <div>
                    Subasta adjudicada a{' '}
                    <strong className="text-[#EAFFD0]">{winner.name}</strong> por{' '}
                    <strong className="text-[#B0E454]">
                      {formatCurrency(auction.currentPrice)}
                    </strong>
                    . Por privacidad (RN05), los teléfonos y correos de coordinación solo son visibles para el vendedor y el ganador.
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Columna Derecha: Sala de Pujas en Vivo */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="space-y-5 border-[#B0E454]/40">
            <div className="flex items-center justify-between border-b border-[#224F10]/60 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#EAFFD0]/60 block">
                  Oferta Líder Actual
                </span>
                <p className="text-3xl font-black text-[#B0E454]">
                  {formatCurrency(auction.currentPrice)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-[#EAFFD0]/60 block">
                  Tiempo Restante
                </span>
                <p className="text-base font-mono font-bold text-[#EAFFD0] flex items-center justify-end gap-1.5">
                  <Clock className="w-4 h-4 text-[#B0E454]" />
                  {auction.status === 'activa'
                    ? remaining.formatted
                    : 'Finalizada'}
                </p>
              </div>
            </div>

            {/* Indicador dinámico de estado del postor */}
            {currentUser && auction.status === 'activa' && (
              <div>
                {isLeader ? (
                  <Badge variant="lime" className="w-full justify-center py-1.5">
                    ★ ERES EL POSTOR LÍDER ACTUAL EN ESTA SUBASTA
                  </Badge>
                ) : hasParticipated ? (
                  <Badge
                    variant="warning"
                    className="w-full justify-center py-1.5"
                  >
                    ⚠ TU OFERTA FUE SUPERADA — PUJA NUEVAMENTE PARA LIDERAR
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
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <Input
                    id="bidAmount"
                    type="number"
                    label={`Tu Oferta en ARS (Mínimo ${formatCurrency(
                      Number(auction.currentPrice) + Number(auction.minIncrement)
                    )})`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                  <Input
                    id="bidNote"
                    label="Nota de coordinación (Opcional)"
                    placeholder="Ej: Pago en efectivo o transferencia y retiro en el día"
                    value={bidNote}
                    onChange={(e) => setBidNote(e.target.value)}
                  />

                  <label className="flex items-start gap-2.5 text-xs text-[#EAFFD0]/80 cursor-pointer bg-[#0D0D0D]/60 p-3 rounded-xl border border-[#224F10]">
                    <input
                      type="checkbox"
                      checked={commitment}
                      onChange={(e) => setCommitment(e.target.checked)}
                      className="mt-0.5 accent-[#B0E454]"
                    />
                    <span>
                      <strong>Compromiso vinculante (RN04 / RN06):</strong> Si resulto ganador, me comprometo a coordinar el pago con el dueño. Comprendo que el incumplimiento conlleva infracción o cierre de cuenta.
                    </span>
                  </label>

                  <Button type="submit" size="lg" className="w-full">
                    <Gavel className="w-5 h-5" />
                    Enviar Oferta Vinculante
                  </Button>
                </form>
              )
            ) : (
              <div className="bg-[#0D0D0D]/60 p-4 rounded-xl border border-[#224F10] text-center text-xs text-[#EAFFD0]/70">
                Esta subasta se encuentra cerrada y ya no admite nuevas pujas (RN03).
              </div>
            )}
          </Card>

          {/* Historial Cronológico Auditable de Pujas */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#EAFFD0]">
                Historial Auditable de Pujas ({auctionBids.length})
              </h3>
              <Link
                to="/bids"
                className="text-xs text-[#B0E454] hover:underline"
              >
                Ver todas →
              </Link>
            </div>

            {auctionBids.length === 0 ? (
              <p className="text-xs text-[#EAFFD0]/60 py-4 text-center">
                Aún no hay ofertas registradas. ¡Sé el primero en pujar!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {auctionBids.map((bid, index) => {
                  const bidder = users.find(
                    (u) => Number(u.id) === Number(bid.bidderId)
                  );
                  return (
                    <div
                      key={bid.id}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                        index === 0
                          ? 'bg-[#224F10]/40 border-[#B0E454]/60'
                          : 'bg-[#0D0D0D]/60 border-[#224F10]/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#EAFFD0]">
                            {bidder?.name || `Usuario #${bid.bidderId}`}
                          </span>
                          {index === 0 && (
                            <Badge variant="lime" className="text-[10px]">
                              LÍDER
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-[#EAFFD0]/65 mt-0.5">
                          {bid.note}
                        </p>
                        <span className="text-[10px] text-[#EAFFD0]/45">
                          {formatDateTime(bid.createdAt)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-[#B0E454]">
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
    </div>
  );
}

