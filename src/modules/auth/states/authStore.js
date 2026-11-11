import { create } from 'zustand';
import {
  httpRequest,
  registerSessionReset,
  registerUnauthorizedHandler,
  runSessionResets,
} from '../../core/lib/apiClient';

const TOKEN_KEY = 'bidzone_token';
const SESSION_USER_KEY = 'bidzone_session_user';

function getStoredUser() {
  try {
    if (!localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(SESSION_USER_KEY);
      return null;
    }
    const raw = localStorage.getItem(SESSION_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create((set, get) => ({
  currentUser: getStoredUser(),
  users: [],
  loading: false,
  error: null,

  checkSession: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ currentUser: null });
      return null;
    }
    try {
      const res = await httpRequest('/auth/me');
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.user));
      set({ currentUser: res.user, error: null });
      return res.user;
    } catch (err) {
      if (String(err.message || '').includes('RN06')) {
        get().logout();
      } else {
        set({ error: err.message });
      }
      return null;
    }
  },

  fetchUsers: async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      set({ users: [], loading: false });
      return [];
    }
    set({ loading: true, error: null });
    try {
      const data = await httpRequest('/users');
      set({ users: data, loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message });
      return [];
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await httpRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: String(email || '').trim().toLowerCase(),
          password: String(password || ''),
        }),
      });
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.user));
      set({ currentUser: res.user, loading: false, error: null });
      return res.user;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await httpRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: payload.name?.trim(),
          email: payload.email?.trim().toLowerCase(),
          phone: payload.phone?.trim() || '',
          city: payload.city?.trim() || '',
          password: payload.password,
        }),
      });
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.user));
      set({ currentUser: res.user, loading: false, error: null });
      return res.user;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
    runSessionResets();
    set({ currentUser: null, users: [], error: null, loading: false });
  },

  createUser: async (payload) => {
    set({ error: null });
    try {
      const created = await httpRequest('/users', {
        method: 'POST',
        body: JSON.stringify({
          name: payload.name?.trim(),
          email: payload.email?.trim().toLowerCase(),
          password: payload.password,
          phone: payload.phone?.trim() || '',
          city: payload.city?.trim() || '',
          role: payload.role || 'user',
          status: payload.status || 'active',
          ...(payload.reputation !== undefined
            ? { reputation: Number(payload.reputation) }
            : {}),
        }),
      });
      set((state) => ({ users: [created, ...state.users] }));
      return created;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateUser: async (id, updates) => {
    set({ error: null });
    try {
      const updated = await httpRequest(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const current = get().currentUser;
      let updatedCurrent = current;
      if (current && Number(current.id) === Number(id)) {
        updatedCurrent = updated;
        localStorage.setItem(SESSION_USER_KEY, JSON.stringify(updated));
      }

      set((state) => ({
        users: state.users.map((u) => (Number(u.id) === Number(id) ? updated : u)),
        currentUser: updatedCurrent,
      }));
      return updated;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteUser: async (id) => {
    set({ error: null });
    try {
      await httpRequest(`/users/${id}`, { method: 'DELETE' });
      set((state) => ({
        users: state.users.filter((u) => Number(u.id) !== Number(id)),
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));

registerUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});

registerSessionReset(() => {
  useAuthStore.setState({
    currentUser: null,
    users: [],
    error: null,
    loading: false,
  });
});
