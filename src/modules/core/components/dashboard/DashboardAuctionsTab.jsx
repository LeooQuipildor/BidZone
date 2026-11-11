import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuctionStore } from '../../../auctions/states/auctionStore';
import { AuctionForm } from '../../../auctions/components/AuctionForm';
import { sameId, findById } from '../../utils/formatters';
import { DASHBOARD_CATEGORIES, filterAndSortAuctions } from './dashboardHelpers';
import { DashboardFeedback, DashboardFormPanel, DashboardStatCard } from './DashboardShared';
import { DashboardAuctionCard } from './DashboardAuctionCard';
import { Plus, ArrowUpRight, Gavel } from 'lucide-react';

export function DashboardAuctionsTab({ currentUser, users, auctions, bids, searchQuery, nowMs, prefill }) {
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

  const activeAuctions = auctions.filter((a) => a.status === 'activa');
  const awardedAuctions = auctions.filter((a) => a.status === 'finalizada' && a.winnerId);
  const myAuctions = auctions.filter((a) => sameId(a.sellerId, currentUser?.id));
  const filteredAuctions = filterAndSortAuctions(auctions, searchQuery, category, statusFilter, sortBy);

  const editingAuction = editingAuctionId ? findById(auctions, editingAuctionId) : null;
  const editingHasBids = Boolean(
    editingAuction &&
      (Number(editingAuction.bidCount ?? 0) > 0 || bids.some((b) => sameId(b.auctionId, editingAuction.id)))
  );

  function closeForm() {
    setFormOpen(false);
    setEditingAuctionId(null);
  }

  async function handleSaveForm(payload) {
    if (editingAuction) {
      await updateAuction(editingAuction.id, payload);
      setFeedback({ type: 'success', text: `Subasta #${editingAuction.id} actualizada correctamente.` });
    } else {
      const created = await createAuction(payload);
      setFeedback({ type: 'success', text: `Subasta "${created.title}" publicada en el panel sin salir de la vista.` });
    }
    closeForm();
  }

  async function handleCloseNow(auction) {
    const ok = window.confirm(
      `¿Confirmas cerrar y adjudicar ahora la subasta "${auction.title}"? Si hay postores se adjudicará al mejor postor (RN05).`
    );
    if (!ok) return;
    try {
      await closeAuctionNow(auction.id);
      setFeedback({ type: 'success', text: `Subasta "${auction.title}" finalizada y adjudicada.` });
      closeForm();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  }

  async function handleDelete(auction) {
    if (!window.confirm(`¿Confirmas eliminar la subasta "${auction.title}"?`)) return;
    try {
      await deleteAuction(auction.id);
      setFeedback({ type: 'success', text: `Subasta "${auction.title}" eliminada exitosamente.` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">Subastas y Lotes</h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">
            Explora salas en vivo, publica nuevos artículos y administra tus publicaciones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={() => { setEditingAuctionId(null); setFormOpen(true); setFeedback(null); }} className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Publicar Subasta</span>
          </button>
          <button type="button" onClick={() => navigate('/auctions')} className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-[#EAFFD0] border border-[#224F10]/20 text-[#0D0D0D] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer">
            <span>Vista Catálogo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard highlight title="Total Publicadas" icon={<Gavel className="w-3.5 h-3.5" />} value={auctions.length} subtitle={`${filteredAuctions.length} visibles`} />
        <DashboardStatCard title="Salas en Vivo" value={activeAuctions.length} subtitle="Abiertas a pujas RN01" subtitleClassName="text-[#224F10] font-semibold" />
        <DashboardStatCard title="Adjudicadas" value={awardedAuctions.length} subtitle="Cierre con trato directo RN05" />
        <DashboardStatCard title="Mis Publicaciones" value={myAuctions.length} subtitle="Creadas con tu cuenta" />
      </div>

      <DashboardFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      {formOpen && (
        <DashboardFormPanel title={editingAuction ? `Editar Subasta #${editingAuction.id}` : 'Publicar Nueva Subasta'} onClose={closeForm}>
          <AuctionForm
            key={editingAuction ? `${editingAuction.id}-${editingAuction.updatedAt || editingAuction.endTime}` : 'new'}
            auction={editingAuction}
            hasBids={editingHasBids}
            isAdmin={isAdmin}
            onSubmitForm={handleSaveForm}
            onCloseNow={editingAuction ? () => handleCloseNow(editingAuction) : null}
            onCancel={closeForm}
          />
        </DashboardFormPanel>
      )}

      {/* Filtros */}
      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {DASHBOARD_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                category === cat ? 'bg-[#224F10] text-[#EAFFD0]' : 'bg-[#F7FBF3] text-[#0D0D0D]/70 hover:bg-[#EAFFD0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none">
            <option value="todas">Estado: Todas las subastas</option>
            <option value="activa">Estado: En subasta (Activas)</option>
            <option value="finalizada">Estado: Finalizadas</option>
            <option value="cancelada">Estado: Canceladas</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none">
            <option value="endingSoon">Orden: Próximas a finalizar</option>
            <option value="priceAsc">Orden: Menor precio actual</option>
            <option value="priceDesc">Orden: Mayor precio actual</option>
          </select>
        </div>
      </div>

      {filteredAuctions.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-10 text-center text-xs text-[#0D0D0D]/60">
          No hay subastas que coincidan con la búsqueda actual.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAuctions.map((auction) => {
            const localCount = bids.filter((b) => sameId(b.auctionId, auction.id)).length;
            return (
              <DashboardAuctionCard
                key={auction.id}
                auction={auction}
                seller={findById(users, auction.sellerId)}
                bidsCount={Number(auction.bidCount ?? localCount)}
                nowMs={nowMs}
                canManage={isAdmin || sameId(currentUser?.id, auction.sellerId)}
                onEdit={(a) => { setEditingAuctionId(a.id); setFormOpen(true); setFeedback(null); }}
                onDelete={handleDelete}
                onOpenDetail={(id) => navigate(`/auctions/${id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
