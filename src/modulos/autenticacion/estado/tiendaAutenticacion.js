// ============================================================================
// ARCHIVO: src/modulos/autenticacion/estado/tiendaAutenticacion.js
// RESPONSABILIDAD: Estado global de usuarios y sesión (Login, Registro, JWT).
// ============================================================================
//
// ¿QUÉ ES ZUSTAND Y POR QUÉ SE UTILIZA?
// Zustand es una biblioteca de gestión de estado global ultra-liviana.
// En React, pasar datos de sesión (quién está conectado, si es admin, etc.)
// a través de 10 niveles de componentes usando props se vuelve engorroso
// (problema conocido como "Prop Drilling").
//
// Zustand crea una "tienda" (Store) accesible desde cualquier componente mediante
// el hook 'usarTiendaAutenticacion(selector)'. Cuando el estado cambia con 'set()',
// solo los componentes suscritos a esa propiedad se vuelven a dibujar.
//
// MÉTODOS CLAVE DE ZUSTAND:
// - 'set({ propiedad: valor })': Fusiona el nuevo estado y notifica a la interfaz.
// - 'get()': Permite leer el estado actual de forma síncrona dentro de una acción.
// ============================================================================

import { create } from 'zustand';
import {
  CLAVE_TOKEN,
  ejecutarLimpiezaSesion,
  hayTokenSesion,
  peticionHttp,
  registrarLimpiezaSesion,
  registrarManejadorSinAutorizacion,
} from '../../nucleo/servicios/clienteApi';
import { eliminarPorId, mismoId, reemplazarPorId } from '../../nucleo/utilidades/ayudas';

// Clave utilizada para guardar el objeto del usuario en el localStorage del navegador
const CLAVE_USUARIO_SESION = 'bidzone_session_user';

/**
 * Lee el usuario guardado en localStorage al arrancar la aplicación.
 * Permite que al recargar la página (F5), la sesión no se pierda instantáneamente.
 * Si no hay token de autenticación válido, limpia cualquier dato huérfano.
 */
function obtenerUsuarioGuardado() {
  try {
    if (!hayTokenSesion()) {
      localStorage.removeItem(CLAVE_USUARIO_SESION);
      return null;
    }
    const usuarioTexto = localStorage.getItem(CLAVE_USUARIO_SESION);
    return usuarioTexto ? JSON.parse(usuarioTexto) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda o actualiza el token JWT y los datos del usuario en el almacenamiento local.
 */
function guardarSesion(token, usuario) {
  if (token) localStorage.setItem(CLAVE_TOKEN, token);
  if (usuario) localStorage.setItem(CLAVE_USUARIO_SESION, JSON.stringify(usuario));
}

/**
 * Función adaptadora (Adapter Pattern).
 * Convierte los nombres de campos en español de los formularios de la interfaz
 * a las propiedades en inglés que espera la base de datos y la API REST del backend.
 */
function construirCuerpoUsuario(datos) {
  const cuerpo = {
    name: String(datos.nombre || '').trim(),
    email: String(datos.correo || '').trim().toLowerCase(),
    phone: String(datos.telefono || '').trim(),
    city: String(datos.ciudad || '').trim(),
  };
  if (datos.contrasena) cuerpo.password = datos.contrasena;
  if (datos.rol !== undefined) cuerpo.role = datos.rol;
  if (datos.estado !== undefined) cuerpo.status = datos.estado;
  return cuerpo;
}

// Tienda global de autenticación y usuarios (conecta con /api/auth y /api/users)
export const usarTiendaAutenticacion = create((set, get) => ({
  // ESTADOS REACTIVOS
  usuarioActual: obtenerUsuarioGuardado(), // Objeto del usuario conectado o null
  usuarios: [],                           // Lista de todos los usuarios (para panel de admin)
  cargando: false,                        // Bandera booleana para mostrar spinners
  error: null,                            // Mensaje de error si una petición falla

  /**
   * Verifica la validez del token actual contra el endpoint '/auth/me'.
   * Si el token es legítimo, actualiza los datos del usuario (reputación, sanciones, etc.).
   */
  verificarSesion: async () => {
    if (!hayTokenSesion()) {
      set({ usuarioActual: null });
      return null;
    }
    try {
      const respuesta = await peticionHttp('/auth/me');
      guardarSesion(null, respuesta.user);
      set({ usuarioActual: respuesta.user, error: null });
      return respuesta.user;
    } catch (error) {
      // Si la cuenta fue sancionada o cerrada por infracción (RN06), cerramos sesión forzosa
      if (String(error.message || '').includes('RN06')) get().cerrarSesion();
      else set({ error: error.message });
      return null;
    }
  },

  /**
   * Obtiene la lista completa de usuarios registrados.
   * Utilizado en la pestaña "Usuarios" del Panel de Administración.
   */
  obtenerUsuarios: async () => {
    if (!hayTokenSesion()) {
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

  /**
   * Inicia sesión con correo y contraseña.
   * Guarda el token recibido y actualiza 'usuarioActual'.
   */
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

  /**
   * Registra un nuevo socio en la plataforma y lo deja autenticado de inmediato.
   */
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

  /**
   * Cierra la sesión activa: elimina tokens de localStorage, dispara la limpieza
   * de todas las demás tiendas (subastas, pujas, etc.) y resetea el estado a null.
   */
  cerrarSesion: () => {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO_SESION);
    ejecutarLimpiezaSesion();
    set({ usuarioActual: null, usuarios: [], error: null, cargando: false });
  },

  /**
   * Crea un usuario desde el panel administrativo (requiere rol admin).
   */
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

  /**
   * Actualiza los datos de un usuario por su ID.
   * Si el usuario modificado es el que está conectado actualmente, también actualiza 'usuarioActual'.
   */
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

  /**
   * Elimina un usuario por su ID en la base de datos (acción de moderación).
   */
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

// Registramos la función de limpieza que se llamará al cerrar sesión
registrarLimpiezaSesion(() => {
  usarTiendaAutenticacion.setState({ usuarioActual: null, usuarios: [], error: null, cargando: false });
});

