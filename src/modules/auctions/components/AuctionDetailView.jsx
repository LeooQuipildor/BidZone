import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuctionStore } from '../states/auctionStore';
import { useBidStore } from '../../bids/states/bidStore';
import { useAuthStore } from '../../auth/states/authStore';
import { AuctionContactPanel } from './AuctionContactPanel';
import { AuctionBidPanel } from './AuctionBidPanel';
import { Alert, Badge, Button, ErrorStateCard, Spinner } from '../../core/design-system/ui';
import { DEFAULT_AUCTION_IMAGE_URL, findById, formatCurrency, sameId } from '../../core/utils/formatters';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

function getStatusBadgeInfo(status) {
  if (status === 'activa') return { variant: 'success', label: 'Subasta en Vivo' };
  if (status === 'cancelada') return { variant: 'dark', label: 'Cancelada' };
  return { variant: 'dark', label: 'Subasta Finalizada' };
}

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

  const [nowMs, setNowMs] = useState(() => Date.now());
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAuctionById(id);
  }, [id, currentUser?.id, fetchAuctionById]);

  const detailAuction = currentAuctionDetail && sameId(currentAuctionDetail.id, id) ? currentAuctionDetail : null;
  const auction = detailAuction || findById(auctions, id);

  useEffect(() => {
    if (!auction?.endTime || auction?.status !== 'activa') return;
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [auction?.endTime, auction?.status]);

  if (detailLoading && !auction) return <Spinner label="Cargando subasta..." />;

  if (!auction) {
    return (
      <ErrorStateCard
        title="Subasta no encontrada"
        message={storeError || 'El artículo que buscas no existe o fue eliminado.'}
        buttonLabel="Volver al catálogo"
        onBack={() => navigate('/auctions')}
      />
    );
  }

  const rawBids = Array.isArray(detailAuction?.bids)
    ? detailAuction.bids
    : bids.filter((b) => sameId(b.auctionId, auction.id));
  const auctionBids = [...rawBids].sort((a, b) => Number(b.amount) - Number(a.amount));

  const seller = detailAuction?.seller || findById(users, auction.sellerId) || {
    id: auction.sellerId,
    name: auction.sellerName || 'Vendedor',
    reputation: auction.sellerReputation || 5.0,
  };

  let winner = detailAuction?.winner || null;
  if (!winner && auction.winnerId) {
    winner = findById(users, auction.winnerId) || { id: auction.winnerId, name: auction.winnerName || 'Ganador' };
  }

  const isSeller = Boolean(currentUser && sameId(currentUser.id, auction.sellerId));
  const isAdmin = currentUser?.role === 'admin';
  const canSeeUnlockedContact = detailAuction
    ? Boolean(detailAuction.contactUnlocked)
    : Boolean(auction.status === 'finalizada' && winner && currentUser && (isSeller || isAdmin || sameId(currentUser.id, winner.id)));
  const statusBadge = getStatusBadgeInfo(auction.status);

  async function handleCloseNow() {
    if (!window.confirm('¿Deseas finalizar la subasta ahora? Se adjudicará al postor líder y se liberarán los contactos.')) {
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await closeAuctionNow(auction.id);
      setSuccessMsg('Subasta finalizada. Se han liberado los datos de contacto entre el vendedor y el ganador.');
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/auctions')}>
          <ArrowLeft className="w-4 h-4" />
          Volver al Catálogo
        </Button>

        {(isSeller || isAdmin) && (
          <div className="flex items-center gap-2">
            {auction.status === 'activa' && (
              <Button variant="secondary" size="sm" onClick={handleCloseNow}>
                <CheckCircle2 className="w-4 h-4" />
                Finalizar y Adjudicar Ahora
              </Button>
            )}
            <Link to={`/auctions/${auction.id}/edit`}>
              <Button variant="outline" size="sm">Editar Subasta</Button>
            </Link>
          </div>
        )}
      </div>

      {errorMsg && <Alert type="error" onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}
      {successMsg && <Alert type="success" onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-[#F5FFEB] border border-[#224F10]/15 overflow-hidden shadow-xs">
            <div className="relative h-80 sm:h-96 bg-white">
              <img src={auction.imageUrl || DEFAULT_AUCTION_IMAGE_URL} alt={auction.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="lime">{auction.category}</Badge>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <h1 className="font-serif-display text-3xl sm:text-5xl text-[#0D0D0D] leading-tight">{auction.title}</h1>
              <p className="text-xs sm:text-sm text-[#0D0D0D]/75 leading-relaxed">{auction.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#224F10]/15 text-xs">
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#224F10]/15">
                  <span className="text-[11px] text-[#0D0D0D]/55 block">Precio Base</span>
                  <strong className="font-serif-display text-2xl text-[#0D0D0D]">{formatCurrency(auction.basePrice)}</strong>
                </div>
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#224F10]/15">
                  <span className="text-[11px] text-[#0D0D0D]/55 block">Incremento Mín. (RN01)</span>
                  <strong className="font-serif-display text-2xl text-[#224F10]">+ {formatCurrency(auction.minIncrement)}</strong>
                </div>
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#224F10]/15">
                  <span className="text-[11px] text-[#0D0D0D]/55 block">Dueño / Vendedor</span>
                  <strong className="text-sm font-semibold text-[#0D0D0D] block mt-1">{seller?.name || 'Usuario'} ({seller?.reputation || '5.0'} ★)</strong>
                </div>
              </div>
            </div>
          </div>

          <AuctionContactPanel auction={auction} seller={seller} winner={winner} canSeeUnlockedContact={canSeeUnlockedContact} isSeller={isSeller} />
        </div>

        <AuctionBidPanel
          key={auction.id}
          auction={auction}
          auctionBids={auctionBids}
          users={users}
          currentUser={currentUser}
          nowMs={nowMs}
          isSeller={isSeller}
          onCreateBid={createBid}
          onSuccess={setSuccessMsg}
          onError={setErrorMsg}
        />
      </div>
    </div>
  );
}
