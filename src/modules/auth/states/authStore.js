import { create } from 'zustand';
import {
  httpRequest,
  registerSessionReset,
  registerUnauthorizedHandler,
  runSessionResets,
} from '../../core/lib/apiClient';
import {
  removeById,
  replaceById,
  sameId,
} from '../../core/utils/formatters';

const TOKEN_KEY = 'bidzone_token';
const SESSION_USER_KEY = 'bidzone_session_user';

// Lee el usuario guardado en localStorage al iniciar la página (si existe un token)
function getStoredUser() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      localStorage.removeItem(SESSION_USER_KEY);
      return null;
    }
    const rawUser = localStorage.getItem(SESSION_USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

// Guarda el token JWT y los datos del usuario en localStorage
function saveSession(token, user) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  }
}

// Store global de autenticación y usuarios (conecta con /api/auth y /api/users)
export const useAuthStore = create((set, get) => ({
  currentUser: getStoredUser(),
  users: [],
  loading: false,
  error: null,

  // Verifica con el servidor si el token guardado sigue siendo válido
  checkSession: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ currentUser: null });
      return null;
    }

    try {
      const res = await httpRequest('/auth/me');
      saveSession(null, res.user);
      set({ currentUser: res.user, error: null });
      return res.user;
    } catch (err) {
      const message = String(err.message || '');
      // Si la cuenta fue sancionada o cerrada (RN06), cerramos sesión
      if (message.includes('RN06')) {
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
      const body = {
        email: String(email || '').trim().toLowerCase(),
        password: String(password || ''),
      };
      const res = await httpRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      saveSession(res.token, res.user);
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
      const body = {
        name: payload.name ? payload.name.trim() : '',
        email: payload.email ? payload.email.trim().toLowerCase() : '',
        phone: payload.phone ? payload.phone.trim() : '',
        city: payload.city ? payload.city.trim() : '',
        password: payload.password,
      };
      const res = await httpRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      saveSession(res.token, res.user);
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
      const body = {
        name: payload.name ? payload.name.trim() : '',
        email: payload.email ? payload.email.trim().toLowerCase() : '',
        password: payload.password,
        phone: payload.phone ? payload.phone.trim() : '',
        city: payload.city ? payload.city.trim() : '',
        role: payload.role || 'user',
        status: payload.status || 'active',
      };
      if (payload.reputation !== undefined) {
        body.reputation = Number(payload.reputation);
      }

      const created = await httpRequest('/users', {
        method: 'POST',
        body: JSON.stringify(body),
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
      if (current && sameId(current.id, id)) {
        updatedCurrent = updated;
        saveSession(null, updated);
      }

      set((state) => ({
        users: replaceById(state.users, id, updated),
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
        users: removeById(state.users, id),
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));

// Si cualquier petición falla por sesión expirada (401), cerramos la sesión automáticamente
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
