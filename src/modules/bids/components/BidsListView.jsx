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
  const fetchBids = useBidStore((s) => s.fetchBids);
  const deleteBid = useBidStore((s) => s.deleteBid);
  const auctions = useAuctionStore((s) => s.auctions);
  const users = useAuthStore((s) => s.users);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [auctionFilter, setAuctionFilter] = useState('todas');
  const [scopeFilter, setScopeFilter] = useState('todas');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

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
    await deleteBid(bid.id);
    setFeedback(`Puja #${bid.id} eliminada y precio de subasta recalculado.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registro General de Pujas"
        subtitle="Historial auditable de ofertas realizadas en las subastas de la plataforma."
        action={
          <Button onClick={() => navigate('/bids/new')}>
            <PlusCircle className="w-4 h-4" />
            Registrar Nueva Puja
          </Button>
        }
      />

      {feedback && (
        <Alert type="success" onClose={() => setFeedback('')}>
          {feedback}
        </Alert>
      )}

      <Card className="p-4">
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
        <Card className="text-center py-12 text-sm text-[#EAFFD0]/60">
          No hay pujas registradas para el filtro seleccionado.
        </Card>
      ) : (
        <div className="space-y-3">
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
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={isTop ? 'lime' : 'default'}>
                      {isTop ? 'OFERTA LÍDER / GANADORA' : `PUJA #${bid.id}`}
                    </Badge>
                    <Link
                      to={`/auctions/${bid.auctionId}`}
                      className="font-bold text-sm text-[#EAFFD0] hover:text-[#B0E454] flex items-center gap-1"
                    >
                      <Gavel className="w-3.5 h-3.5 text-[#B0E454]" />
                      {auction?.title || `Subasta #${bid.auctionId}`}
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </Link>
                  </div>
                  <p className="text-xs text-[#EAFFD0]/75">
                    Postor:{' '}
                    <strong className="text-[#EAFFD0]">
                      {bidder?.name || `Usuario #${bid.bidderId}`}
                    </strong>{' '}
                    · Nota: &ldquo;{bid.note || 'Sin nota adicional'}&rdquo;
                  </p>
                  <p className="text-[11px] text-[#EAFFD0]/50">
                    Fecha: {formatDateTime(bid.createdAt)} · Compromiso RN04 aceptado
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#224F10]/50">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase text-[#EAFFD0]/50 block">
                      Monto Ofertado
                    </span>
                    <span className="text-lg font-extrabold text-[#B0E454]">
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

