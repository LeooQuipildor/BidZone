import { create } from 'zustand';
import { peticionHttp, registrarLimpiezaSesion } from '../../nucleo/servicios/clienteApi';
import {
  agregarOActualizarPorId,
  eliminarPorId,
  mismoId,
  reemplazarPorId,
} from '../../nucleo/utilidades/ayudas';
import { inputLocalAFechaIso } from '../../nucleo/utilidades/formatos';

// Construye el objeto de actualización de subasta con los nombres que espera el backend
function construirCuerpoActualizacion(cambios) {
  const cuerpo = {};
  if (cambios.titulo !== undefined) cuerpo.title = cambios.titulo;
  if (cambios.descripcion !== undefined) cuerpo.description = cambios.descripcion;
  if (cambios.categoria !== undefined) cuerpo.category = cambios.categoria;
  if (cambios.urlImagen !== undefined) cuerpo.imageUrl = cambios.urlImagen;
  if (cambios.estado !== undefined) cuerpo.status = cambios.estado;
  if (cambios.precioInicial !== undefined && cambios.precioInicial !== '') {
    cuerpo.basePrice = Number(cambios.precioInicial);
  }
  if (cambios.incrementoMinimo !== undefined && cambios.incrementoMinimo !== '') {
    cuerpo.minIncrement = Number(cambios.incrementoMinimo);
  }
  if (cambios.fechaFin !== undefined && cambios.fechaFin !== '') {
    cuerpo.endTime = inputLocalAFechaIso(cambios.fechaFin) || cambios.fechaFin;
  }
  return cuerpo;
}

// Tienda global de subastas (conecta con /api/auctions)
export const usarTiendaSubastas = create((set, get) => ({
  subastas: [],
  detalleSubastaActual: null,
  cargando: false,
  cargandoDetalle: false,
  error: null,
  filtros: { busqueda: '', categoria: 'Todas', estado: 'activa', ordenarPor: 'proximasACerrar' },
  paginaCatalogo: 1,

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
      const datos = await peticionHttp('/auctions');
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
      const datos = await peticionHttp(`/auctions/${id}`);
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
        title: datos.titulo,
        description: datos.descripcion || '',
        category: datos.categoria || 'Tecnología',
        imageUrl: datos.urlImagen ? datos.urlImagen.trim() : '',
        basePrice: Number(datos.precioInicial),
        minIncrement: Number(datos.incrementoMinimo),
        endTime: inputLocalAFechaIso(datos.fechaFin) || datos.fechaFin,
      };
      const creada = await peticionHttp('/auctions', {
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
      const actualizada = await peticionHttp(`/auctions/${id}`, {
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
      await peticionHttp(`/auctions/${id}`, { method: 'DELETE' });
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

registrarLimpiezaSesion(() => {
  usarTiendaSubastas.setState({ detalleSubastaActual: null, error: null });
});

