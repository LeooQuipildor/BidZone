import { create } from 'zustand';
import { peticionHttp, registrarLimpiezaSesion } from '../../nucleo/servicios/clienteApi';
import {
  buscarPorId,
  eliminarPorId,
  mismoId,
  reemplazarPorId,
} from '../../nucleo/utilidades/ayudas';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';

// Al crear, editar o borrar una puja también se actualiza el precio actual de su subasta
async function refrescarSubastaDespuesDePuja(idSubasta) {
  const tiendaSubastas = usarTiendaSubastas.getState();
  await tiendaSubastas.obtenerSubastas();

  const detalle = tiendaSubastas.detalleSubastaActual;
  if (detalle && mismoId(detalle.id, idSubasta)) {
    await tiendaSubastas.obtenerSubastaPorId(idSubasta);
  }
}

// Tienda global de pujas u ofertas (conecta con /api/bids)
export const usarTiendaPujas = create((set, get) => ({
  pujas: [],
  cargando: false,
  error: null,

  obtenerPujas: async () => {
    if (!localStorage.getItem('bidzone_token')) {
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

  actualizarPuja: async (id, cambios) => {
    set({ error: null });
    try {
      const cuerpo = {};
      if (cambios.monto !== undefined && cambios.monto !== '') {
        cuerpo.amount = Number(cambios.monto);
      }
      if (cambios.nota !== undefined) {
        cuerpo.note = String(cambios.nota).trim();
      }

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

  eliminarPuja: async (id) => {
    set({ error: null });
    const pujaExistente = buscarPorId(get().pujas, id);

    try {
      await peticionHttp(`/bids/${id}`, { method: 'DELETE' });
      set((estado) => ({ pujas: eliminarPorId(estado.pujas, id) }));

      if (pujaExistente) {
        await refrescarSubastaDespuesDePuja(pujaExistente.auctionId);
      }
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

registrarLimpiezaSesion(() => {
  usarTiendaPujas.setState({ pujas: [], error: null, cargando: false });
});

