import { create } from 'zustand';
import {
  hayTokenSesion,
  peticionHttp,
  registrarLimpiezaSesion,
} from '../../nucleo/servicios/clienteApi';
import { eliminarPorId, mismoId } from '../../nucleo/utilidades/ayudas';

// Store global de notificaciones del usuario (conecta con /api/notificaciones)
export const useStoreNotifications = create((set) => ({
  // ESTADOS REACTIVOS
  notificaciones: [], // Array de notificaciones recibidas
  cargando: false,    // Bandera de llamada HTTP
  error: null,        // Mensaje de error si falla la petición

  obtenerNotificaciones: async () => {
    if (!hayTokenSesion()) {
      set({ notificaciones: [], cargando: false });
      return [];
    }

    set({ cargando: true, error: null });
    try {
      const datos = await peticionHttp('/notificaciones');
      set({ notificaciones: datos, cargando: false });
      return datos;
    } catch (error) {
      set({ cargando: false, error: error.message });
      return [];
    }
  },

  marcarComoLeida: async (id) => {
    set({ error: null });
    try {
      const actualizada = await peticionHttp(`/notificaciones/${id}/leida`, {
        method: 'PATCH',
      });
      set((estado) => ({
        notificaciones: estado.notificaciones.map((notificacion) =>
          mismoId(notificacion.id, id)
            ? { ...notificacion, ...actualizada, leida: true }
            : notificacion
        ),
      }));
      return actualizada;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  marcarTodasComoLeidas: async () => {
    set({ error: null });
    try {
      await peticionHttp('/notificaciones/leer-todas', { method: 'PATCH' });
      set((estado) => ({
        notificaciones: estado.notificaciones.map((notificacion) => ({
          ...notificacion,
          leida: true,
        })),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  eliminarNotificacion: async (id) => {
    set({ error: null });
    try {
      await peticionHttp(`/notificaciones/${id}`, { method: 'DELETE' });
      set((estado) => ({
        notificaciones: eliminarPorId(estado.notificaciones, id),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  enviarNotificacion: async ({ idUsuario, idSubasta = null, titulo, mensaje, tipo = 'sistema' }) => {
    set({ error: null });
    try {
      const cuerpo = {
        usuarioId: Number(idUsuario),
        subastaId: idSubasta ? Number(idSubasta) : null,
        titulo: String(titulo || '').trim(),
        mensaje: String(mensaje || '').trim(),
        tipo,
      };
      return await peticionHttp('/notificaciones', {
        method: 'POST',
        body: JSON.stringify(cuerpo),
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

// Al cerrar sesión, limpiamos la lista de notificaciones en memoria
registrarLimpiezaSesion(() => {
  useStoreNotifications.setState({
    notificaciones: [],
    error: null,
    cargando: false,
  });
});

