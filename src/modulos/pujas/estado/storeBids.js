import { create } from 'zustand';
import {
  hayTokenSesion,
  peticionHttp,
  registrarLimpiezaSesion,
} from '../../nucleo/servicios/clienteApi';
import { mismoId, reemplazarPorId } from '../../nucleo/utilidades/ayudas';
import { useStoreAuctions } from '../../subastas/estado/storeAuctions';

async function refrescarSubastaDespuesDePuja(idSubasta) {
  const storeAuctions = useStoreAuctions.getState();
  await storeAuctions.obtenerSubastas();

  const detalle = storeAuctions.detalleSubastaActual;
  if (detalle && mismoId(detalle.id, idSubasta)) {
    await storeAuctions.obtenerSubastaPorId(idSubasta);
  }
}

// Tienda global de pujas u ofertas (conecta con /api/bids)
export const useStoreBids = create((set) => ({
  // ESTADOS REACTIVOS
  pujas: [],        // Listado de todas las ofertas registradas
  cargando: false,  // Indicador de llamada en curso
  error: null,      // Mensaje de error si la petición falla

  obtenerPujas: async () => {
    if (!hayTokenSesion()) {
      set({ pujas: [], cargando: false });
      return [];
    }

    set({ cargando: true, error: null });
    try {
      const datos = await peticionHttp('/pujas');
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
        subastaId: Number(idSubasta),
        monto: Number(monto),
        nota: nota ? nota.trim() : '',
        compromisoAceptado: Boolean(compromisoAceptado),
      };

      const creada = await peticionHttp('/pujas', {
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
      const cuerpo = {
        nota: String(cambios.nota || '').trim(),
      };

      const actualizada = await peticionHttp(`/pujas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cuerpo),
      });
      set((estado) => ({ pujas: reemplazarPorId(estado.pujas, id, actualizada) }));

      await refrescarSubastaDespuesDePuja(actualizada.subastaId);
      return actualizada;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

// Al cerrar sesión, limpiamos el historial de pujas en memoria
registrarLimpiezaSesion(() => {
  useStoreBids.setState({ pujas: [], error: null, cargando: false });
});
