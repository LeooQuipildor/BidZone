import { create } from 'zustand';
import {
  hayTokenSesion,
  peticionHttp,
  registrarLimpiezaSesion,
} from '../../nucleo/servicios/clienteApi';
import { eliminarPorId, reemplazarPorId } from '../../nucleo/utilidades/ayudas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';

// Al cambiar una reseña, el backend recalcula la reputación promedio de los usuarios (RN07)
async function refrescarReputaciones() {
  const tiendaAuth = usarTiendaAutenticacion.getState();
  await tiendaAuth.obtenerUsuarios();
  await tiendaAuth.verificarSesion();
}

// Tienda global de calificaciones / reseñas RN07 (conecta con /api/reviews)
export const usarTiendaResenas = create((set) => ({
  resenas: [],
  cargando: false,
  error: null,

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

registrarLimpiezaSesion(() => {
  usarTiendaResenas.setState({ resenas: [], error: null, cargando: false });
});

