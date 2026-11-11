import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuctionStore } from '../../../auctions/states/auctionStore';
import {
  DEFAULT_AUCTION_IMAGE_URL,
  formatCurrency,
  toIsoFromLocalInput,
  toLocalDatetimeInputValue,
} from '../../utils/formatters';
import {
  AUCTION_CATEGORY_OPTIONS,
  DASHBOARD_CATEGORIES,
  formatCountdownFromNow,
} from './dashboardHelpers';
import {
  Plus,
  X,
  ArrowUpRight,
  Clock,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Gavel,
} from 'lucide-react';

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
  const [formData, setFormData] = useState(() => ({
    title: '',
    description: '',
    category: 'Tecnología',
    imageUrl: '',
    basePrice: '',
    minIncrement: '',
    status: 'activa',
    endTime: toLocalDatetimeInputValue(Date.now() + 24 * 3600 * 1000),
  }));

  const activeAuctions = auctions.filter((a) => a.status === 'activa');
  const awardedAuctions = auctions.filter(
    (a) => a.status === 'finalizada' && a.winnerId
  );
  const myAuctions = auctions.filter(
    (a) => Number(a.sellerId) === Number(currentUser?.id)
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredAuctions = auctions
    .filter((a) => {
      const matchSearch =
        !normalizedQuery ||
        (a.title || '').toLowerCase().includes(normalizedQuery) ||
        (a.description || '').toLowerCase().includes(normalizedQuery) ||
        (a.category || '').toLowerCase().includes(normalizedQuery);
      const matchCategory = category === 'Todas' || a.category === category;
      const matchStatus = statusFilter === 'todas' || a.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'priceAsc')
        return Number(a.currentPrice) - Number(b.currentPrice);
      if (sortBy === 'priceDesc')
        return Number(b.currentPrice) - Number(a.currentPrice);
      return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    });

  const openCreateForm = () => {
    setEditingAuctionId(null);
    setEditingInitialEndTime('');
    setFormData({
      title: '',
      description: '',
      category: 'Tecnología',
      imageUrl: '',
      basePrice: '',
      minIncrement: '',
      status: 'activa',
      endTime: toLocalDatetimeInputValue(Date.now() + 24 * 3600 * 1000),
    });
    setFormOpen(true);
    setFeedback(null);
  };

  const openEditForm = (auction) => {
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
  };

  const editingAuction = editingAuctionId
    ? auctions.find((a) => Number(a.id) === Number(editingAuctionId))
    : null;

  const editingHasBids = editingAuctionId
    ? Number(editingAuction?.bidCount ?? 0) > 0 ||
      bids.some((b) => Number(b.auctionId) === Number(editingAuctionId))
    : false;

  const handleSubmit = async (e) => {
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
  };

  const handleCloseNow = async (auction) => {
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
  };

  const handleDelete = async (auction) => {
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publicar Subasta</span>
          </button>
          <button
            onClick={() => navigate('/auctions')}
            className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-[#EAFFD0] border border-[#224F10]/20 text-[#0D0D0D] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Vista Catálogo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Donezo KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#224F10] to-[#122B08] text-[#EAFFD0] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#EAFFD0]/90">
              Total Publicadas
            </span>
            <span className="w-7 h-7 rounded-full bg-[#EAFFD0]/15 text-[#B0E454] flex items-center justify-center">
              <Gavel className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-4xl font-bold tracking-tight my-2">
            {auctions.length}
          </p>
          <span className="text-[11px] text-[#EAFFD0]/75">
            {filteredAuctions.length} visibles con filtro actual
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-xs font-semibold text-[#0D0D0D]/75">
            Salas en Vivo
          </span>
          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-2">
            {activeAuctions.length}
          </p>
          <span className="text-[11px] text-[#224F10] font-semibold">
            Abiertas a pujas RN01
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-xs font-semibold text-[#0D0D0D]/75">
            Adjudicadas
          </span>
          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-2">
            {awardedAuctions.length}
          </p>
          <span className="text-[11px] text-[#0D0D0D]/55">
            Cierre con trato directo RN05
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-xs font-semibold text-[#0D0D0D]/75">
            Mis Publicaciones
          </span>
          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-2">
            {myAuctions.length}
          </p>
          <span className="text-[11px] text-[#0D0D0D]/55">
            Creadas con tu cuenta
          </span>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs font-medium border ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-[#EAFFD0] border-[#224F10]/20 text-[#224F10]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Inline Create / Edit Auction Panel */}
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
                {editingAuctionId && editingHasBids && !isAdmin
                  ? 'RN08: Esta subasta ya tiene pujas; el precio base queda bloqueado.'
                  : 'Define título, categoría, precio base e incremento mínimo.'}
              </p>
            </div>
            <button
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
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
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
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, category: e.target.value }))
                    }
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
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, status: e.target.value }))
                      }
                      className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#224F10]/25"
                    >
                      {isAdmin ? (
                        <>
                          <option value="activa">Activa</option>
                          <option value="finalizada">Finalizada</option>
                          <option value="cancelada">Cancelada</option>
                        </>
                      ) : editingAuction?.status === 'activa' && !editingHasBids ? (
                        <>
                          <option value="activa">Activa</option>
                          <option value="cancelada">Cancelada</option>
                        </>
                      ) : (
                        <option value={editingAuction?.status || 'activa'}>
                          {editingAuction?.status === 'finalizada'
                            ? 'Finalizada'
                            : editingAuction?.status === 'cancelada'
                              ? 'Cancelada'
                              : 'Activa'}
                        </option>
                      )}
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
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, endTime: e.target.value }))
                      }
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
                  disabled={Boolean(editingHasBids && !isAdmin)}
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, endTime: e.target.value }))
                  }
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
                  disabled={Boolean(editingAuctionId && editingHasBids && !isAdmin)}
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, basePrice: e.target.value }))
                  }
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
                  disabled={Boolean(editingAuctionId && editingHasBids && !isAdmin)}
                  value={formData.minIncrement}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, minIncrement: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, imageUrl: e.target.value }))
                  }
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
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
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

      {/* Donezo Filter Bar */}
      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {DASHBOARD_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                category === cat
                  ? 'bg-[#224F10] text-[#EAFFD0]'
                  : 'bg-[#F7FBF3] text-[#0D0D0D]/70 hover:bg-[#EAFFD0]'
              }`}
            >
              {cat}
            </button>
          ))}
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

      {/* Bento Grid of Auctions inside Dashboard */}
      {filteredAuctions.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-10 text-center text-xs text-[#0D0D0D]/60">
          No hay subastas que coincidan con la búsqueda actual.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAuctions.map((auction) => {
            const auctionBids = bids.filter(
              (b) => Number(b.auctionId) === Number(auction.id)
            );
            const bidsCount = Number(auction.bidCount ?? auctionBids.length);
            const seller = users.find(
              (u) => Number(u.id) === Number(auction.sellerId)
            );
            const countdown = formatCountdownFromNow(auction.endTime, nowMs);
            const isLive = auction.status === 'activa' && countdown !== '00:00:00';
            const canManage =
              isAdmin || Number(currentUser?.id) === Number(auction.sellerId);

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
                        {auction.status === 'cancelada'
                          ? 'Cancelada'
                          : isLive
                            ? countdown
                            : 'Finalizada'}
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
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 border ${
                          isLive
                            ? 'bg-[#EAFFD0] text-[#224F10] border-[#224F10]/20'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {auction.status === 'cancelada'
                          ? 'Cancelada'
                          : isLive
                            ? 'En subasta'
                            : 'Finalizada'}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#0D0D0D]/55 truncate">
                      {bidsCount} {bidsCount === 1 ? 'oferta' : 'ofertas'} · Vende:{' '}
                      {seller?.name || auction.sellerName || 'Socio'}
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
                          onClick={() => openEditForm(auction)}
                          title="Editar en el panel"
                          className="w-8 h-8 rounded-full border border-[#224F10]/15 hover:bg-[#EAFFD0] text-[#0D0D0D]/75 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(auction)}
                          title="Eliminar subasta"
                          className="w-8 h-8 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <button
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
