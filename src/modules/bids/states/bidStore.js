import { create } from 'zustand';
import { httpRequest, registerSessionReset } from '../../core/lib/apiClient';
import { useAuctionStore } from '../../auctions/states/auctionStore';

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
      const created = await httpRequest('/bids', {
        method: 'POST',
        body: JSON.stringify({
          auctionId: Number(auctionId),
          amount: Number(amount),
          note: note?.trim() || '',
          commitmentAccepted: Boolean(commitmentAccepted),
        }),
      });
      set((state) => ({ bids: [created, ...state.bids] }));

      const auctionState = useAuctionStore.getState();
      await auctionState.fetchAuctions();
      if (Number(auctionState.currentAuctionDetail?.id) === Number(auctionId)) {
        await auctionState.fetchAuctionById(auctionId);
      }
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
        bids: state.bids.map((b) => (Number(b.id) === Number(id) ? updated : b)),
      }));

      const auctionState = useAuctionStore.getState();
      await auctionState.fetchAuctions();
      if (
        Number(auctionState.currentAuctionDetail?.id) ===
        Number(updated.auctionId)
      ) {
        await auctionState.fetchAuctionById(updated.auctionId);
      }
      return updated;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteBid: async (id) => {
    set({ error: null });
    const existing = get().bids.find((b) => Number(b.id) === Number(id));
    try {
      await httpRequest(`/bids/${id}`, { method: 'DELETE' });
      set((state) => ({
        bids: state.bids.filter((b) => Number(b.id) !== Number(id)),
      }));

      const auctionState = useAuctionStore.getState();
      await auctionState.fetchAuctions();
      if (
        existing &&
        Number(auctionState.currentAuctionDetail?.id) ===
          Number(existing.auctionId)
      ) {
        await auctionState.fetchAuctionById(existing.auctionId);
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
