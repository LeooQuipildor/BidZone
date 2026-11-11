import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuctionStore } from '../../../auctions/states/auctionStore';
import {
  DEFAULT_AUCTION_IMAGE_URL,
  formatCurrency,
  toIsoFromLocalInput,
  toLocalDatetimeInputValue,
  sameId,
  findById,
  matchesSearch,
} from '../../utils/formatters';
import {
  AUCTION_CATEGORY_OPTIONS,
  DASHBOARD_CATEGORIES,
  formatCountdownFromNow,
} from './dashboardHelpers';
import { DashboardFeedback, DashboardStatCard } from './DashboardShared';
import {
  Plus,
  X,
  ArrowUpRight,
  Clock,
  Edit3,
  Trash2,
  Save,
  Gavel,
} from 'lucide-react';

// Valores iniciales cuando se abre el formulario para publicar una subasta nueva
function createEmptyAuctionForm() {
  const unDiaDespues = Date.now() + 24 * 3600 * 1000;
  return {
    title: '',
    description: '',
    category: 'Tecnología',
    imageUrl: '',
    basePrice: '',
    minIncrement: '',
    status: 'activa',
    endTime: toLocalDatetimeInputValue(unDiaDespues),
  };
}

// Filtra y ordena la lista de subastas según categoría, estado, búsqueda y criterio de orden
function filterAndSortAuctions(
  auctions,
  searchQuery,
  category,
  statusFilter,
  sortBy
) {
  const filtered = auctions.filter((auction) => {
    const matchSearch = matchesSearch(
      [auction.title, auction.description, auction.category],
      searchQuery
    );
    const matchCategory = category === 'Todas' || auction.category === category;
    const matchStatus =
      statusFilter === 'todas' || auction.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'priceAsc') {
      return Number(a.currentPrice) - Number(b.currentPrice);
    }
    if (sortBy === 'priceDesc') {
      return Number(b.currentPrice) - Number(a.currentPrice);
    }
    return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
  });

  return filtered;
}

// Devuelve las opciones del selector de estado al editar una subasta
function getEditableStatusOptions(isAdmin, editingAuction, editingHasBids) {
  if (isAdmin) {
    return [
      { value: 'activa', label: 'Activa' },
      { value: 'finalizada', label: 'Finalizada' },
      { value: 'cancelada', label: 'Cancelada' },
    ];
  }

  if (editingAuction?.status === 'activa' && !editingHasBids) {
    return [
      { value: 'activa', label: 'Activa' },
      { value: 'cancelada', label: 'Cancelada' },
    ];
  }

  if (editingAuction?.status === 'finalizada') {
    return [{ value: 'finalizada', label: 'Finalizada' }];
  }
  if (editingAuction?.status === 'cancelada') {
    return [{ value: 'cancelada', label: 'Cancelada' }];
  }
  return [{ value: 'activa', label: 'Activa' }];
}

// Calcula qué etiqueta mostrar en la tarjeta de cada subasta
function getCardStatusInfo(auction, isLive, countdown) {
  if (auction.status === 'cancelada') {
    return {
      timerText: 'Cancelada',
      badgeText: 'Cancelada',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
    };
  }
  if (isLive) {
    return {
      timerText: countdown,
      badgeText: 'En subasta',
      badgeClass: 'bg-[#EAFFD0] text-[#224F10] border-[#224F10]/20',
    };
  }
  return {
    timerText: 'Finalizada',
    badgeText: 'Finalizada',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
  };
}

