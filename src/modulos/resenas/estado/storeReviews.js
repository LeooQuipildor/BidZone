import { create } from 'zustand';
import {
  hayTokenSesion,
  peticionHttp,
  registrarLimpiezaSesion,
} from '../../nucleo/servicios/clienteApi';
import { eliminarPorId, reemplazarPorId } from '../../nucleo/utilidades/ayudas';
import { useStoreAuthentication } from '../../autenticacion/estado/storeAuthentication';

async function refrescarReputaciones() {
  const storeAuth = useStoreAuthentication.getState();
  await storeAuth.obtenerUsuarios();
  await storeAuth.verificarSesion();
}

// Tienda global de calificaciones / reseñas RN07 (conecta con /api/reviews)
export const useStoreReviews = create((set) => ({
  // ESTADOS REACTIVOS
  resenas: [],      // Array de reseñas (emitidas y recibidas)
  cargando: false,  // Bandera de llamada HTTP
  error: null,      // Mensaje de error si falla la petición

  obtenerResenas: async () => {
    if (!hayTokenSesion()) {
      set({ resenas: [], cargando: false });
      return [];
    }

    set({ cargando: true, error: null });
    try {
      const datos = await peticionHttp('/resenas');
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
        subastaId: Number(datos.idSubasta),
        puntaje: Number(datos.calificacion),
        comentario: datos.comentario ? datos.comentario.trim() : '',
      };
      if (datos.idUsuarioCalificado) {
        cuerpo.calificadoId = Number(datos.idUsuarioCalificado);
      }
      if (datos.contextoRol) {
        cuerpo.contextoRol = datos.contextoRol;
      }

      const creada = await peticionHttp('/resenas', {
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
      if (cambios.calificacion !== undefined) cuerpo.puntaje = Number(cambios.calificacion);
      if (cambios.comentario !== undefined) {
        cuerpo.comentario = cambios.comentario ? cambios.comentario.trim() : '';
      }
      if (cambios.contextoRol !== undefined) cuerpo.contextoRol = cambios.contextoRol;

      const actualizada = await peticionHttp(`/resenas/${id}`, {
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
      await peticionHttp(`/resenas/${id}`, { method: 'DELETE' });
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
  useStoreReviews.setState({ resenas: [], error: null, cargando: false });
});

