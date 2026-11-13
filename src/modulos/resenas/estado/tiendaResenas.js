// ============================================================================
// ARCHIVO: src/modulos/resenas/estado/tiendaResenas.js
// RESPONSABILIDAD: Estado global de calificaciones mutuas y reputación RN07.
// ============================================================================
//
// ¿QUÉ HACE ESTA TIENDA?
// Administra las calificaciones de 1 a 5 estrellas y comentarios entre compradores
// y vendedores tras finalizar una subasta ('/api/reviews').
//
// REGLA DE NEGOCIO RN07 (Cálculo Dinámico de Reputación):
// Cada vez que un usuario crea, modifica o elimina una reseña, la base de datos
// recalcula la media aritmética de calificaciones recibidas por el usuario calificado.
// Para que la nueva reputación (ej: "4.8 ★") se actualice inmediatamente en la barra
// superior, en las tarjetas de usuario y en el perfil, esta tienda invoca la función
// 'refrescarReputaciones', sincronizando la tienda de autenticación ('usarTiendaAutenticacion').
// ============================================================================

import { create } from 'zustand';
import {
  hayTokenSesion,
  peticionHttp,
  registrarLimpiezaSesion,
} from '../../nucleo/servicios/clienteApi';
import { eliminarPorId, reemplazarPorId } from '../../nucleo/utilidades/ayudas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';

/**
 * Función auxiliar de sincronización.
 * Vuelve a pedir la lista de usuarios y los datos del usuario conectado para
 * reflejar los nuevos promedios de reputación tras emitir o modificar una calificación.
 */
async function refrescarReputaciones() {
  const tiendaAuth = usarTiendaAutenticacion.getState();
  await tiendaAuth.obtenerUsuarios();
  await tiendaAuth.verificarSesion();
}

// Tienda global de calificaciones / reseñas RN07 (conecta con /api/reviews)
export const usarTiendaResenas = create((set) => ({
  // ESTADOS REACTIVOS
  resenas: [],      // Array de reseñas (emitidas y recibidas)
  cargando: false,  // Bandera de llamada HTTP
  error: null,      // Mensaje de error si falla la petición

  /**
   * Descarga las reseñas disponibles ('GET /api/reviews').
   */
  obtenerResenas: async () => {
    if (!hayTokenSesion()) {
      set({ resenas: [], cargando: false });
      return [];
    }

    set({ cargando: true, error: null });
    try {
      const datos = await peticionHttp('/reviews');
      set({ resenas: datos, cargando: false });
      return datos;
    } catch (error) {
      set({ cargando: false, error: error.message });
      return [];
    }
  },

  /**
   * Publica una nueva calificación sobre la contraparte ('POST /api/reviews').
   * Actualiza el listado local y refresca las reputaciones en toda la aplicación.
   */
  crearResena: async (datos) => {
    set({ error: null });
    try {
      const cuerpo = {
        auctionId: Number(datos.idSubasta),
        rating: Number(datos.calificacion),
        comment: datos.comentario ? datos.comentario.trim() : '',
      };
      if (datos.idUsuarioCalificado) {
        cuerpo.targetUserId = Number(datos.idUsuarioCalificado);
      }
      if (datos.contextoRol) {
        cuerpo.roleContext = datos.contextoRol;
      }

      const creada = await peticionHttp('/reviews', {
        method: 'POST',
        body: JSON.stringify(cuerpo),
      });
      set((estado) => ({ resenas: [creada, ...estado.resenas] }));

      await refrescarReputaciones();
      return creada;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Modifica una calificación previamente emitida ('PUT /api/reviews/:id').
   */
  actualizarResena: async (id, cambios) => {
    set({ error: null });
    try {
      const cuerpo = {};
      if (cambios.calificacion !== undefined) cuerpo.rating = Number(cambios.calificacion);
      if (cambios.comentario !== undefined) {
        cuerpo.comment = cambios.comentario ? cambios.comentario.trim() : '';
      }
      if (cambios.contextoRol !== undefined) cuerpo.roleContext = cambios.contextoRol;

      const actualizada = await peticionHttp(`/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cuerpo),
      });
      set((estado) => ({ resenas: reemplazarPorId(estado.resenas, id, actualizada) }));

      await refrescarReputaciones();
      return actualizada;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Elimina una calificación emitida ('DELETE /api/reviews/:id').
   */
  eliminarResena: async (id) => {
    set({ error: null });
    try {
      await peticionHttp(`/reviews/${id}`, { method: 'DELETE' });
      set((estado) => ({ resenas: eliminarPorId(estado.resenas, id) }));

      await refrescarReputaciones();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

// Al cerrar sesión, limpiamos las reseñas en memoria
registrarLimpiezaSesion(() => {
  usarTiendaResenas.setState({ resenas: [], error: null, cargando: false });
});

