import { create } from 'zustand';
import { loadLocalDb, saveLocalDb, httpRequest } from '../../core/lib/apiClient';
import { useAuthStore } from '../../auth/states/authStore';

export const useReportStore = create((set) => ({
  reports: loadLocalDb().reports,
  loading: false,
  error: null,

  fetchReports: async () => {
    set({ loading: true, error: null });
    try {
      const data = await httpRequest('/reports');
      set({ reports: data, loading: false });
      return data;
    } catch {
      const db = loadLocalDb();
      set({ reports: db.reports, loading: false });
      return db.reports;
    }
  },

  createReport: async (payload) => {
    const db = loadLocalDb();

    if (!payload.auctionId)
      throw new Error('Debes seleccionar la subasta involucrada.');
    if (!payload.reportedUserId)
      throw new Error('Debes indicar el usuario denunciado.');
    if (!payload.reason?.trim())
      throw new Error('El motivo del reclamo es obligatorio.');
    if (!payload.description?.trim())
      throw new Error('La descripción detallada del incumplimiento es obligatoria.');

    const newReport = {
      id: Date.now(),
      auctionId: Number(payload.auctionId),
      reporterId: Number(payload.reporterId),
      reportedUserId: Number(payload.reportedUserId),
      reason: payload.reason.trim(),
      description: payload.description.trim(),
      evidenceUrl: payload.evidenceUrl?.trim() || '',
      status: payload.status || 'en_revision',
      sanctionApplied: payload.sanctionApplied || 'Pendiente de evaluación',
      createdAt: new Date().toISOString(),
    };

    db.reports.unshift(newReport);

    db.notifications.unshift({
      id: Date.now() + 1,
      userId: Number(payload.reportedUserId),
      title: 'Nuevo reporte de incumplimiento registrado',
      message: `Se ha abierto un expediente de mediación (#${newReport.id}) por "${newReport.reason}".`,
      type: 'report',
      read: false,
      createdAt: new Date().toISOString(),
    });

    saveLocalDb(db);
    set({ reports: db.reports });
    return newReport;
  },

  updateReport: async (id, updates) => {
    const db = loadLocalDb();
    const idx = db.reports.findIndex((r) => Number(r.id) === Number(id));
    if (idx === -1) throw new Error('Reporte no encontrado.');

    const updated = {
      ...db.reports[idx],
      ...updates,
      id: db.reports[idx].id,
    };
    db.reports[idx] = updated;

    // RN06: Si se aplica sanción o cierre de cuenta al usuario infractor
    if (
      updates.status === 'resuelto_sancion' ||
      updates.accountAction === 'suspend' ||
      updates.accountAction === 'close'
    ) {
      const userIdx = db.users.findIndex(
        (u) => Number(u.id) === Number(updated.reportedUserId)
      );
      if (userIdx !== -1) {
        db.users[userIdx].status =
          updates.accountAction === 'close' ? 'closed' : 'suspended';
      }
    } else if (updates.accountAction === 'activate') {
      const userIdx = db.users.findIndex(
        (u) => Number(u.id) === Number(updated.reportedUserId)
      );
      if (userIdx !== -1) {
        db.users[userIdx].status = 'active';
      }
    }

    saveLocalDb(db);
    set({ reports: db.reports });
    useAuthStore.getState().fetchUsers();
    return updated;
  },

  deleteReport: async (id) => {
    const db = loadLocalDb();
    db.reports = db.reports.filter((r) => Number(r.id) !== Number(id));
    saveLocalDb(db);
    set({ reports: db.reports });
  },
}));

