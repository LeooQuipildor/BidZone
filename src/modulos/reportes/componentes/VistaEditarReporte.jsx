/**
 * ==============================================================================
 * ARCHIVO: src/modulos/reportes/componentes/VistaEditarReporte.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de vista de página completa para consultar, modificar o dictaminar
 * un ticket de reporte existente en la ruta `/reportes/:id/editar`.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Obtiene el parámetro dinámico `id` del ticket desde la URL con `useParams()`.
 * 2. Carga los reportes y los perfiles de usuarios desde las tiendas Zustand.
 * 3. Valida permisos de seguridad:
 *    - Un Administrador siempre tiene acceso para intervenir y dictaminar la sanción.
 *    - Un usuario regular solo puede ingresar si es el denunciante original (`reporte.reporterId`).
 *    - Si no cumple los permisos, se muestra una tarjeta de error descriptiva.
 * 4. Bifurca la interfaz de forma adaptativa según el rol:
 *    - Si es Administrador (`esAdmin`): Muestra el resumen de la denuncia junto con el
 *      `PanelResolucionTicket` para aplicar sanciones, cierres o suspensiones de cuenta (RN06).
 *    - Si es Usuario regular: Muestra `FormularioReporte` para que pueda aportar más evidencia o corregir su reclamo.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Vistas Polimórficas por Rol (Role-based Views):
 *   El mismo endpoint `/reportes/:id/editar` muestra una pantalla completamente diferente dependiendo de si
 *   el usuario autenticado es un juez/administrador o la parte denunciante, reutilizando la misma URL.
 */

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usarTiendaReportes } from '../estado/tiendaReportes';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { FormularioReporte } from './FormularioReporte';
import { PanelResolucionTicket } from './PanelResolucionTicket';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaEditarReporte() {
  const { id } = useParams();
  const navegar = useNavigate();

  /**
   * Suscripciones a tiendas:
   */
  const reportes = usarTiendaReportes((estado) => estado.reportes);
  const cargandoReportes = usarTiendaReportes((estado) => estado.cargando);
  const obtenerReportes = usarTiendaReportes((estado) => estado.obtenerReportes);
  const actualizarReporte = usarTiendaReportes((estado) => estado.actualizarReporte);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);
  const usuarios = usarTiendaAutenticacion((estado) => estado.usuarios);
  const obtenerUsuarios = usarTiendaAutenticacion((estado) => estado.obtenerUsuarios);

  /**
   * Carga de expedientes y usuarios involucrados
   */
  useEffect(() => {
    obtenerReportes();
    obtenerUsuarios();
  }, [obtenerReportes, obtenerUsuarios]);

  // Búsqueda del reporte objetivo
  const reporte = buscarPorId(reportes, id);
  const esAdmin = usuarioActual?.role === 'admin';

  // Verificación estricta de permisos de acceso
  let errorTitulo = '';
  let errorMensaje = '';
  if (!reporte) {
    errorTitulo = 'Reporte no encontrado';
    errorMensaje = 'El expediente solicitado no existe o no tienes acceso para consultarlo.';
  } else if (!esAdmin && !mismoId(usuarioActual?.id, reporte.reporterId)) {
    errorTitulo = 'Sin permisos de edición';
    errorMensaje = 'Solo el denunciante original o un administrador puede modificar este reporte.';
  }

  // Identificación del usuario acusado y su estado actual
  const usuarioReportado = reporte ? buscarPorId(usuarios, reporte.reportedUserId) : null;
  const nombreReportado =
    usuarioReportado?.name || reporte?.reportedUserName || `#${reporte?.reportedUserId}`;
  const estadoReportado = usuarioReportado?.status
    ? `Estado actual: ${usuarioReportado.status}`
    : 'En evaluación';

  return (
    <PaginaFormulario
      titulo={reporte ? `Ticket #${reporte.id}` : 'Ticket de Reporte'}
      subtitulo={`Usuario denunciado: ${nombreReportado} (${estadoReportado})`}
      textoVolver="Volver a Reportes"
      alVolver={() => navegar('/reportes')}
      cargando={cargandoReportes && !reporte}
      textoCarga="Cargando expediente..."
      errorTitulo={errorTitulo}
      errorMensaje={errorMensaje}
    >
      {/* Caso 1: Administrador dictaminando el caso con el panel de resolución */}
      {reporte && esAdmin && (
        <div className="space-y-4">
          <div className="rounded-xl bg-[#F7FBF3] border border-[#224F10]/10 p-4 space-y-1.5 text-xs">
            <h3 className="text-sm font-bold text-[#0D0D0D]">{reporte.reason}</h3>
            <p className="text-[#0D0D0D]/75">{reporte.description}</p>
          </div>
          <PanelResolucionTicket
            key={reporte.id}
            reporte={reporte}
            nombreDenunciado={nombreReportado}
            estadoDenunciado={usuarioReportado?.status}
            alActualizarReporte={actualizarReporte}
            alGuardar={() => navegar('/reportes')}
            alCancelar={() => navegar('/reportes')}
          />
        </div>
      )}

      {/* Caso 2: Denunciante particular actualizando su queja */}
      {reporte && !esAdmin && (
        <FormularioReporte
          key={reporte.id}
          reporte={reporte}
          alActualizarReporte={actualizarReporte}
          alGuardar={() => navegar('/reportes')}
          alCancelar={() => navegar('/reportes')}
        />
      )}
    </PaginaFormulario>
  );
}
