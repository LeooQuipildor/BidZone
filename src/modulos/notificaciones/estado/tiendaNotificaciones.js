// ============================================================================
// ARCHIVO: src/modulos/notificaciones/estado/tiendaNotificaciones.js
// RESPONSABILIDAD: Estado global de notificaciones y avisos del sistema.
// ============================================================================
//
// ¿QUÉ INFORMACIÓN ADMINISTRA ESTA TIENDA?
// Administra la bandeja de entrada de avisos recibidos por el usuario (ofertas superadas,
// subastas ganadas, solicitudes de corrección de publicación o advertencias de mediación).
// Conecta con los endpoints '/api/notifications'.
//
// CONTADOR EN TIEMPO REAL:
// En la barra de navegación ('Navbar.jsx'), el ícono de campana muestra un globito verde
// con la cantidad de notificaciones donde 'read === false' ('cantidadSinLeer').
// ============================================================================

import { create } from 'zustand';
import {
  hayTokenSesion,
  peticionHttp,
  registrarLimpiezaSesion,
} from '../../nucleo/servicios/clienteApi';
import { eliminarPorId, mismoId } from '../../nucleo/utilidades/ayudas';

// Tienda global de notificaciones del usuario (conecta con /api/notifications)
export const usarTiendaNotificaciones = create((set) => ({
  // ESTADOS REACTIVOS
  notificaciones: [], // Array de notificaciones recibidas
  cargando: false,    // Bandera de llamada HTTP
  error: null,        // Mensaje de error si falla la petición

  /**
   * Obtiene la lista de notificaciones del usuario conectado ('GET /api/notifications').
   */
  obtenerNotificaciones: async () => {
    if (!hayTokenSesion()) {
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

  /**
   * Marca una notificación individual como leída ('PATCH /api/notifications/:id/read').
   * Actualiza inmutablemente la propiedad 'read: true' en el estado local.
   */
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

  /**
   * Marca todas las notificaciones de la bandeja como leídas ('PATCH /api/notifications/read-all').
   */
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

  /**
   * Elimina una notificación de la bandeja ('DELETE /api/notifications/:id').
   */
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

  /**
   * Envía un aviso directo al buzón de un usuario específico ('POST /api/notifications').
   * Se utiliza en 'PanelSolicitudCorreccion' para que un admin o comprador solicite
   * al vendedor corregir fotos, descripciones o datos de su subasta.
   */
  enviarNotificacion: async ({ idUsuario, idSubasta = null, titulo, mensaje, tipo = 'system' }) => {
    set({ error: null });
    try {
      const cuerpo = {
        userId: Number(idUsuario),
        auctionId: idSubasta ? Number(idSubasta) : null,
        title: String(titulo || '').trim(),
        message: String(mensaje || '').trim(),
        type: tipo,
      };
      return await peticionHttp('/notifications', {
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
  usarTiendaNotificaciones.setState({
    notificaciones: [],
    error: null,
    cargando: false,
  });
});

