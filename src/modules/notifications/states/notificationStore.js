import { create } from 'zustand';
import { httpRequest, registerSessionReset } from '../../core/lib/apiClient';
import { removeById, sameId } from '../../core/utils/formatters';

// Store global de notificaciones del usuario (conecta con /api/notifications)
export const useNotificationStore = create((set) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async () => {
    if (!localStorage.getItem('bidzone_token')) {
      set({ notifications: [], loading: false });
      return [];
    }

    set({ loading: true, error: null });
    try {
      const data = await httpRequest('/notifications');
      set({ notifications: data, loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message });
      return [];
    }
  },

  markAsRead: async (id) => {
    set({ error: null });
    try {
      const updated = await httpRequest(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
      set((state) => ({
        notifications: state.notifications.map((notif) => {
          if (sameId(notif.id, id)) {
            return { ...notif, ...updated, read: true };
          }
          return notif;
        }),
      }));
      return updated;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  markAllAsRead: async () => {
    set({ error: null });
    try {
      await httpRequest('/notifications/read-all', {
        method: 'PATCH',
      });
      set((state) => ({
        notifications: state.notifications.map((notif) => ({
          ...notif,
          read: true,
        })),
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteNotification: async (id) => {
    set({ error: null });
    try {
      await httpRequest(`/notifications/${id}`, { method: 'DELETE' });
      set((state) => ({
        notifications: removeById(state.notifications, id),
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));

registerSessionReset(() => {
  useNotificationStore.setState({
    notifications: [],
    error: null,
    loading: false,
  });
});
