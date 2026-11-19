// ============================================================================
// ARCHIVO: src/modulos/subastas/estado/tiendaSubastas.js
// RESPONSABILIDAD: Estado global del catálogo, publicaciones y filtros de subastas.
// ============================================================================
//
// ¿QUÉ INFORMACIÓN ADMINISTRA ESTA TIENDA?
// 1. 'subastas': Array con todas las subastas disponibles (descargadas de '/api/auctions').
// 2. 'detalleSubastaActual': Objeto completo de la subasta que el usuario está viendo
//    en '/subastas/:id' (incluye lista de postores y contacto si está finalizada).
// 3. 'filtros': Estado reactivo de los criterios de búsqueda (texto, categoría, estado y orden).
// 4. 'paginaCatalogo': Número de página actual para la paginación del catálogo.
// 5. Métodos asíncronos para interactuar con la API REST (CRUD: Create, Read, Update, Delete).
// ============================================================================

import { create } from 'zustand';
import { peticionHttp, registrarLimpiezaSesion } from '../../nucleo/servicios/clienteApi';
import {
  agregarOActualizarPorId,
  eliminarPorId,
  mismoId,
  reemplazarPorId,
} from '../../nucleo/utilidades/ayudas';
import { inputLocalAFechaIso } from '../../nucleo/utilidades/formatos';

/**
 * Función adaptadora para construir el cuerpo de actualización (PUT).
 * Solo incluye aquellas propiedades que hayan sido efectivamente modificadas
 * para no sobreescribir datos con 'undefined'.
 */
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
  if (cambios.fechaFin !== undefined && cambios.fechaFin !== '') {
    cuerpo.fechaFin = inputLocalAFechaIso(cambios.fechaFin) || cambios.fechaFin;
  }
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

  /**
   * Actualiza uno o más filtros de búsqueda y resetea automáticamente la página a 1.
   * Al resetear a la página 1, evita que el usuario quede en una página vacía si los
   * nuevos filtros producen menos resultados que antes.
   */
  actualizarFiltros: (nuevosFiltros) => {
    set((estado) => ({
      filtros: { ...estado.filtros, ...nuevosFiltros },
      paginaCatalogo: 1,
    }));
  },

  /**
   * Cambia la página actual del catálogo (1, 2, 3...).
   */
  cambiarPaginaCatalogo: (nuevaPagina) => {
    set({ paginaCatalogo: nuevaPagina });
  },

  /**
   * Descarga la lista general de subastas desde el servidor ('GET /api/subastas').
   */
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

  /**
   * Descarga el detalle completo de una subasta específica ('GET /api/subastas/:id').
   * Actualiza tanto 'detalleSubastaActual' como el elemento correspondiente dentro del array 'subastas'.
   */
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

  /**
   * Publica una nueva subasta en el sistema ('POST /api/subastas').
   * Al crearse con éxito, se inserta al inicio del array 'subastas' localmente.
   */
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

  /**
   * Modifica una publicación existente ('PUT /api/subastas/:id').
   * Si la subasta editada es la que el usuario tiene abierta en pantalla,
   * recarga sus datos frescos para reflejar los cambios de inmediato.
   */
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

  /**
   * Elimina o cancela una subasta ('DELETE /api/subastas/:id').
   * Limpia la publicación de la lista en memoria mediante 'eliminarPorId'.
   */
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

