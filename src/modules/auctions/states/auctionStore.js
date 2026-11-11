import { create } from 'zustand';
import { httpRequest, registerSessionReset } from '../../core/lib/apiClient';
import { removeById, replaceById, sameId, toIsoFromLocalInput, upsertById } from '../../core/utils/formatters';
import { useNotificationStore } from '../../notifications/states/notificationStore';

const UPDATABLE_TEXT_FIELDS = ['title', 'description', 'category', 'imageUrl', 'status'];

// Store global de subastas (conecta con /api/auctions)
export const useAuctionStore = create((set, get) => ({
  auctions: [],
  currentAuctionDetail: null,
  loading: false,
  detailLoading: false,
  error: null,
  filters: { search: '', category: 'Todas', status: 'todas', sortBy: 'endingSoon' },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
  },

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
        auctions: upsertById(state.auctions, data),
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
      const body = {
        title: payload.title,
        description: payload.description || '',
        category: payload.category || 'Tecnología',
        imageUrl: payload.imageUrl ? payload.imageUrl.trim() : '',
        basePrice: Number(payload.basePrice),
        minIncrement: Number(payload.minIncrement),
        endTime: toIsoFromLocalInput(payload.endTime) || payload.endTime,
      };
      const created = await httpRequest('/auctions', { method: 'POST', body: JSON.stringify(body) });
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
      for (const field of UPDATABLE_TEXT_FIELDS) {
        if (updates[field] !== undefined) body[field] = updates[field];
      }
      if (updates.basePrice !== undefined && updates.basePrice !== '') body.basePrice = Number(updates.basePrice);
      if (updates.minIncrement !== undefined && updates.minIncrement !== '') body.minIncrement = Number(updates.minIncrement);
      if (updates.endTime !== undefined && updates.endTime !== '') {
        body.endTime = toIsoFromLocalInput(updates.endTime) || updates.endTime;
      }

      const updated = await httpRequest(`/auctions/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      set((state) => ({ auctions: replaceById(state.auctions, id, updated) }));

      const detail = get().currentAuctionDetail;
      if (detail && sameId(detail.id, id)) await get().fetchAuctionById(id);
      return updated;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  closeAuctionNow: async (id) => {
    set({ error: null });
    try {
      const closed = await httpRequest(`/auctions/${id}/close`, { method: 'POST' });
      set((state) => ({ auctions: replaceById(state.auctions, id, closed) }));

      const detail = get().currentAuctionDetail;
      if (detail && sameId(detail.id, id)) await get().fetchAuctionById(id);

      // Al cerrar la subasta el backend crea notificaciones (RN05)
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
      set((state) => {
        const isViewingDeleted = state.currentAuctionDetail && sameId(state.currentAuctionDetail.id, id);
        return {
          auctions: removeById(state.auctions, id),
          currentAuctionDetail: isViewingDeleted ? null : state.currentAuctionDetail,
        };
      });
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));

registerSessionReset(() => {
  useAuctionStore.setState({ currentAuctionDetail: null, error: null });
});
