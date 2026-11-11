import { create } from 'zustand';
import { httpRequest, registerSessionReset } from '../../core/lib/apiClient';
import { toIsoFromLocalInput } from '../../core/utils/formatters';
import { useNotificationStore } from '../../notifications/states/notificationStore';

export const useAuctionStore = create((set, get) => ({
  auctions: [],
  currentAuctionDetail: null,
  loading: false,
  detailLoading: false,
  error: null,
  filters: {
    search: '',
    category: 'Todas',
    status: 'todas',
    sortBy: 'endingSoon',
  },

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  fetchAuctions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await httpRequest('/auctions');
      set({ auctions: data, loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message });
      return [];
    }
  },

  fetchAuctionById: async (id) => {
    set({ detailLoading: true, error: null });
    try {
      const data = await httpRequest(`/auctions/${id}`);
      set((state) => ({
        currentAuctionDetail: data,
        detailLoading: false,
        auctions: state.auctions.some((a) => Number(a.id) === Number(data.id))
          ? state.auctions.map((a) => (Number(a.id) === Number(data.id) ? data : a))
          : [data, ...state.auctions],
      }));
      return data;
    } catch (err) {
      set({ currentAuctionDetail: null, detailLoading: false, error: err.message });
      return null;
    }
  },

  createAuction: async (payload) => {
    set({ error: null });
    try {
      const endTimeIso = toIsoFromLocalInput(payload.endTime) || payload.endTime;
      const created = await httpRequest('/auctions', {
        method: 'POST',
        body: JSON.stringify({
          title: payload.title,
          description: payload.description || '',
          category: payload.category || 'Tecnología',
          imageUrl: payload.imageUrl?.trim() || '',
          basePrice: Number(payload.basePrice),
          minIncrement: Number(payload.minIncrement),
          endTime: endTimeIso,
        }),
      });
      set((state) => ({ auctions: [created, ...state.auctions] }));
      return created;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateAuction: async (id, updates) => {
    set({ error: null });
    try {
      const body = {};
      if (updates.title !== undefined) body.title = updates.title;
      if (updates.description !== undefined) body.description = updates.description;
      if (updates.category !== undefined) body.category = updates.category;
      if (updates.imageUrl !== undefined) body.imageUrl = updates.imageUrl;
      if (updates.basePrice !== undefined && updates.basePrice !== '') {
        body.basePrice = Number(updates.basePrice);
      }
      if (updates.minIncrement !== undefined && updates.minIncrement !== '') {
        body.minIncrement = Number(updates.minIncrement);
      }
      if (updates.status !== undefined) body.status = updates.status;
      if (updates.endTime !== undefined && updates.endTime !== '') {
        body.endTime = toIsoFromLocalInput(updates.endTime) || updates.endTime;
      }

      const updated = await httpRequest(`/auctions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      set((state) => ({
        auctions: state.auctions.map((a) =>
          Number(a.id) === Number(id) ? updated : a
        ),
      }));

      if (Number(get().currentAuctionDetail?.id) === Number(id)) {
        await get().fetchAuctionById(id);
      }
      return updated;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  closeAuctionNow: async (id) => {
    set({ error: null });
    try {
      const closed = await httpRequest(`/auctions/${id}/close`, {
        method: 'POST',
      });
      set((state) => ({
        auctions: state.auctions.map((a) =>
          Number(a.id) === Number(id) ? closed : a
        ),
      }));
      if (Number(get().currentAuctionDetail?.id) === Number(id)) {
        await get().fetchAuctionById(id);
      }
      if (localStorage.getItem('bidzone_token')) {
        await useNotificationStore.getState().fetchNotifications();
      }
      return closed;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteAuction: async (id) => {
    set({ error: null });
    try {
      await httpRequest(`/auctions/${id}`, { method: 'DELETE' });
      set((state) => ({
        auctions: state.auctions.filter((a) => Number(a.id) !== Number(id)),
        currentAuctionDetail:
          Number(state.currentAuctionDetail?.id) === Number(id)
            ? null
            : state.currentAuctionDetail,
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));

registerSessionReset(() => {
  useAuctionStore.setState({ currentAuctionDetail: null, error: null });
});
