import { create } from 'zustand';
import { peticionHttp, registrarLimpiezaSesion } from '../../nucleo/servicios/clienteApi';
import {
  agregarOActualizarPorId,
  eliminarPorId,
  mismoId,
  reemplazarPorId,
} from '../../nucleo/utilidades/ayudas';
import { inputLocalAFechaIso } from '../../nucleo/utilidades/formatos';

function construirCuerpoActualizacion(cambios) {
  const cuerpo = {};
  if (cambios.titulo !== undefined) cuerpo.titulo = cambios.titulo;
  if (cambios.descripcion !== undefined) cuerpo.descripcion = cambios.descripcion;
  if (cambios.categoria !== undefined) cuerpo.categoria = cambios.categoria;
  if (cambios.urlImagen !== undefined) cuerpo.urlImagen = cambios.urlImagen;
  if (cambios.estado !== undefined) cuerpo.estado = cambios.estado;
  if (cambios.precioInicial !== undefined && cambios.precioInicial !== '') {
    cuerpo.precioBase = Number(cambios.precioInicial);
  }
  if (cambios.incrementoMinimo !== undefined && cambios.incrementoMinimo !== '') {
    cuerpo.incrementoMinimo = Number(cambios.incrementoMinimo);
  }
  // La fecha y hora de cierre (fechaFin) no se puede modificar tras crear la subasta
  return cuerpo;
}

// Tienda global de subastas (conecta con /api/subastas)
export const usarTiendaSubastas = create((set, get) => ({
  // ESTADOS REACTIVOS
  subastas: [],               // Array de publicaciones
  detalleSubastaActual: null, // Subasta individual con datos enriquecidos
  cargando: false,            // Bandera de carga general
  cargandoDetalle: false,     // Bandera de carga específica para la vista de detalle
  error: null,                // Mensaje de error si la petición falla
  filtros: {
    busqueda: '',
    categoria: 'Todas',
    estado: 'activa',
    ordenarPor: 'proximasACerrar',
  },
  paginaCatalogo: 1,          // Página actual en la vista de catálogo

  actualizarFiltros: (nuevosFiltros) => {
    set((estado) => ({
      filtros: { ...estado.filtros, ...nuevosFiltros },
      paginaCatalogo: 1,
    }));
  },

  cambiarPaginaCatalogo: (nuevaPagina) => {
    set({ paginaCatalogo: nuevaPagina });
  },

  obtenerSubastas: async () => {
    set({ cargando: true, error: null });
    try {
      const datos = await peticionHttp('/subastas');
      set({ subastas: datos, cargando: false });
      return datos;
    } catch (error) {
      set({ cargando: false, error: error.message });
      return [];
    }
  },

  obtenerSubastaPorId: async (id) => {
    set({ cargandoDetalle: true, error: null });
    try {
      const datos = await peticionHttp(`/subastas/${id}`);
      set((estado) => ({
        detalleSubastaActual: datos,
        cargandoDetalle: false,
        subastas: agregarOActualizarPorId(estado.subastas, datos),
      }));
      return datos;
    } catch (error) {
      set({ detalleSubastaActual: null, cargandoDetalle: false, error: error.message });
      return null;
    }
  },

  crearSubasta: async (datos) => {
    set({ error: null });
    try {
      const cuerpo = {
        titulo: datos.titulo,
        descripcion: datos.descripcion || '',
        categoria: datos.categoria || 'Tecnología',
        urlImagen: datos.urlImagen ? datos.urlImagen.trim() : '',
        precioBase: Number(datos.precioInicial),
        incrementoMinimo: Number(datos.incrementoMinimo),
        fechaFin: inputLocalAFechaIso(datos.fechaFin) || datos.fechaFin,
      };
      const creada = await peticionHttp('/subastas', {
        method: 'POST',
        body: JSON.stringify(cuerpo),
      });
      set((estado) => ({ subastas: [creada, ...estado.subastas] }));
      return creada;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  actualizarSubasta: async (id, cambios) => {
    set({ error: null });
    try {
      const cuerpo = construirCuerpoActualizacion(cambios);
      const actualizada = await peticionHttp(`/subastas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cuerpo),
      });
      set((estado) => ({ subastas: reemplazarPorId(estado.subastas, id, actualizada) }));

      const detalle = get().detalleSubastaActual;
      if (detalle && mismoId(detalle.id, id)) await get().obtenerSubastaPorId(id);
      return actualizada;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  eliminarSubasta: async (id) => {
    set({ error: null });
    try {
      await peticionHttp(`/subastas/${id}`, { method: 'DELETE' });
      set((estado) => {
        const estabaViendoEsa =
          estado.detalleSubastaActual && mismoId(estado.detalleSubastaActual.id, id);
        return {
          subastas: eliminarPorId(estado.subastas, id),
          detalleSubastaActual: estabaViendoEsa ? null : estado.detalleSubastaActual,
        };
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

// Al cerrar sesión, limpiamos el detalle de subasta cargado en memoria
registrarLimpiezaSesion(() => {
  usarTiendaSubastas.setState({ detalleSubastaActual: null, error: null });
});

