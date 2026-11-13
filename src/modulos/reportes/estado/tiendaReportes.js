// ============================================================================
// ARCHIVO: src/modulos/reportes/estado/tiendaReportes.js
// RESPONSABILIDAD: Estado global de reclamos y mesa de mediación RN06.
// ============================================================================
//
// ¿QUÉ HACE ESTA TIENDA?
// Administra los tickets de reclamo (reportes de incumplimiento) y conecta con '/api/reports'.
//
// REGLA DE NEGOCIO RN06 (Mesa de Mediación y Sanción):
// 1. Cuando un socio incumple (ej: comprador no paga o vendedor no entrega), la contraparte
//    puede abrir un Ticket de Reclamo adjuntando motivo, descripción y enlace de evidencia.
// 2. Un usuario Administrador atiende el caso y decide la resolución:
//    - Desestimar reclamo (sin falta cometida).
//    - Resolver con sanción: advertencia formal, suspensión temporal o cierre definitivo de cuenta.
// 3. Cuando se aplica una sanción de cuenta, esta tienda actualiza automáticamente
//    la lista de usuarios ('usarTiendaAutenticacion') y las notificaciones del sistema.
// ============================================================================

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

  /**
   * Obtiene la lista de reportes desde el servidor ('GET /api/reports').
   * Si es socio, el backend devuelve sus reportes propios.
   * Si es administrador, devuelve los reportes de toda la plataforma para mediar.
   */
  obtenerReportes: async () => {
    if (!hayTokenSesion()) {
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

  /**
   * Abre un nuevo ticket de reclamo ('POST /api/reports').
   */
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

  /**
   * Actualiza o resuelve un ticket de mediación ('PATCH /api/reports/:id').
   * Utiliza el método HTTP PATCH porque solo se envían los campos modificados.
   * Si el administrador sanciona al usuario, sincroniza las tiendas de usuarios y notificaciones.
   */
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
      if (hayTokenSesion()) {
        await usarTiendaNotificaciones.getState().obtenerNotificaciones();
      }
      return actualizado;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Elimina un ticket de reclamo ('DELETE /api/reports/:id').
   */
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

// Al cerrar sesión, limpiamos los reportes cargados en memoria
registrarLimpiezaSesion(() => {
  usarTiendaReportes.setState({ reportes: [], error: null, cargando: false });
});

