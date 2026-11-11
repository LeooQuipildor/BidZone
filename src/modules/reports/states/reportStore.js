import { create } from 'zustand';
import { httpRequest, registerSessionReset } from '../../core/lib/apiClient';
import { removeById, replaceById } from '../../core/utils/formatters';
import { useAuthStore } from '../../auth/states/authStore';
import { useNotificationStore } from '../../notifications/states/notificationStore';

// Store global de reportes e infracciones RN06 (conecta con /api/reports)
export const useReportStore = create((set) => ({
  reports: [],
  loading: false,
  error: null,

  fetchReports: async () => {
    if (!localStorage.getItem('bidzone_token')) {
      set({ reports: [], loading: false });
      return [];
    }

    set({ loading: true, error: null });
    try {
      const data = await httpRequest('/reports');
      set({ reports: data, loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message });
      return [];
    }
  },

  createReport: async (payload) => {
    set({ error: null });
    try {
      const body = {
        auctionId: Number(payload.auctionId),
        reportedUserId: Number(payload.reportedUserId),
        reason: payload.reason ? payload.reason.trim() : '',
        description: payload.description ? payload.description.trim() : '',
        evidenceUrl: payload.evidenceUrl ? payload.evidenceUrl.trim() : '',
      };

      const created = await httpRequest('/reports', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      set((state) => ({ reports: [created, ...state.reports] }));
      return created;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateReport: async (id, updates) => {
    set({ error: null });
    try {
      const body = {};
      if (updates.reason !== undefined) body.reason = updates.reason;
      if (updates.description !== undefined) body.description = updates.description;
      if (updates.evidenceUrl !== undefined) body.evidenceUrl = updates.evidenceUrl;
      if (updates.status !== undefined) body.status = updates.status;
      if (updates.sanctionApplied !== undefined) {
        body.sanctionApplied = updates.sanctionApplied;
      }
      if (updates.accountAction !== undefined) {
        body.accountAction = updates.accountAction;
      }

      const updated = await httpRequest(`/reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      set((state) => ({
        reports: replaceById(state.reports, id, updated),
      }));

      // Al resolver un reporte puede cambiar el estado del usuario denunciado y generar notificaciones
      await useAuthStore.getState().fetchUsers();
      if (localStorage.getItem('bidzone_token')) {
        await useNotificationStore.getState().fetchNotifications();
      }
      return updated;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteReport: async (id) => {
    set({ error: null });
    try {
      await httpRequest(`/reports/${id}`, { method: 'DELETE' });
      set((state) => ({
        reports: removeById(state.reports, id),
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));

registerSessionReset(() => {
  useReportStore.setState({ reports: [], error: null, loading: false });
});
