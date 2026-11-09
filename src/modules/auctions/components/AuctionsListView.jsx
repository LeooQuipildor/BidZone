import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuctionStore } from '../states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import {
  Card,
  Button,
  Badge,
  Input,
  Select,
  PageHeader,
  Alert,
} from '../../core/design-system/ui';
import { formatCurrency, getRemainingTime } from '../../core/utils/formatters';
import {
  PlusCircle,
  Gavel,
  Edit3,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export function AuctionsListView() {
  const navigate = useNavigate();
  const auctions = useAuctionStore((s) => s.auctions);
  const filters = useAuctionStore((s) => s.filters);
  const setFilters = useAuctionStore((s) => s.setFilters);
  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);
  const deleteAuction = useAuctionStore((s) => s.deleteAuction);
  const currentUser = useAuthStore((s) => s.currentUser);
  const users = useAuthStore((s) => s.users);

  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const categories = [
    'Todas',
    'Tecnología',
    'Gaming',
    'Hogar y Oficina',
    'Deportes',
    'Fotografía',
    'Vehículos',
  ];

  const filtered = auctions
    .filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        a.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchCategory =
        filters.category === 'Todas' || a.category === filters.category;
      const matchStatus =
        filters.status === 'todas' || a.status === filters.status;
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'priceAsc')
        return Number(a.currentPrice) - Number(b.currentPrice);
      if (filters.sortBy === 'priceDesc')
        return Number(b.currentPrice) - Number(a.currentPrice);
      return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    });

  const handleDelete = async (auction) => {
    const confirmed = window.confirm(
      `¿Confirmas la eliminación de la subasta "${auction.title}"?`
    );
    if (!confirmed) return;
    await deleteAuction(auction.id);
    setFeedback(`Subasta "${auction.title}" eliminada exitosamente.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo de Subastas"
        subtitle="Explora subastas en vivo, realiza ofertas vinculantes o administra tus publicaciones."
        action={
          currentUser && (
            <Button onClick={() => navigate('/auctions/new')}>
              <PlusCircle className="w-4 h-4" />
              Nueva Subasta
            </Button>
          )
        }
      />

      {feedback && (
        <Alert type="success" onClose={() => setFeedback('')}>
          {feedback}
        </Alert>
      )}

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            id="search-auctions"
            label="Buscar artículo"
            placeholder="MacBook, PS5, Silla..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
          <Select
            id="category-filter"
            label="Categoría"
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
          <Select
            id="status-filter"
            label="Estado"
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
            options={[
              { value: 'todas', label: 'Todas las subastas' },
              { value: 'activa', label: 'En vivo (Activas)' },
              { value: 'finalizada', label: 'Finalizadas' },
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

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm text-[#EAFFD0]/65">
            No se encontraron subastas con los criterios seleccionados.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((auction) => {
            const remaining = getRemainingTime(auction.endTime);
            const seller = users.find(
              (u) => Number(u.id) === Number(auction.sellerId)
            );
            const canManage =
              currentUser &&
              (currentUser.role === 'admin' ||
                Number(currentUser.id) === Number(auction.sellerId));

            return (
              <Card
                key={auction.id}
                className="flex flex-col justify-between p-0 overflow-hidden hover:border-[#B0E454]/60 transition-all"
              >
                <div>
                  <div className="relative h-48 bg-[#0D0D0D]">
                    <img
                      src={auction.imageUrl}
                      alt={auction.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <Badge variant="lime">{auction.category}</Badge>
                      <Badge
                        variant={
                          auction.status === 'activa' ? 'success' : 'muted'
                        }
                      >
                        {auction.status === 'activa' ? 'EN VIVO' : 'FINALIZADA'}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-[#0D0D0D]/90 border border-[#B0E454]/40 px-2.5 py-1 rounded-lg text-xs font-mono text-[#B0E454] flex items-center gap-1.5">
                      {auction.status === 'activa' ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          {remaining.formatted}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Cerrada
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <h3 className="font-bold text-base text-[#EAFFD0] line-clamp-1">
                      {auction.title}
                    </h3>
                    <p className="text-xs text-[#EAFFD0]/65 line-clamp-2">
                      {auction.description}
                    </p>
                    <p className="text-[11px] text-[#EAFFD0]/55">
                      Vendedor:{' '}
                      <strong className="text-[#EAFFD0]">
                        {seller?.name || 'Usuario'}
                      </strong>{' '}
                      · Incremento mín: {formatCurrency(auction.minIncrement)}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-[#224F10]/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#EAFFD0]/55 block">
                        Oferta Actual
                      </span>
                      <span className="text-xl font-extrabold text-[#B0E454]">
                        {formatCurrency(auction.currentPrice)}
                      </span>
                    </div>
                    <Link to={`/auctions/${auction.id}`}>
                      <Button size="sm">
                        {auction.status === 'activa' ? (
                          <>
                            <Gavel className="w-3.5 h-3.5" />
                            Sala de Puja
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Ver Resultado
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>

                  {canManage && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#224F10]/30">
                      <Link to={`/auctions/${auction.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          <Edit3 className="w-3.5 h-3.5" />
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(auction)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

