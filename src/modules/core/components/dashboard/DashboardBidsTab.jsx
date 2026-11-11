import React, { useState } from 'react';
import { useBidStore } from '../../../bids/states/bidStore';
import { BidForm } from '../../../bids/components/BidForm';
import { formatCurrency, sameId, findById, matchesSearch } from '../../utils/formatters';
import { DashboardFeedback, DashboardFormPanel, DashboardStatCard } from './DashboardShared';
import { DashboardBidRow } from './DashboardBidRow';
import { Plus, TrendingUp } from 'lucide-react';

const SCOPE_OPTIONS = [
  { id: 'todas', label: 'Todas las ofertas' },
  { id: 'mias', label: 'Solo mis pujas' },
];

export function DashboardBidsTab({ currentUser, users, auctions, bids, searchQuery }) {
  const createBid = useBidStore((s) => s.createBid);
  const updateBid = useBidStore((s) => s.updateBid);
  const deleteBid = useBidStore((s) => s.deleteBid);

  const isAdmin = currentUser?.role === 'admin';
  const [scopeFilter, setScopeFilter] = useState('todas');
  const [auctionFilter, setAuctionFilter] = useState('todas');
  const [feedback, setFeedback] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBidId, setEditingBidId] = useState(null);

  const editingBid = editingBidId ? findById(bids, editingBidId) : null;
  const myBids = bids.filter((b) => sameId(b.bidderId, currentUser?.id));
  const leadingBidsCount = bids.filter((bid) => {
    const auction = findById(auctions, bid.auctionId);
    return auction && Number(auction.currentPrice) === Number(bid.amount);
  }).length;

  let highestBidAmount = 0;
  for (const bid of bids) {
    if (Number(bid.amount) > highestBidAmount) highestBidAmount = Number(bid.amount);
  }

  const filteredBids = bids.filter((bid) => {
    const auction = findById(auctions, bid.auctionId);
    const bidder = findById(users, bid.bidderId);
    const matchScope = scopeFilter === 'todas' || sameId(bid.bidderId, currentUser?.id);
    const matchAuction = auctionFilter === 'todas' || sameId(bid.auctionId, auctionFilter);
    const matchQuery = matchesSearch([auction?.title || bid.auctionTitle, bidder?.name || bid.bidderName, bid.note], searchQuery);
    return matchScope && matchAuction && matchQuery;
  });

  function closeForm() {
    setFormOpen(false);
    setEditingBidId(null);
  }

  function handleSaved(_record, savedAmount) {
    setFeedback({
      type: 'success',
      text: editingBid
        ? `Registro de puja #${editingBid.id} actualizado.`
        : `Oferta vinculante de ${formatCurrency(savedAmount)} registrada correctamente.`,
    });
    closeForm();
  }

  async function handleDelete(bid) {
    if (!window.confirm(`¿Confirmas eliminar el registro de puja #${bid.id} por ${formatCurrency(bid.amount)}?`)) return;
    try {
      await deleteBid(bid.id);
      setFeedback({ type: 'success', text: `Puja #${bid.id} eliminada y precio de subasta recalculado.` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">Historial de Pujas</h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">Registro auditable de ofertas vinculantes (RN01 a RN04) actualizado en vivo.</p>
        </div>

        <button type="button" onClick={() => { setEditingBidId(null); setFormOpen(true); setFeedback(null); }} className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start md:self-auto">
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Puja</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard highlight title="Total de Pujas" icon={<TrendingUp className="w-3.5 h-3.5" />} value={bids.length} subtitle="Ofertas registradas en sala" />
        <DashboardStatCard title="Mis Pujas" value={myBids.length} subtitle="Con compromiso RN04" subtitleClassName="text-[#224F10] font-semibold" />
        <DashboardStatCard title="Ofertas Líderes" value={leadingBidsCount} subtitle="Encabezando subastas" />
        <DashboardStatCard title="Puja Más Alta" value={formatCurrency(highestBidAmount)} valueClassName="text-2xl sm:text-3xl text-[#224F10] truncate tabular-nums" subtitle="Récord de la plataforma" />
      </div>

      <DashboardFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      {formOpen && (
        <DashboardFormPanel title={editingBid ? `Editar Puja #${editingBid.id}` : 'Registrar Nueva Puja Vinculante'} onClose={closeForm}>
          <BidForm
            key={editingBid ? editingBid.id : 'new'}
            bid={editingBid}
            auctions={auctions}
            currentUserId={currentUser?.id}
            isAdmin={isAdmin}
            onCreateBid={createBid}
            onUpdateBid={updateBid}
            onSaved={handleSaved}
            onCancel={closeForm}
          />
        </DashboardFormPanel>
      )}

      {/* Filtros */}
      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          {SCOPE_OPTIONS.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setScopeFilter(btn.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                scopeFilter === btn.id ? 'bg-[#224F10] text-[#EAFFD0]' : 'bg-[#F7FBF3] text-[#0D0D0D]/70 hover:bg-[#EAFFD0]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <select value={auctionFilter} onChange={(e) => setAuctionFilter(e.target.value)} className="sm:max-w-xs w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none">
          <option value="todas">Todas las subastas</option>
          {auctions.map((a) => (
            <option key={a.id} value={String(a.id)}>#{a.id} — {a.title}</option>
          ))}
        </select>
      </div>

      {filteredBids.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-10 text-center text-xs text-[#0D0D0D]/60">
          No hay pujas registradas para el filtro actual.
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 divide-y divide-[#224F10]/8 shadow-2xs overflow-hidden">
          {filteredBids.map((bid) => {
            const auction = findById(auctions, bid.auctionId);
            const bidder = findById(users, bid.bidderId);
            return (
              <DashboardBidRow
                key={bid.id}
                bid={bid}
                auctionTitle={auction?.title || bid.auctionTitle || `Subasta #${bid.auctionId}`}
                bidderName={bidder?.name || bid.bidderName || `Usuario #${bid.bidderId}`}
                isTop={Boolean(auction && Number(auction.currentPrice) === Number(bid.amount))}
                canEdit={isAdmin || sameId(currentUser?.id, bid.bidderId)}
                isAdmin={isAdmin}
                onEdit={() => { setEditingBidId(bid.id); setFormOpen(true); setFeedback(null); }}
                onDelete={() => handleDelete(bid)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
