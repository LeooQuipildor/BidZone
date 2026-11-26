import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStoreReports } from '../estado/storeReports';
import { useStoreAuthentication } from '../../autenticacion/estado/storeAuthentication';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { FormularioReporte } from './FormularioReporte';
import { PanelResolucionTicket } from './PanelResolucionTicket';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaEditarReporte() {
  const { id } = useParams();
  const navegar = useNavigate();

  const reportes = useStoreReports((estado) => estado.reportes);
  const cargandoReportes = useStoreReports((estado) => estado.cargando);
  const obtenerReportes = useStoreReports((estado) => estado.obtenerReportes);
  const actualizarReporte = useStoreReports((estado) => estado.actualizarReporte);
  const usuarioActual = useStoreAuthentication((estado) => estado.usuarioActual);
  const usuarios = useStoreAuthentication((estado) => estado.usuarios);
  const obtenerUsuarios = useStoreAuthentication((estado) => estado.obtenerUsuarios);

  useEffect(() => {
    obtenerReportes();
    obtenerUsuarios();
  }, [obtenerReportes, obtenerUsuarios]);

  // Búsqueda del reporte objetivo
  const reporte = buscarPorId(reportes, id);
  const esAdmin = usuarioActual?.rol === 'admin';

  // Verificación estricta de permisos de acceso
  let errorTitulo = '';
  let errorMensaje = '';
  if (!reporte) {
    errorTitulo = 'Reporte no encontrado';
    errorMensaje = 'El expediente solicitado no existe o no tienes acceso para consultarlo.';
  } else if (!esAdmin && !mismoId(usuarioActual?.id, reporte.denuncianteId)) {
    errorTitulo = 'Sin permisos de edición';
    errorMensaje = 'Solo el denunciante original o un administrador puede modificar este reporte.';
  }

  // Identificación del usuario acusado y su estado actual
  const usuarioReportado = reporte ? buscarPorId(usuarios, reporte.denunciadoId) : null;
  const nombreReportado =
    usuarioReportado?.nombre || reporte?.nombreDenunciado || `#${reporte?.denunciadoId}`;
  const estadoReportado = usuarioReportado?.estado
    ? `Estado actual: ${usuarioReportado.estado}`
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
            <h3 className="text-sm font-bold text-[#0D0D0D]">{reporte.motivo}</h3>
            <p className="text-[#0D0D0D]/75">{reporte.descripcion}</p>
          </div>
          <PanelResolucionTicket
            key={reporte.id}
            reporte={reporte}
            nombreDenunciado={nombreReportado}
            estadoDenunciado={usuarioReportado?.estado}
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
