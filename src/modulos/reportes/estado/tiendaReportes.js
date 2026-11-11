import { create } from 'zustand';
import { peticionHttp, registrarLimpiezaSesion } from '../../nucleo/servicios/clienteApi';
import { eliminarPorId, reemplazarPorId } from '../../nucleo/utilidades/ayudas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { usarTiendaNotificaciones } from '../../notificaciones/estado/tiendaNotificaciones';

// Tienda global de reportes e infracciones RN06 (conecta con /api/reports)
export const usarTiendaReportes = create((set) => ({
  reportes: [],
  cargando: false,
  error: null,

  obtenerReportes: async () => {
    if (!localStorage.getItem('bidzone_token')) {
      set({ reportes: [], cargando: false });
      return [];
    }

    set({ cargando: true, error: null });
    try {
      const datos = await peticionHttp('/reports');
      set({ reportes: datos, cargando: false });
      return datos;
    } catch (error) {
      set({ cargando: false, error: error.message });
      return [];
    }
  },

  crearReporte: async (datos) => {
    set({ error: null });
    try {
      const cuerpo = {
        auctionId: Number(datos.idSubasta),
        reportedUserId: Number(datos.idUsuarioReportado),
        reason: datos.motivo ? datos.motivo.trim() : '',
        description: datos.descripcion ? datos.descripcion.trim() : '',
        evidenceUrl: datos.urlEvidencia ? datos.urlEvidencia.trim() : '',
      };

      const creado = await peticionHttp('/reports', {
        method: 'POST',
        body: JSON.stringify(cuerpo),
      });
      set((estado) => ({ reportes: [creado, ...estado.reportes] }));
      return creado;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  actualizarReporte: async (id, cambios) => {
    set({ error: null });
    try {
      const cuerpo = {};
      if (cambios.motivo !== undefined) cuerpo.reason = cambios.motivo;
      if (cambios.descripcion !== undefined) cuerpo.description = cambios.descripcion;
      if (cambios.urlEvidencia !== undefined) cuerpo.evidenceUrl = cambios.urlEvidencia;
      if (cambios.estado !== undefined) cuerpo.status = cambios.estado;
      if (cambios.sancionAplicada !== undefined) cuerpo.sanctionApplied = cambios.sancionAplicada;
      if (cambios.accionCuenta !== undefined) cuerpo.accountAction = cambios.accionCuenta;

      const actualizado = await peticionHttp(`/reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(cuerpo),
      });

      set((estado) => ({
        reportes: reemplazarPorId(estado.reportes, id, actualizado),
      }));

      // Al resolver un reporte puede cambiar el estado del usuario denunciado y llegar avisos
      await usarTiendaAutenticacion.getState().obtenerUsuarios();
      if (localStorage.getItem('bidzone_token')) {
        await usarTiendaNotificaciones.getState().obtenerNotificaciones();
      }
      return actualizado;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  eliminarReporte: async (id) => {
    set({ error: null });
    try {
      await peticionHttp(`/reports/${id}`, { method: 'DELETE' });
      set((estado) => ({ reportes: eliminarPorId(estado.reportes, id) }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

registrarLimpiezaSesion(() => {
  usarTiendaReportes.setState({ reportes: [], error: null, cargando: false });
});

