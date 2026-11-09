import { create } from 'zustand';
import { loadLocalDb, saveLocalDb } from '../../core/lib/apiClient';

export const useNotificationStore = create((set) => ({
  notifications: loadLocalDb().notifications,

  fetchNotifications: () => {
    const db = loadLocalDb();
    set({ notifications: db.notifications });
    return db.notifications;
  },

  markAsRead: (id) => {
    const db = loadLocalDb();
    db.notifications = db.notifications.map((n) =>
      Number(n.id) === Number(id) ? { ...n, read: true } : n
    );
    saveLocalDb(db);
    set({ notifications: db.notifications });
  },

  markAllAsRead: (userId) => {
    const db = loadLocalDb();
    db.notifications = db.notifications.map((n) =>
      Number(n.userId) === Number(userId) ? { ...n, read: true } : n
    );
    saveLocalDb(db);
    set({ notifications: db.notifications });
  },

  deleteNotification: (id) => {
    const db = loadLocalDb();
    db.notifications = db.notifications.filter((n) => Number(n.id) !== Number(id));
    saveLocalDb(db);
    set({ notifications: db.notifications });
  },
}));

