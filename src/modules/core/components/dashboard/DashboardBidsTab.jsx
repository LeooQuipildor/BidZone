import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBidStore } from '../../../bids/states/bidStore';
import { BidConfirmModal } from '../../../bids/components/BidConfirmModal';
import {
  formatCurrency,
  formatDateTime,
  sameId,
  findById,
  pickValidId,
  matchesSearch,
  getSuggestedBidAmount,
  getMaxBidAmount,
  validateBidInput,
} from '../../utils/formatters';
import { getInitials } from './dashboardHelpers';
import { DashboardFeedback, DashboardStatCard } from './DashboardShared';
import {
  Plus,
  X,
  TrendingUp,
  Gavel,
  ExternalLink,
  Edit3,
  Trash2,
  Save,
} from 'lucide-react';

export function DashboardBidsTab({
  currentUser,
  users,
  auctions,
  bids,
  searchQuery,
}) {
  const createBid = useBidStore((s) => s.createBid);
  const updateBid = useBidStore((s) => s.updateBid);
  const deleteBid = useBidStore((s) => s.deleteBid);

  const isAdmin = currentUser?.role === 'admin';
  const activeAuctions = auctions.filter((a) => a.status === 'activa');

  const [scopeFilter, setScopeFilter] = useState('todas');
  const [auctionFilter, setAuctionFilter] = useState('todas');
  const [feedback, setFeedback] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBidId, setEditingBidId] = useState(null);

  const [formAuctionId, setFormAuctionId] = useState('');
  const [formAmountInput, setFormAmountInput] = useState(null);
  const [formNote, setFormNote] = useState('');
  const [commitmentAccepted, setCommitmentAccepted] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  // Si estamos creando, garantizamos que la subasta elegida siga activa
  const effectiveAuctionId = editingBidId
    ? formAuctionId
    : pickValidId(activeAuctions, formAuctionId);

  const selectedAuctionForForm = findById(auctions, effectiveAuctionId);
  const suggestedAmount = getSuggestedBidAmount(selectedAuctionForForm);
  const maxBidAmount = getMaxBidAmount(selectedAuctionForForm);
  const formAmount =
    formAmountInput !== null ? formAmountInput : suggestedAmount;

  // Estadísticas rápidas del historial de pujas
  const myBids = bids.filter((b) => sameId(b.bidderId, currentUser?.id));
  const leadingBidsCount = bids.filter((bid) => {
    const auction = findById(auctions, bid.auctionId);
    return auction && Number(auction.currentPrice) === Number(bid.amount);
  }).length;

  let highestBidAmount = 0;
  for (const bid of bids) {
    if (Number(bid.amount) > highestBidAmount) {
      highestBidAmount = Number(bid.amount);
    }
  }

  // Filtrado por dueño, subasta elegida y buscador
  const filteredBids = bids.filter((bid) => {
    const auction = findById(auctions, bid.auctionId);
    const bidder = findById(users, bid.bidderId);

    const matchScope =
      scopeFilter === 'todas' || sameId(bid.bidderId, currentUser?.id);
    const matchAuction =
      auctionFilter === 'todas' || sameId(bid.auctionId, auctionFilter);
    const matchQuery = matchesSearch(
      [
        auction?.title || bid.auctionTitle,
        bidder?.name || bid.bidderName,
        bid.note,
      ],
      searchQuery
    );

    return matchScope && matchAuction && matchQuery;
  });

  function openCreateForm() {
    setEditingBidId(null);
    const primeraActiva = activeAuctions[0];
    setFormAuctionId(primeraActiva ? String(primeraActiva.id) : '');
    setFormAmountInput(null);
    setFormNote('');
    setCommitmentAccepted(true);
    setFormOpen(true);
    setFeedback(null);
  }

  function openEditForm(bid) {
    setEditingBidId(bid.id);
    setFormAuctionId(String(bid.auctionId));
    setFormAmountInput(String(bid.amount));
    setFormNote(bid.note || '');
    setCommitmentAccepted(true);
    setFormOpen(true);
    setFeedback(null);
  }

  function handleAuctionSelect(value) {
    setFormAuctionId(value);
    if (!editingBidId) {
      setFormAmountInput(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);

    if (editingBidId) {
      try {
        const payload = isAdmin
          ? { amount: Number(formAmount), note: formNote.trim() }
          : { note: formNote.trim() };

        await updateBid(editingBidId, payload);
        setFeedback({
          type: 'success',
          text: `Registro de puja #${editingBidId} actualizado.`,
        });
        setFormOpen(false);
        setEditingBidId(null);
      } catch (err) {
        setFeedback({ type: 'error', text: err.message });
      }
      return;
    }

    // Validamos las reglas de oferta antes de mostrar el modal de confirmación
    const validationError = validateBidInput({
      auction: selectedAuctionForForm,
      amount: formAmount,
      commitmentAccepted,
      checkMax: true,
    });

    if (validationError) {
      setFeedback({ type: 'error', text: validationError });
      return;
    }

    setShowConfirmModal(true);
  }

  async function handleConfirmBid() {
    setIsSubmittingBid(true);
    setFeedback(null);

    try {
      await createBid({
        auctionId: effectiveAuctionId,
        bidderId: currentUser.id,
        amount: formAmount,
        note: formNote,
        commitmentAccepted,
      });
      setFeedback({
        type: 'success',
        text: `Oferta vinculante de ${formatCurrency(formAmount)} registrada correctamente.`,
      });
      setShowConfirmModal(false);
      setFormOpen(false);
      setEditingBidId(null);
    } catch (err) {
      setShowConfirmModal(false);
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setIsSubmittingBid(false);
    }
  }

  async function handleDelete(bid) {
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
  }

  const auctionOptionsForForm = editingBidId ? auctions : activeAuctions;
  const formListUnavailable = !editingBidId && activeAuctions.length === 0;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
            Historial de Pujas
          </h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">
            Registro auditable de ofertas vinculantes (RN01 a RN04) actualizado
            en vivo dentro del panel.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Puja</span>
        </button>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard
          highlight
          title="Total de Pujas"
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          value={bids.length}
          subtitle="Ofertas registradas en sala"
        />
        <DashboardStatCard
          title="Mis Pujas"
          value={myBids.length}
          subtitle="Con compromiso RN04"
          subtitleClassName="text-[#224F10] font-semibold"
        />
        <DashboardStatCard
          title="Ofertas Líderes"
          value={leadingBidsCount}
          subtitle="Encabezando subastas"
        />
        <DashboardStatCard
          title="Puja Más Alta"
          value={formatCurrency(highestBidAmount)}
          valueClassName="text-2xl sm:text-3xl text-[#224F10] truncate tabular-nums"
          subtitle="Récord de la plataforma"
        />
      </div>

      <DashboardFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      {/* Formulario para crear o editar una puja */}
      {formOpen && (
        <div className="rounded-2xl bg-white border border-[#224F10]/20 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-[#224F10]/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0D0D0D]">
                {editingBidId
                  ? `Editar Puja #${editingBidId}`
                  : 'Registrar Nueva Puja Vinculante'}
              </h2>
              <p className="text-[11px] text-[#0D0D0D]/60">
                {editingBidId && !isAdmin
                  ? 'RN04: El monto ofertado es irrevocable; puedes editar tu nota de entrega.'
                  : 'La oferta debe superar el precio actual más el incremento mínimo (RN01).'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditingBidId(null);
              }}
              className="w-8 h-8 rounded-full bg-[#F7FBF3] hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formListUnavailable ? (
            <p className="text-xs text-[#0D0D0D]/60 py-2">
              No hay subastas activas disponibles para ofertar en este momento.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                    Subasta *
                  </label>
                  <select
                    disabled={Boolean(editingBidId)}
                    value={effectiveAuctionId}
                    onChange={(e) => handleAuctionSelect(e.target.value)}
                    className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] disabled:opacity-60 focus:outline-none"
                  >
                    {auctionOptionsForForm.map((a) => (
                      <option key={a.id} value={String(a.id)}>
                        {a.title} (Actual: {formatCurrency(a.currentPrice)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                    Monto de la Oferta (ARS) *
                  </label>
                  <input
                    type="number"
                    disabled={Boolean(editingBidId && !isAdmin)}
                    value={formAmount}
                    onChange={(e) => setFormAmountInput(e.target.value)}
                    max={maxBidAmount}
                    className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs font-semibold text-[#0D0D0D] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#224F10]/25"
                  />
                  {selectedAuctionForForm && !editingBidId && (
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-[#224F10] font-medium">
                        Mínimo sugerido RN01: {formatCurrency(suggestedAmount)}
                      </p>
                      <p className="text-[10px] text-[#0D0D0D]/60 font-medium">
                        Máximo permitido (10x precio inicial):{' '}
                        {formatCurrency(maxBidAmount)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Nota de Coordinación / Observación
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Ej: Retiro en persona / transferencia inmediata al cierre..."
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#224F10]/25"
                />
              </div>

              {!editingBidId && (
                <label className="flex items-center gap-2 text-xs text-[#0D0D0D]/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={commitmentAccepted}
                    onChange={(e) => setCommitmentAccepted(e.target.checked)}
                    className="accent-[#224F10] w-4 h-4 rounded"
                  />
                  <span>
                    Acepto el compromiso vinculante e irrevocable de compra
                    (RN04).
                  </span>
                </label>
              )}

              <div className="flex justify-end gap-2 pt-1">
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
                  {editingBidId ? 'Guardar Nota' : 'Confirmar Puja'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Filtros de búsqueda */}
      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScopeFilter('todas')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              scopeFilter === 'todas'
                ? 'bg-[#224F10] text-[#EAFFD0]'
                : 'bg-[#F7FBF3] text-[#0D0D0D]/70 hover:bg-[#EAFFD0]'
            }`}
          >
            Todas las ofertas
          </button>
          <button
            type="button"
            onClick={() => setScopeFilter('mias')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              scopeFilter === 'mias'
                ? 'bg-[#224F10] text-[#EAFFD0]'
                : 'bg-[#F7FBF3] text-[#0D0D0D]/70 hover:bg-[#EAFFD0]'
            }`}
          >
            Solo mis pujas
          </button>
        </div>

        <select
          value={auctionFilter}
          onChange={(e) => setAuctionFilter(e.target.value)}
          className="sm:max-w-xs w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none"
        >
          <option value="todas">Todas las subastas</option>
          {auctions.map((a) => (
            <option key={a.id} value={String(a.id)}>
              #{a.id} — {a.title}
            </option>
          ))}
        </select>
      </div>

      {/* Listado de pujas */}
      {filteredBids.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-10 text-center text-xs text-[#0D0D0D]/60">
          No hay pujas registradas para el filtro actual.
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 divide-y divide-[#224F10]/8 shadow-2xs overflow-hidden">
          {filteredBids.map((bid) => {
            const auction = findById(auctions, bid.auctionId);
            const bidder = findById(users, bid.bidderId);
            const isTop =
              auction && Number(auction.currentPrice) === Number(bid.amount);
            const canEdit =
              isAdmin || sameId(currentUser?.id, bid.bidderId);

            const avatarStyle = isTop
              ? 'bg-[#224F10] text-[#B0E454]'
              : 'bg-[#EAFFD0] text-[#224F10]';
            const topBadgeStyle = isTop
              ? 'bg-[#B0E454] text-[#0D0D0D]'
              : 'bg-[#F1F8E9] text-[#224F10]';

            return (
              <div
                key={bid.id}
                className="p-4 sm:p-5 hover:bg-[#F7FBF3]/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatarStyle}`}
                  >
                    {getInitials(bidder?.name || bid.bidderName, 'PU')}
                  </span>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${topBadgeStyle}`}
                      >
                        {isTop ? 'Oferta Líder' : `Puja #${bid.id}`}
                      </span>
                      <Link
                        to={`/auctions/${bid.auctionId}`}
                        className="text-sm font-bold text-[#0D0D0D] hover:text-[#224F10] inline-flex items-center gap-1 truncate"
                      >
                        <Gavel className="w-3.5 h-3.5 text-[#224F10] shrink-0" />
                        <span className="truncate">
                          {auction?.title ||
                            bid.auctionTitle ||
                            `Subasta #${bid.auctionId}`}
                        </span>
                        <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
                      </Link>
                    </div>

                    <p className="text-xs text-[#0D0D0D]/70">
                      Postor:{' '}
                      <strong className="text-[#0D0D0D]">
                        {bidder?.name ||
                          bid.bidderName ||
                          `Usuario #${bid.bidderId}`}
                      </strong>{' '}
                      · &ldquo;{bid.note || 'Sin nota adicional'}&rdquo;
                    </p>
                    <p className="text-[11px] text-[#0D0D0D]/50">
                      {formatDateTime(bid.createdAt)} · Compromiso RN04 aceptado
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#224F10]/10 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/45 block">
                      Ofertado
                    </span>
                    <span className="text-xl font-bold text-[#224F10] tabular-nums">
                      {formatCurrency(bid.amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => openEditForm(bid)}
                        title="Editar puja"
                        className="w-8 h-8 rounded-full border border-[#224F10]/15 hover:bg-[#EAFFD0] text-[#0D0D0D]/75 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(bid)}
                        title="Eliminar puja"
                        className="w-8 h-8 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal compartido para confirmar oferta (RN04) */}
      <BidConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmBid}
        isSubmitting={isSubmittingBid}
        auction={selectedAuctionForForm}
        bidAmount={formAmount}
        bidNote={formNote}
      />
    </div>
  );
}
