import { create } from 'zustand';
import { httpRequest, registerSessionReset } from '../../core/lib/apiClient';
import { removeById, replaceById } from '../../core/utils/formatters';
import { useAuthStore } from '../../auth/states/authStore';

// Al cambiar una reseña, el backend recalcula la reputación promedio de los usuarios (RN07)
async function refreshUserReputations() {
  const authStore = useAuthStore.getState();
  await authStore.fetchUsers();
  await authStore.checkSession();
}

// Store global de calificaciones / reseñas RN07 (conecta con /api/reviews)
export const useReviewStore = create((set) => ({
  reviews: [],
  loading: false,
  error: null,

  fetchReviews: async () => {
    if (!localStorage.getItem('bidzone_token')) {
      set({ reviews: [], loading: false });
      return [];
    }

    set({ loading: true, error: null });
    try {
      const data = await httpRequest('/reviews');
      set({ reviews: data, loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message });
      return [];
    }
  },

  createReview: async (payload) => {
    set({ error: null });
    try {
      const body = {
        auctionId: Number(payload.auctionId),
        rating: Number(payload.rating),
        comment: payload.comment ? payload.comment.trim() : '',
      };
      if (payload.targetUserId) {
        body.targetUserId = Number(payload.targetUserId);
      }
      if (payload.roleContext) {
        body.roleContext = payload.roleContext;
      }

      const created = await httpRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      set((state) => ({ reviews: [created, ...state.reviews] }));

      await refreshUserReputations();
      return created;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateReview: async (id, updates) => {
    set({ error: null });
    try {
      const body = {};
      if (updates.rating !== undefined) body.rating = Number(updates.rating);
      if (updates.comment !== undefined) {
        body.comment = updates.comment ? updates.comment.trim() : '';
      }
      if (updates.roleContext !== undefined) body.roleContext = updates.roleContext;

      const updated = await httpRequest(`/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      set((state) => ({
        reviews: replaceById(state.reviews, id, updated),
      }));

      await refreshUserReputations();
      return updated;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteReview: async (id) => {
    set({ error: null });
    try {
      await httpRequest(`/reviews/${id}`, { method: 'DELETE' });
      set((state) => ({
        reviews: removeById(state.reviews, id),
      }));

      await refreshUserReputations();
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));

registerSessionReset(() => {
  useReviewStore.setState({ reviews: [], error: null, loading: false });
});
