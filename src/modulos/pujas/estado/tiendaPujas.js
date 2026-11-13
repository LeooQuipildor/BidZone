// ============================================================================
// ARCHIVO: src/modulos/pujas/estado/tiendaPujas.js
// RESPONSABILIDAD: Estado global de ofertas vinculantes (Pujas / Bids).
// ============================================================================
//
// ¿QUÉ HACE ESTA TIENDA?
// Administra el historial de ofertas de la plataforma y conecta con '/api/bids'.
//
// REGLA DE NEGOCIO RN04 (Irrevocabilidad de Ofertas):
// Una oferta registrada representa un compromiso legal y vinculante entre compradores.
// Por esta razón, la acción 'actualizarPuja' SOLO permite modificar la nota aclaratoria
// de coordinación, mientras que el importe ofertado ('amount') nunca puede alterarse ni borrarse.
//
// SINCRONIZACIÓN ENTRE TIENDAS (Cross-Store):
// Al registrar una nueva puja exitosa, el precio líder de la subasta aumenta en el backend.
// Para que toda la interfaz refleje el nuevo precio de inmediato sin recargar la página,
// esta tienda invoca la función auxiliar 'refrescarSubastaDespuesDePuja', la cual le pide
// a 'usarTiendaSubastas' que vuelva a sincronizar sus datos.
// ============================================================================

import { create } from 'zustand';
import {
  hayTokenSesion,
  peticionHttp,
  registrarLimpiezaSesion,
} from '../../nucleo/servicios/clienteApi';
import { mismoId, reemplazarPorId } from '../../nucleo/utilidades/ayudas';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';

/**
 * Función auxiliar de sincronización entre módulos.
 * Vuelve a pedir las subastas al servidor para que el nuevo precio líder se refleje
 * tanto en las tarjetas del catálogo como en la pantalla de detalle si está abierta.
 */
async function refrescarSubastaDespuesDePuja(idSubasta) {
  const tiendaSubastas = usarTiendaSubastas.getState();
  await tiendaSubastas.obtenerSubastas();

  const detalle = tiendaSubastas.detalleSubastaActual;
  if (detalle && mismoId(detalle.id, idSubasta)) {
    await tiendaSubastas.obtenerSubastaPorId(idSubasta);
  }
}

// Tienda global de pujas u ofertas (conecta con /api/bids)
export const usarTiendaPujas = create((set) => ({
  // ESTADOS REACTIVOS
  pujas: [],        // Listado de todas las ofertas registradas
  cargando: false,  // Indicador de llamada en curso
  error: null,      // Mensaje de error si la petición falla

  /**
   * Obtiene el listado de ofertas desde el servidor ('GET /api/bids').
   * Si no hay sesión iniciada, limpia el array local.
   */
  obtenerPujas: async () => {
    if (!hayTokenSesion()) {
      set({ pujas: [], cargando: false });
      return [];
    }

    set({ cargando: true, error: null });
    try {
      const datos = await peticionHttp('/bids');
      set({ pujas: datos, cargando: false });
      return datos;
    } catch (error) {
      set({ cargando: false, error: error.message });
      return [];
    }
  },

  /**
   * Envía una nueva oferta vinculante al backend ('POST /api/bids').
   * 
   * PASOS:
   * 1. Arma el payload con 'auctionId', 'amount', 'note' y 'commitmentAccepted'.
   * 2. Envía la llamada con el token JWT.
   * 3. Inserta la nueva oferta al inicio del array 'pujas' localmente.
   * 4. Llama a 'refrescarSubastaDespuesDePuja' para actualizar el precio en pantalla.
   */
  crearPuja: async ({ idSubasta, monto, nota, compromisoAceptado }) => {
    set({ error: null });
    try {
      const cuerpo = {
        auctionId: Number(idSubasta),
        amount: Number(monto),
        note: nota ? nota.trim() : '',
        commitmentAccepted: Boolean(compromisoAceptado),
      };

      const creada = await peticionHttp('/bids', {
        method: 'POST',
        body: JSON.stringify(cuerpo),
      });
      set((estado) => ({ pujas: [creada, ...estado.pujas] }));

      await refrescarSubastaDespuesDePuja(idSubasta);
      return creada;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Actualiza únicamente la nota aclaratoria de una oferta ('PUT /api/bids/:id').
   * Aplica la regla RN04: el monto monetario no se modifica.
   */
  actualizarPuja: async (id, cambios) => {
    set({ error: null });
    try {
      const cuerpo = {
        note: String(cambios.nota || '').trim(),
      };

      const actualizada = await peticionHttp(`/bids/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cuerpo),
      });
      set((estado) => ({ pujas: reemplazarPorId(estado.pujas, id, actualizada) }));

      await refrescarSubastaDespuesDePuja(actualizada.auctionId);
      return actualizada;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

// Al cerrar sesión, limpiamos el historial de pujas en memoria
registrarLimpiezaSesion(() => {
  usarTiendaPujas.setState({ pujas: [], error: null, cargando: false });
});
