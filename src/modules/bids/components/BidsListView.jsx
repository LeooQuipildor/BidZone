import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBidStore } from '../states/bidStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import {
  Card,
  Button,
  Badge,
  Select,
  PageHeader,
  Alert,
} from '../../core/design-system/ui';
import { formatCurrency, formatDateTime } from '../../core/utils/formatters';
import { PlusCircle, Edit3, Trash2, Gavel, ExternalLink } from 'lucide-react';

export function BidsListView() {
  const navigate = useNavigate();
  const bids = useBidStore((s) => s.bids);
  const bidsError = useBidStore((s) => s.error);
  const fetchBids = useBidStore((s) => s.fetchBids);
  const deleteBid = useBidStore((s) => s.deleteBid);
  const auctions = useAuctionStore((s) => s.auctions);
  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);
  const users = useAuthStore((s) => s.users);
  const fetchUsers = useAuthStore((s) => s.fetchUsers);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [auctionFilter, setAuctionFilter] = useState('todas');
  const [scopeFilter, setScopeFilter] = useState('todas');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchBids();
    fetchAuctions();
    fetchUsers();
  }, [fetchBids, fetchAuctions, fetchUsers]);

  const isAdmin = currentUser?.role === 'admin';

  const filtered = bids.filter((b) => {
    const matchAuction =
      auctionFilter === 'todas' || Number(b.auctionId) === Number(auctionFilter);
    const matchScope =
      scopeFilter === 'todas' ||
      (scopeFilter === 'mias' && Number(b.bidderId) === Number(currentUser?.id));
    return matchAuction && matchScope;
  });

  const handleDelete = async (bid) => {
    const confirmed = window.confirm(
      `¿Confirmas eliminar el registro de puja #${bid.id} por ${formatCurrency(bid.amount)}?`
    );
    if (!confirmed) return;
    try {
      await deleteBid(bid.id);
      setFeedback({
        type: 'success',
        text: `Puja #${bid.id} eliminada y precio de subasta recalculado.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Historial de pujas"
        subtitle="Registro cronológico y auditable de ofertas realizadas en las subastas de la plataforma."
        action={
          <Button onClick={() => navigate('/bids/new')}>
            <PlusCircle className="w-4 h-4" />
            Registrar Nueva Puja
          </Button>
        }
      />

      {feedback && (
        <Alert type={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.text}
        </Alert>
      )}

      {!feedback && bidsError && (
        <Alert type="error">{bidsError}</Alert>
      )}

      <Card className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            id="auction-filter"
            label="Filtrar por Subasta"
            value={auctionFilter}
            onChange={(e) => setAuctionFilter(e.target.value)}
            options={[
              { value: 'todas', label: 'Todas las subastas' },
              ...auctions.map((a) => ({
                value: String(a.id),
                label: `#${a.id} — ${a.title}`,
              })),
            ]}
          />
          <Select
            id="scope-filter"
            label="Mostrar Ofertas"
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            options={[
              { value: 'todas', label: 'Todas las ofertas públicas' },
              { value: 'mias', label: 'Solo mis pujas realizadas' },
            ]}
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="text-center py-12 text-sm text-[#0D0D0D]/60">
          No hay pujas registradas para el filtro seleccionado.
        </Card>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((bid) => {
            const auction = auctions.find(
              (a) => Number(a.id) === Number(bid.auctionId)
            );
            const bidder = users.find(
              (u) => Number(u.id) === Number(bid.bidderId)
            );
            const isTop =
              auction && Number(auction.currentPrice) === Number(bid.amount);
            const canEdit =
              isAdmin || Number(currentUser?.id) === Number(bid.bidderId);

            return (
              <Card
                key={bid.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={isTop ? 'lime' : 'default'}>
                      {isTop ? 'Oferta Líder / Ganadora' : `Puja #${bid.id}`}
                    </Badge>
                      <Link
                        to={`/auctions/${bid.auctionId}`}
                        className="font-serif-display text-2xl font-semibold text-[#0D0D0D] hover:text-[#224F10] flex items-center gap-1.5"
                      >
                        <Gavel className="w-4 h-4 text-[#224F10]" />
                        {auction?.title || bid.auctionTitle || `Subasta #${bid.auctionId}`}
                        <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                      </Link>
                    </div>
                    <p className="text-xs text-[#0D0D0D]/75">
                      Postor:{' '}
                      <strong className="text-[#0D0D0D]">
                        {bidder?.name || bid.bidderName || `Usuario #${bid.bidderId}`}
                      </strong>{' '}
                      · Nota: &ldquo;{bid.note || 'Sin nota adicional'}&rdquo;
                    </p>
                  <p className="text-[11px] text-[#0D0D0D]/55">
                    Fecha: {formatDateTime(bid.createdAt)} · Compromiso RN04 aceptado
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#224F10]/15">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase text-[#0D0D0D]/50 block">
                      Monto Ofertado
                    </span>
                    <span className="font-serif-display text-3xl font-semibold text-[#224F10]">
                      {formatCurrency(bid.amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <Link to={`/bids/${bid.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          <Edit3 className="w-3.5 h-3.5" />
                          Editar
                        </Button>
                      </Link>
                    )}
                    {isAdmin && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(bid)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
