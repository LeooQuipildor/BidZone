import { create } from 'zustand';
import {
  ejecutarLimpiezaSesion,
  peticionHttp,
  registrarLimpiezaSesion,
  registrarManejadorSinAutorizacion,
} from '../../nucleo/servicios/clienteApi';
import { eliminarPorId, mismoId, reemplazarPorId } from '../../nucleo/utilidades/ayudas';

const CLAVE_TOKEN = 'bidzone_token';
const CLAVE_USUARIO_SESION = 'bidzone_session_user';

// Lee el usuario guardado en localStorage al abrir la app (si todavía hay token)
function obtenerUsuarioGuardado() {
  try {
    if (!localStorage.getItem(CLAVE_TOKEN)) {
      localStorage.removeItem(CLAVE_USUARIO_SESION);
      return null;
    }
    const usuarioTexto = localStorage.getItem(CLAVE_USUARIO_SESION);
    return usuarioTexto ? JSON.parse(usuarioTexto) : null;
  } catch {
    return null;
  }
}

function guardarSesion(token, usuario) {
  if (token) localStorage.setItem(CLAVE_TOKEN, token);
  if (usuario) localStorage.setItem(CLAVE_USUARIO_SESION, JSON.stringify(usuario));
}

// Traduce los campos en español del formulario al formato JSON que espera el backend
function construirCuerpoUsuario(datos) {
  const cuerpo = {
    name: datos.nombre ? datos.nombre.trim() : '',
    email: datos.correo ? datos.correo.trim().toLowerCase() : '',
    phone: datos.telefono ? datos.telefono.trim() : '',
    city: datos.ciudad ? datos.ciudad.trim() : '',
  };
  if (datos.contrasena) cuerpo.password = datos.contrasena;
  if (datos.rol !== undefined) cuerpo.role = datos.rol;
  if (datos.estado !== undefined) cuerpo.status = datos.estado;
  if (datos.reputacion !== undefined && datos.reputacion !== '') {
    cuerpo.reputation = Number(datos.reputacion);
  }
  return cuerpo;
}

// Tienda global de autenticación y usuarios (conecta con /api/auth y /api/users)
export const usarTiendaAutenticacion = create((set, get) => ({
  usuarioActual: obtenerUsuarioGuardado(),
  usuarios: [],
  cargando: false,
  error: null,

  verificarSesion: async () => {
    if (!localStorage.getItem(CLAVE_TOKEN)) {
      set({ usuarioActual: null });
      return null;
    }
    try {
      const respuesta = await peticionHttp('/auth/me');
      guardarSesion(null, respuesta.user);
      set({ usuarioActual: respuesta.user, error: null });
      return respuesta.user;
    } catch (error) {
      // Si la cuenta fue sancionada o cerrada (RN06), cerramos sesión
      if (String(error.message || '').includes('RN06')) get().cerrarSesion();
      else set({ error: error.message });
      return null;
    }
  },

  obtenerUsuarios: async () => {
    if (!localStorage.getItem(CLAVE_TOKEN)) {
      set({ usuarios: [], cargando: false });
      return [];
    }
    set({ cargando: true, error: null });
    try {
      const datos = await peticionHttp('/users');
      set({ usuarios: datos, cargando: false });
      return datos;
    } catch (error) {
      set({ cargando: false, error: error.message });
      return [];
    }
  },

  iniciarSesion: async (correo, contrasena) => {
    set({ cargando: true, error: null });
    try {
      const cuerpo = {
        email: String(correo || '').trim().toLowerCase(),
        password: String(contrasena || ''),
      };
      const respuesta = await peticionHttp('/auth/login', {
        method: 'POST',
        body: JSON.stringify(cuerpo),
      });
      guardarSesion(respuesta.token, respuesta.user);
      set({ usuarioActual: respuesta.user, cargando: false, error: null });
      return respuesta.user;
    } catch (error) {
      set({ cargando: false, error: error.message });
      throw error;
    }
  },

  registrarUsuario: async (datos) => {
    set({ cargando: true, error: null });
    try {
      const respuesta = await peticionHttp('/auth/register', {
        method: 'POST',
        body: JSON.stringify(construirCuerpoUsuario(datos)),
      });
      guardarSesion(respuesta.token, respuesta.user);
      set({ usuarioActual: respuesta.user, cargando: false, error: null });
      return respuesta.user;
    } catch (error) {
      set({ cargando: false, error: error.message });
      throw error;
    }
  },

  cerrarSesion: () => {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO_SESION);
    ejecutarLimpiezaSesion();
    set({ usuarioActual: null, usuarios: [], error: null, cargando: false });
  },

  crearUsuario: async (datos) => {
    set({ error: null });
    try {
      const cuerpo = {
        ...construirCuerpoUsuario(datos),
        role: datos.rol || 'user',
        status: datos.estado || 'active',
      };
      const creado = await peticionHttp('/users', {
        method: 'POST',
        body: JSON.stringify(cuerpo),
      });
      set((estado) => ({ usuarios: [creado, ...estado.usuarios] }));
      return creado;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  actualizarUsuario: async (id, cambios) => {
    set({ error: null });
    try {
      const cuerpo = construirCuerpoUsuario(cambios);
      const actualizado = await peticionHttp(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cuerpo),
      });

      const actual = get().usuarioActual;
      let actualActualizado = actual;
      if (actual && mismoId(actual.id, id)) {
        actualActualizado = actualizado;
        guardarSesion(null, actualizado);
      }

      set((estado) => ({
        usuarios: reemplazarPorId(estado.usuarios, id, actualizado),
        usuarioActual: actualActualizado,
      }));
      return actualizado;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  eliminarUsuario: async (id) => {
    set({ error: null });
    try {
      await peticionHttp(`/users/${id}`, { method: 'DELETE' });
      set((estado) => ({ usuarios: eliminarPorId(estado.usuarios, id) }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

// Si el servidor responde 401 (sesión vencida), cerramos la sesión automáticamente
registrarManejadorSinAutorizacion(() => usarTiendaAutenticacion.getState().cerrarSesion());
registrarLimpiezaSesion(() => {
  usarTiendaAutenticacion.setState({ usuarioActual: null, usuarios: [], error: null, cargando: false });
});

