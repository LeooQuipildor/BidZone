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
      const datos = await peticionHttp('/notificaciones');
      set({ notificaciones: datos, cargando: false });
      return datos;
    } catch (error) {
      set({ cargando: false, error: error.message });
      return [];
    }
  },

  /**
   * Marca una notificación individual como leída ('PATCH /api/notificaciones/:id/leida').
   */
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

  /**
   * Marca todas las notificaciones de la bandeja como leídas ('PATCH /api/notificaciones/leer-todas').
   */
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

  /**
   * Elimina una notificación de la bandeja ('DELETE /api/notificaciones/:id').
   */
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

  /**
   * Envía un aviso directo al buzón de un usuario específico ('POST /api/notificaciones').
   */
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
  usarTiendaNotificaciones.setState({
    notificaciones: [],
    error: null,
    cargando: false,
  });
});

