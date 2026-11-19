import { create } from 'zustand';
import {
  hayTokenSesion,
  peticionHttp,
  registrarLimpiezaSesion,
} from '../../nucleo/servicios/clienteApi';
import { eliminarPorId, reemplazarPorId } from '../../nucleo/utilidades/ayudas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { usarTiendaNotificaciones } from '../../notificaciones/estado/tiendaNotificaciones';

// Tienda global de reportes e infracciones RN06 (conecta con /api/reports)
export const usarTiendaReportes = create((set) => ({
  // ESTADOS REACTIVOS
  reportes: [],     // Listado de tickets (abiertos, en revisión, resueltos)
  cargando: false,  // Bandera de llamada HTTP en curso
  error: null,      // Mensaje de error si falla la conexión

  obtenerReportes: async () => {
    if (!hayTokenSesion()) {
      set({ reportes: [], cargando: false });
      return [];
    }

    set({ cargando: true, error: null });
    try {
      const datos = await peticionHttp('/reportes');
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
        subastaId: Number(datos.idSubasta),
        denunciadoId: Number(datos.idUsuarioReportado),
        motivo: datos.motivo ? datos.motivo.trim() : '',
        descripcion: datos.descripcion ? datos.descripcion.trim() : '',
        urlEvidencia: datos.urlEvidencia ? datos.urlEvidencia.trim() : '',
      };

      const creado = await peticionHttp('/reportes', {
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
      if (cambios.motivo !== undefined) cuerpo.motivo = cambios.motivo;
      if (cambios.descripcion !== undefined) cuerpo.descripcion = cambios.descripcion;
      if (cambios.urlEvidencia !== undefined) cuerpo.urlEvidencia = cambios.urlEvidencia;
      if (cambios.estado !== undefined) cuerpo.estado = cambios.estado;
      if (cambios.sancionAplicada !== undefined) cuerpo.sancionAplicada = cambios.sancionAplicada;
      if (cambios.accionCuenta !== undefined) cuerpo.accionCuenta = cambios.accionCuenta;

      const actualizado = await peticionHttp(`/reportes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(cuerpo),
      });

      set((estado) => ({
        reportes: reemplazarPorId(estado.reportes, id, actualizado),
      }));

      // Al resolver un reporte puede cambiar el estado del usuario denunciado y llegar avisos
      await usarTiendaAutenticacion.getState().obtenerUsuarios();
      if (hayTokenSesion()) {
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
      await peticionHttp(`/reportes/${id}`, { method: 'DELETE' });
      set((estado) => ({ reportes: eliminarPorId(estado.reportes, id) }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

// Al cerrar sesión, limpiamos los reportes cargados en memoria
registrarLimpiezaSesion(() => {
  usarTiendaReportes.setState({ reportes: [], error: null, cargando: false });
});

