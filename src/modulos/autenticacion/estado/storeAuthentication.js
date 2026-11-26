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

function guardarSesion(token, usuario) {
  if (token) localStorage.setItem(CLAVE_TOKEN, token);
  if (usuario) localStorage.setItem(CLAVE_USUARIO_SESION, JSON.stringify(usuario));
}

function construirCuerpoUsuario(datos) {
  const cuerpo = {
    nombre: String(datos.nombre || '').trim(),
    correo: String(datos.correo || '').trim().toLowerCase(),
    telefono: String(datos.telefono || '').trim(),
    ciudad: String(datos.ciudad || '').trim(),
  };
  if (datos.contrasena) cuerpo.contrasena = datos.contrasena;
  if (datos.rol !== undefined) cuerpo.rol = datos.rol;
  if (datos.estado !== undefined) cuerpo.estado = datos.estado;
  return cuerpo;
}

// Tienda global de autenticación y usuarios (conecta con /api/autenticacion y /api/usuarios)
export const useStoreAuthentication = create((set, get) => ({
  // ESTADOS REACTIVOS
  usuarioActual: obtenerUsuarioGuardado(), // Objeto del usuario conectado o null
  usuarios: [],                           // Lista de todos los usuarios (para panel de admin)
  cargando: false,                        // Bandera booleana para mostrar spinners
  error: null,                            // Mensaje de error si una petición falla

  verificarSesion: async () => {
    if (!hayTokenSesion()) {
      set({ usuarioActual: null });
      return null;
    }
    try {
      const respuesta = await peticionHttp('/autenticacion/perfil');
      guardarSesion(null, respuesta.usuario);
      set({ usuarioActual: respuesta.usuario, error: null });
      return respuesta.usuario;
    } catch (error) {
      // Si la cuenta fue sancionada o cerrada por infracción (RN06), cerramos sesión forzosa
      if (String(error.message || '').includes('RN06')) get().cerrarSesion();
      else set({ error: error.message });
      return null;
    }
  },

  obtenerUsuarios: async () => {
    if (!hayTokenSesion()) {
      set({ usuarios: [], cargando: false });
      return [];
    }
    set({ cargando: true, error: null });
    try {
      const datos = await peticionHttp('/usuarios');
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
        correo: String(correo || '').trim().toLowerCase(),
        contrasena: String(contrasena || ''),
      };
      const respuesta = await peticionHttp('/autenticacion/iniciar-sesion', {
        method: 'POST',
        body: JSON.stringify(cuerpo),
      });
      guardarSesion(respuesta.token, respuesta.usuario);
      set({ usuarioActual: respuesta.usuario, cargando: false, error: null });
      return respuesta.usuario;
    } catch (error) {
      set({ cargando: false, error: error.message });
      throw error;
    }
  },

  registrarUsuario: async (datos) => {
    set({ cargando: true, error: null });
    try {
      const respuesta = await peticionHttp('/autenticacion/registrar', {
        method: 'POST',
        body: JSON.stringify(construirCuerpoUsuario(datos)),
      });
      guardarSesion(respuesta.token, respuesta.usuario);
      set({ usuarioActual: respuesta.usuario, cargando: false, error: null });
      return respuesta.usuario;
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
        rol: datos.rol || 'usuario',
        estado: datos.estado || 'activa',
      };
      const creado = await peticionHttp('/usuarios', {
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
      const actualizado = await peticionHttp(`/usuarios/${id}`, {
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
      await peticionHttp(`/usuarios/${id}`, { method: 'DELETE' });
      set((estado) => ({ usuarios: eliminarPorId(estado.usuarios, id) }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  solicitarRecuperacion: async (correo) => {
    set({ error: null });
    const cuerpo = { correo: String(correo || '').trim().toLowerCase() };
    return peticionHttp('/autenticacion/solicitar-recuperacion', {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    });
  },

  restablecerContrasena: async ({ correo, codigo, nuevaContrasena }) => {
    set({ error: null });
    const cuerpo = {
      correo: String(correo || '').trim().toLowerCase(),
      codigo: String(codigo || '').trim(),
      nuevaContrasena: String(nuevaContrasena || ''),
    };
    return peticionHttp('/autenticacion/restablecer-contrasena', {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    });
  },
}));

// Si el servidor responde 401 (sesión vencida), cerramos la sesión automáticamente
registrarManejadorSinAutorizacion(() => useStoreAuthentication.getState().cerrarSesion());

// Registramos la función de limpieza que se llamará al cerrar sesión
registrarLimpiezaSesion(() => {
  useStoreAuthentication.setState({ usuarioActual: null, usuarios: [], error: null, cargando: false });
});

