import { create } from 'zustand';
import { peticionHttp, registrarLimpiezaSesion } from '../../nucleo/servicios/clienteApi';
import { eliminarPorId, mismoId } from '../../nucleo/utilidades/ayudas';

// Tienda global de notificaciones del usuario (conecta con /api/notifications)
export const usarTiendaNotificaciones = create((set) => ({
  notificaciones: [],
  cargando: false,
  error: null,

  obtenerNotificaciones: async () => {
    if (!localStorage.getItem('bidzone_token')) {
      set({ notificaciones: [], cargando: false });
      return [];
    }

    set({ cargando: true, error: null });
    try {
      const datos = await peticionHttp('/notifications');
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
      const actualizada = await peticionHttp(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
      set((estado) => ({
        notificaciones: estado.notificaciones.map((notificacion) =>
          mismoId(notificacion.id, id)
            ? { ...notificacion, ...actualizada, read: true }
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
      await peticionHttp('/notifications/read-all', { method: 'PATCH' });
      set((estado) => ({
        notificaciones: estado.notificaciones.map((notificacion) => ({
          ...notificacion,
          read: true,
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
      await peticionHttp(`/notifications/${id}`, { method: 'DELETE' });
      set((estado) => ({
        notificaciones: eliminarPorId(estado.notificaciones, id),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

registrarLimpiezaSesion(() => {
  usarTiendaNotificaciones.setState({
    notificaciones: [],
    error: null,
    cargando: false,
  });
});

