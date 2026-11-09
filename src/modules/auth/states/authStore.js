import { create } from 'zustand';
import { loadLocalDb, saveLocalDb, httpRequest } from '../../core/lib/apiClient';

const SESSION_USER_KEY = 'bidzone_session_user';

function getStoredUser() {
  try {
    const raw = localStorage.getItem(SESSION_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create((set, get) => ({
  currentUser: getStoredUser(),
  users: loadLocalDb().users,
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const data = await httpRequest('/users');
      set({ users: data, loading: false });
      return data;
    } catch {
      const db = loadLocalDb();
      set({ users: db.users, loading: false });
      return db.users;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await httpRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('bidzone_token', res.token);
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.user));
      set({ currentUser: res.user, loading: false });
      return res.user;
    } catch {
      const db = loadLocalDb();
      const found = db.users.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          u.password === password
      );
      if (!found) {
        const msg = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        set({ loading: false, error: msg });
        throw new Error(msg);
      }
      if (found.status === 'suspended' || found.status === 'closed') {
        const msg =
          'Esta cuenta ha sido suspendida o cerrada por infracciones a las reglas de BidZone.';
        set({ loading: false, error: msg });
        throw new Error(msg);
      }
      const { password: _pwd, ...safeUser } = found;
      localStorage.setItem('bidzone_token', `mock-jwt-token-${found.id}`);
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(safeUser));
      set({ currentUser: safeUser, loading: false });
      return safeUser;
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await httpRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      localStorage.setItem('bidzone_token', res.token);
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.user));
      set({ currentUser: res.user, loading: false });
      return res.user;
    } catch {
      const db = loadLocalDb();
      const exists = db.users.some(
        (u) => u.email.toLowerCase() === payload.email.trim().toLowerCase()
      );
      if (exists) {
        const msg = 'El correo electrónico ya se encuentra registrado.';
        set({ loading: false, error: msg });
        throw new Error(msg);
      }
      const newUser = {
        id: Date.now(),
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        phone: payload.phone?.trim() || '+54 9 381 000-0000',
        city: payload.city?.trim() || 'San Miguel de Tucumán',
        role: payload.role || 'user',
        status: 'active',
        reputation: 5.0,
        createdAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      saveLocalDb(db);
      const { password: _pwd, ...safeUser } = newUser;
      localStorage.setItem('bidzone_token', `mock-jwt-token-${newUser.id}`);
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(safeUser));
      set({ currentUser: safeUser, users: db.users, loading: false });
      return safeUser;
    }
  },

  logout: () => {
    localStorage.removeItem('bidzone_token');
    localStorage.removeItem(SESSION_USER_KEY);
    set({ currentUser: null, error: null });
  },

  createUser: async (payload) => {
    const db = loadLocalDb();
    const exists = db.users.some(
      (u) => u.email.toLowerCase() === payload.email.trim().toLowerCase()
    );
    if (exists) {
      throw new Error('Ya existe un usuario con ese correo electrónico.');
    }
    const newUser = {
      id: Date.now(),
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password || 'user123',
      phone: payload.phone?.trim() || '+54 9 381 000-0000',
      city: payload.city?.trim() || 'Tucumán',
      role: payload.role || 'user',
      status: payload.status || 'active',
      reputation: Number(payload.reputation) || 5.0,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveLocalDb(db);
    set({ users: db.users });
    return newUser;
  },

  updateUser: async (id, updates) => {
    const db = loadLocalDb();
    const idx = db.users.findIndex((u) => Number(u.id) === Number(id));
    if (idx === -1) throw new Error('Usuario no encontrado.');

    db.users[idx] = {
      ...db.users[idx],
      ...updates,
      id: db.users[idx].id,
    };
    saveLocalDb(db);

    const current = get().currentUser;
    let updatedCurrent = current;
    if (current && Number(current.id) === Number(id)) {
      const { password: _pwd, ...safeUser } = db.users[idx];
      updatedCurrent = safeUser;
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(safeUser));
    }

    set({ users: db.users, currentUser: updatedCurrent });
    return db.users[idx];
  },

  deleteUser: async (id) => {
    const db = loadLocalDb();
    db.users = db.users.filter((u) => Number(u.id) !== Number(id));
    saveLocalDb(db);
    set({ users: db.users });
  },
}));

