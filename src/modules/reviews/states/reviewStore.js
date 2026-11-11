import { create } from 'zustand';
import { httpRequest, registerSessionReset } from '../../core/lib/apiClient';
import { useAuthStore } from '../../auth/states/authStore';

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
      const created = await httpRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          auctionId: Number(payload.auctionId),
          ...(payload.targetUserId
            ? { targetUserId: Number(payload.targetUserId) }
            : {}),
          ...(payload.roleContext ? { roleContext: payload.roleContext } : {}),
          rating: Number(payload.rating),
          comment: payload.comment?.trim() || '',
        }),
      });
      set((state) => ({ reviews: [created, ...state.reviews] }));
      await useAuthStore.getState().fetchUsers();
      await useAuthStore.getState().checkSession();
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
      if (updates.comment !== undefined) body.comment = updates.comment?.trim();
      if (updates.roleContext !== undefined) body.roleContext = updates.roleContext;

      const updated = await httpRequest(`/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      set((state) => ({
        reviews: state.reviews.map((rv) =>
          Number(rv.id) === Number(id) ? updated : rv
        ),
      }));
      await useAuthStore.getState().fetchUsers();
      await useAuthStore.getState().checkSession();
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
        reviews: state.reviews.filter((rv) => Number(rv.id) !== Number(id)),
      }));
      await useAuthStore.getState().fetchUsers();
      await useAuthStore.getState().checkSession();
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));

registerSessionReset(() => {
  useReviewStore.setState({ reviews: [], error: null, loading: false });
});