export function DashboardAuctionsTab({
  currentUser,
  users,
  auctions,
  bids,
  searchQuery,
  nowMs,
  prefill,
}) {
  const navigate = useNavigate();
  const createAuction = useAuctionStore((s) => s.createAuction);
  const updateAuction = useAuctionStore((s) => s.updateAuction);
  const closeAuctionNow = useAuctionStore((s) => s.closeAuctionNow);
  const deleteAuction = useAuctionStore((s) => s.deleteAuction);

  const isAdmin = currentUser?.role === 'admin';

  const [category, setCategory] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState(prefill?.status || 'todas');
  const [sortBy, setSortBy] = useState('endingSoon');
  const [feedback, setFeedback] = useState(null);

  const [formOpen, setFormOpen] = useState(Boolean(prefill?.openCreate));
  const [editingAuctionId, setEditingAuctionId] = useState(null);
  const [editingInitialEndTime, setEditingInitialEndTime] = useState('');
  const [formData, setFormData] = useState(() => createEmptyAuctionForm());

  const activeAuctions = auctions.filter((a) => a.status === 'activa');
  const awardedAuctions = auctions.filter(
    (a) => a.status === 'finalizada' && a.winnerId
  );
  const myAuctions = auctions.filter((a) =>
    sameId(a.sellerId, currentUser?.id)
  );

  const filteredAuctions = filterAndSortAuctions(
    auctions,
    searchQuery,
    category,
    statusFilter,
    sortBy
  );

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function openCreateForm() {
    setEditingAuctionId(null);
    setEditingInitialEndTime('');
    setFormData(createEmptyAuctionForm());
    setFormOpen(true);
    setFeedback(null);
  }

  function openEditForm(auction) {
    const localEnd = auction.endTime
      ? toLocalDatetimeInputValue(auction.endTime)
      : toLocalDatetimeInputValue(Date.now() + 24 * 3600 * 1000);

    setEditingAuctionId(auction.id);
    setEditingInitialEndTime(localEnd);
    setFormData({
      title: auction.title || '',
      description: auction.description || '',
      category: auction.category || 'Tecnología',
      imageUrl: auction.imageUrl || '',
      basePrice: String(auction.basePrice ?? ''),
      minIncrement: String(auction.minIncrement ?? ''),
      status: auction.status || 'activa',
      endTime: localEnd,
    });
    setFormOpen(true);
    setFeedback(null);
  }

  const editingAuction = editingAuctionId
    ? findById(auctions, editingAuctionId)
    : null;

  const editingHasBids = editingAuctionId
    ? Number(editingAuction?.bidCount ?? 0) > 0 ||
      bids.some((b) => sameId(b.auctionId, editingAuctionId))
    : false;

  const lockPricingFields = Boolean(
    editingAuctionId && editingHasBids && !isAdmin
  );
  const statusOptions = getEditableStatusOptions(
    isAdmin,
    editingAuction,
    editingHasBids
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);

    if (!formData.title.trim() || !formData.description.trim()) {
      setFeedback({
        type: 'error',
        text: 'Por favor completa el título y la descripción del artículo.',
      });
      return;
    }

    try {
      if (editingAuctionId) {
        const payload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          imageUrl: formData.imageUrl.trim() || DEFAULT_AUCTION_IMAGE_URL,
        };

        // RN08: si ya tiene pujas, solo un admin puede cambiar precio base, incremento o cierre
        if (!editingHasBids || isAdmin) {
          payload.basePrice = formData.basePrice;
          payload.minIncrement = formData.minIncrement;
          if (formData.endTime && formData.endTime !== editingInitialEndTime) {
            payload.endTime = toIsoFromLocalInput(formData.endTime);
          }
        }

        if (editingAuction && formData.status !== editingAuction.status) {
          payload.status = formData.status;
        }

        await updateAuction(editingAuctionId, payload);
        setFeedback({
          type: 'success',
          text: `Subasta #${editingAuctionId} actualizada correctamente.`,
        });
      } else {
        const endTimeIso = toIsoFromLocalInput(formData.endTime);
        if (!endTimeIso || new Date(endTimeIso).getTime() <= Date.now()) {
          setFeedback({
            type: 'error',
            text: 'La fecha y hora de cierre debe ser posterior al momento actual.',
          });
          return;
        }

        const created = await createAuction({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          imageUrl: formData.imageUrl.trim() || DEFAULT_AUCTION_IMAGE_URL,
          basePrice: formData.basePrice,
          minIncrement: formData.minIncrement,
          endTime: endTimeIso,
        });
        setFeedback({
          type: 'success',
          text: `Subasta "${created.title}" publicada en el panel sin salir de la vista.`,
        });
      }

      setFormOpen(false);
      setEditingAuctionId(null);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  }

  async function handleCloseNow(auction) {
    const confirmed = window.confirm(
      `¿Confirmas cerrar y adjudicar ahora la subasta "${auction.title}"? Si hay postores se adjudicará al mejor postor y se liberarán los contactos (RN05).`
    );
    if (!confirmed) return;

    try {
      await closeAuctionNow(auction.id);
      setFeedback({
        type: 'success',
        text: `Subasta "${auction.title}" finalizada y adjudicada.`,
      });
      setFormOpen(false);
      setEditingAuctionId(null);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  }

  async function handleDelete(auction) {
    const confirmed = window.confirm(
      `¿Confirmas eliminar la subasta "${auction.title}"?`
    );
    if (!confirmed) return;

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
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
            Subastas y Lotes
          </h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">
            Explora salas en vivo, publica nuevos artículos y administra tus
            publicaciones dentro del mismo panel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publicar Subasta</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/auctions')}
            className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-[#EAFFD0] border border-[#224F10]/20 text-[#0D0D0D] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Vista Catálogo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard
          highlight
          title="Total Publicadas"
          icon={<Gavel className="w-3.5 h-3.5" />}
          value={auctions.length}
          subtitle={`${filteredAuctions.length} visibles con filtro actual`}
        />
        <DashboardStatCard
          title="Salas en Vivo"
          value={activeAuctions.length}
          subtitle="Abiertas a pujas RN01"
          subtitleClassName="text-[#224F10] font-semibold"
        />
        <DashboardStatCard
          title="Adjudicadas"
          value={awardedAuctions.length}
          subtitle="Cierre con trato directo RN05"
        />
        <DashboardStatCard
          title="Mis Publicaciones"
          value={myAuctions.length}
          subtitle="Creadas con tu cuenta"
        />
      </div>

      <DashboardFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      {/* Formulario integrado para crear o editar */}
      {formOpen && (
        <div className="rounded-2xl bg-white border border-[#224F10]/20 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-[#224F10]/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0D0D0D]">
                {editingAuctionId
                  ? `Editar Subasta #${editingAuctionId}`
                  : 'Publicar Nueva Subasta'}
              </h2>
              <p className="text-[11px] text-[#0D0D0D]/60">
                {lockPricingFields
                  ? 'RN08: Esta subasta ya tiene pujas; el precio base queda bloqueado.'
                  : 'Define título, categoría, precio base e incremento mínimo.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditingAuctionId(null);
              }}
              className="w-8 h-8 rounded-full bg-[#F7FBF3] hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Título del Artículo *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Ej: iPhone 15 Pro Max 256GB"
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#224F10]/25"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#224F10]/25"
                  >
                    {AUCTION_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {editingAuctionId ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                      Estado
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => updateField('status', e.target.value)}
                      className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#224F10]/25"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                      Cierre *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => updateField('endTime', e.target.value)}
                      className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {editingAuctionId && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Fecha y Hora de Cierre
                </label>
                <input
                  type="datetime-local"
                  disabled={lockPricingFields}
                  value={formData.endTime}
                  onChange={(e) => updateField('endTime', e.target.value)}
                  className="w-full sm:max-w-xs rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] disabled:opacity-55 focus:outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Precio Base (ARS) *
                </label>
                <input
                  type="number"
                  disabled={lockPricingFields}
                  value={formData.basePrice}
                  onChange={(e) => updateField('basePrice', e.target.value)}
                  placeholder="100000"
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] disabled:opacity-55 focus:outline-none focus:ring-2 focus:ring-[#224F10]/25"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Incremento Mínimo (ARS) *
                </label>
                <input
                  type="number"
                  disabled={lockPricingFields}
                  value={formData.minIncrement}
                  onChange={(e) => updateField('minIncrement', e.target.value)}
                  placeholder="5000"
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] disabled:opacity-55 focus:outline-none focus:ring-2 focus:ring-[#224F10]/25"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  URL de Imagen (Opcional)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => updateField('imageUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#224F10]/25"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                Descripción del Estado y Entrega *
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Detalle técnico, estado del artículo y condiciones de entrega..."
                className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#224F10]/25"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div>
                {editingAuction?.status === 'activa' && (
                  <button
                    type="button"
                    onClick={() => handleCloseNow(editingAuction)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#B0E454] hover:bg-[#224F10] hover:text-[#EAFFD0] text-[#0D0D0D] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    Finalizar y Adjudicar Ahora
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#224F10]/15 text-xs font-semibold text-[#0D0D0D]/75 hover:bg-[#F7FBF3] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] text-xs font-semibold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingAuctionId ? 'Guardar Cambios' : 'Publicar Ahora'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Barra de filtros */}
      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {DASHBOARD_CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            const buttonClass = isSelected
              ? 'bg-[#224F10] text-[#EAFFD0]'
              : 'bg-[#F7FBF3] text-[#0D0D0D]/70 hover:bg-[#EAFFD0]';

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${buttonClass}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#0D0D0D]/55 shrink-0">
              Estado:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none"
            >
              <option value="todas">Todas las subastas</option>
              <option value="activa">En subasta (Activas)</option>
              <option value="finalizada">Finalizadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#0D0D0D]/55 shrink-0">
              Orden:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none"
            >
              <option value="endingSoon">Próximas a finalizar</option>
              <option value="priceAsc">Menor precio actual</option>
              <option value="priceDesc">Mayor precio actual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grilla de subastas */}
      {filteredAuctions.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-10 text-center text-xs text-[#0D0D0D]/60">
          No hay subastas que coincidan con la búsqueda actual.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAuctions.map((auction) => {
            const auctionBids = bids.filter((b) =>
              sameId(b.auctionId, auction.id)
            );
            const bidsCount = Number(auction.bidCount ?? auctionBids.length);
            const seller = findById(users, auction.sellerId);
            const countdown = formatCountdownFromNow(auction.endTime, nowMs);
            const isLive =
              auction.status === 'activa' && countdown !== '00:00:00';
            const canManage =
              isAdmin || sameId(currentUser?.id, auction.sellerId);
            const statusInfo = getCardStatusInfo(auction, isLive, countdown);

            return (
              <div
                key={auction.id}
                className="group rounded-2xl bg-white border border-[#224F10]/10 p-3 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all"
              >
                <div>
                  <div
                    onClick={() => navigate(`/auctions/${auction.id}`)}
                    className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#F1F8E9] cursor-pointer"
                  >
                    <img
                      src={auction.imageUrl || DEFAULT_AUCTION_IMAGE_URL}
                      alt={auction.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-2 pointer-events-none">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white text-[10px] font-medium border border-white/20">
                        {auction.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20 inline-flex items-center gap-1 tabular-nums">
                        <Clock className="w-3 h-3 text-[#B0E454]" />
                        {statusInfo.timerText}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 px-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        onClick={() => navigate(`/auctions/${auction.id}`)}
                        className="text-sm font-bold text-[#0D0D0D] line-clamp-1 hover:text-[#224F10] cursor-pointer"
                      >
                        {auction.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 border ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.badgeText}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#0D0D0D]/55 truncate">
                      {bidsCount} {bidsCount === 1 ? 'oferta' : 'ofertas'} ·
                      Vende: {seller?.name || auction.sellerName || 'Socio'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#224F10]/8 flex items-center justify-between gap-2 px-1">
                  <div>
                    <span className="text-[10px] text-[#0D0D0D]/50 block leading-none">
                      Oferta actual
                    </span>
                    <span className="text-base font-bold text-[#224F10] tabular-nums">
                      {formatCurrency(auction.currentPrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {canManage && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditForm(auction)}
                          title="Editar en el panel"
                          className="w-8 h-8 rounded-full border border-[#224F10]/15 hover:bg-[#EAFFD0] text-[#0D0D0D]/75 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(auction)}
                          title="Eliminar subasta"
                          className="w-8 h-8 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate(`/auctions/${auction.id}`)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] pl-3.5 pr-1.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      <span>{isLive ? 'Pujar' : 'Detalle'}</span>
                      <span className="w-5 h-5 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center">
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
