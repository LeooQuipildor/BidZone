import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuctionStore } from '../states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import { AuctionCard } from './AuctionCard';
import {
  AUCTION_FILTER_CATEGORIES,
  matchesSearch,
  sameId,
} from '../../core/utils/formatters';
import {
  Card,
  Button,
  Input,
  Select,
  PageHeader,
  Alert,
} from '../../core/design-system/ui';
import { PlusCircle, ArrowRight, Sparkles } from 'lucide-react';

// Filtra y ordena la lista de subastas según los controles elegidos
function filterAndSortAuctions(auctions, filters) {
  const filtered = auctions.filter((auction) => {
    const matchText = matchesSearch(
      [auction.title, auction.description],
      filters.search
    );
    const matchCategory =
      filters.category === 'Todas' || auction.category === filters.category;
    const matchStatus =
      filters.status === 'todas' || auction.status === filters.status;

    return matchText && matchCategory && matchStatus;
  });

  return filtered.sort((a, b) => {
    if (filters.sortBy === 'priceAsc') {
      return Number(a.currentPrice) - Number(b.currentPrice);
    }
    if (filters.sortBy === 'priceDesc') {
      return Number(b.currentPrice) - Number(a.currentPrice);
    }
    return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
  });
}

export function AuctionsListView() {
  const navigate = useNavigate();
  const auctions = useAuctionStore((s) => s.auctions);
  const auctionsError = useAuctionStore((s) => s.error);
  const filters = useAuctionStore((s) => s.filters);
  const setFilters = useAuctionStore((s) => s.setFilters);
  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);
  const deleteAuction = useAuctionStore((s) => s.deleteAuction);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const filteredAuctions = filterAndSortAuctions(auctions, filters);

  async function handleDelete(auction) {
    const confirmed = window.confirm(
      `¿Confirmas la eliminación de la subasta "${auction.title}"?`
    );
    if (!confirmed) return;

    setFeedback(null);
    try {
      await deleteAuction(auction.id);
      setFeedback({
        type: 'success',
        text: `Subasta "${auction.title}" eliminada exitosamente.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Elige tu lote en subasta"
        subtitle="Explora artículos en vivo, realiza ofertas vinculantes o administra tus publicaciones."
        action={
          currentUser && (
            <Button onClick={() => navigate('/auctions/new')}>
              <PlusCircle className="w-4 h-4" />
              Publicar Subasta
            </Button>
          )
        }
      />

      {(feedback || auctionsError) && (
        <Alert
          type={feedback?.type || 'error'}
          onClose={() => setFeedback(null)}
        >
          {feedback?.text || auctionsError}
        </Alert>
      )}

      {/* Botones de categorías y filtros de búsqueda */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {AUCTION_FILTER_CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat;
            const buttonStyle = isSelected
              ? 'bg-[#224F10] text-[#EAFFD0]'
              : 'bg-white/80 text-[#0D0D0D]/75 hover:bg-white border border-[#224F10]/12';

            return (
              <button
                key={cat}
                onClick={() => setFilters({ category: cat })}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${buttonStyle}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <Card className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="search-auctions"
              label="Buscar artículo"
              placeholder="MacBook, PS5, Silla..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
            <Select
              id="status-filter"
              label="Estado de sala"
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              options={[
                { value: 'todas', label: 'Todas las subastas' },
                { value: 'activa', label: 'En vivo (Activas)' },
                { value: 'finalizada', label: 'Finalizadas' },
                { value: 'cancelada', label: 'Canceladas' },
              ]}
            />
            <Select
              id="sort-filter"
              label="Ordenar por"
              value={filters.sortBy}
              onChange={(e) => setFilters({ sortBy: e.target.value })}
              options={[
                { value: 'endingSoon', label: 'Próximas a finalizar' },
                { value: 'priceAsc', label: 'Menor precio actual' },
                { value: 'priceDesc', label: 'Mayor precio actual' },
              ]}
            />
          </div>
        </Card>
      </div>

      {filteredAuctions.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm text-[#0D0D0D]/65">
            No se encontraron subastas con los criterios seleccionados.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAuctions.map((auction) => {
            const isAdmin = currentUser?.role === 'admin';
            const isSeller = sameId(currentUser?.id, auction.sellerId);
            const canManage = Boolean(currentUser && (isAdmin || isSeller));

            return (
              <AuctionCard
                key={auction.id}
                auction={auction}
                canManage={canManage}
                onDelete={handleDelete}
              />
            );
          })}

          {/* Tarjeta final de invitación para publicar una nueva subasta */}
          <div className="rounded-[28px] bg-[#224F10] text-[#EAFFD0] p-6 sm:p-7 flex flex-col justify-between min-h-[320px] shadow-sm">
            <span className="w-10 h-10 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </span>

            <div className="space-y-4 pt-6">
              <div className="space-y-1.5">
                <h3 className="text-xl font-semibold text-[#EAFFD0] leading-snug">
                  ¿Tienes un artículo para subastar?
                </h3>
                <p className="text-xs text-[#EAFFD0]/75 leading-relaxed">
                  Publica tu lote con precio base e incremento mínimo. Al cerrar
                  la subasta coordinas directamente con el ganador.
                </p>
              </div>

              <button
                onClick={() => navigate('/auctions/new')}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] text-[#0D0D0D] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Crear nueva subasta</span>
                <span className="w-6 h-6 rounded-full bg-[#224F10] text-[#EAFFD0] flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
