import { create } from 'zustand';
import { httpRequest, registerSessionReset } from '../../core/lib/apiClient';
import {
  findById,
  removeById,
  replaceById,
  sameId,
} from '../../core/utils/formatters';
import { useAuctionStore } from '../../auctions/states/auctionStore';

// Cuando cambia una puja, también cambia el precio actual de la subasta asociada
async function refreshAuctionAfterBid(auctionId) {
  const auctionStore = useAuctionStore.getState();
  await auctionStore.fetchAuctions();

  const detail = auctionStore.currentAuctionDetail;
  if (detail && sameId(detail.id, auctionId)) {
    await auctionStore.fetchAuctionById(auctionId);
  }
}

// Store global de pujas / ofertas (conecta con /api/bids)
export const useBidStore = create((set, get) => ({
  bids: [],
  loading: false,
  error: null,

  fetchBids: async () => {
    if (!localStorage.getItem('bidzone_token')) {
      set({ bids: [], loading: false });
      return [];
    }

    set({ loading: true, error: null });
    try {
      const data = await httpRequest('/bids');
      set({ bids: data, loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message });
      return [];
    }
  },

  createBid: async ({ auctionId, amount, note, commitmentAccepted }) => {
    set({ error: null });
    try {
      const body = {
        auctionId: Number(auctionId),
        amount: Number(amount),
        note: note ? note.trim() : '',
        commitmentAccepted: Boolean(commitmentAccepted),
      };

      const created = await httpRequest('/bids', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      set((state) => ({ bids: [created, ...state.bids] }));

      await refreshAuctionAfterBid(auctionId);
      return created;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateBid: async (id, updates) => {
    set({ error: null });
    try {
      const body = {};
      if (updates.amount !== undefined && updates.amount !== '') {
        body.amount = Number(updates.amount);
      }
      if (updates.note !== undefined) {
        body.note = String(updates.note).trim();
      }

      const updated = await httpRequest(`/bids/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      set((state) => ({
        bids: replaceById(state.bids, id, updated),
      }));

      await refreshAuctionAfterBid(updated.auctionId);
      return updated;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteBid: async (id) => {
    set({ error: null });
    const existingBid = findById(get().bids, id);

    try {
      await httpRequest(`/bids/${id}`, { method: 'DELETE' });
      set((state) => ({
        bids: removeById(state.bids, id),
      }));

      if (existingBid) {
        await refreshAuctionAfterBid(existingBid.auctionId);
      }
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));

registerSessionReset(() => {
  useBidStore.setState({ bids: [], error: null, loading: false });
});
