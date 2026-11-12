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

  const reportes = usarTiendaReportes((estado) => estado.reportes);
  const cargandoReportes = usarTiendaReportes((estado) => estado.cargando);
  const obtenerReportes = usarTiendaReportes((estado) => estado.obtenerReportes);
  const actualizarReporte = usarTiendaReportes((estado) => estado.actualizarReporte);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);
  const usuarios = usarTiendaAutenticacion((estado) => estado.usuarios);
  const obtenerUsuarios = usarTiendaAutenticacion((estado) => estado.obtenerUsuarios);

  useEffect(() => {
    obtenerReportes();
    obtenerUsuarios();
  }, [obtenerReportes, obtenerUsuarios]);

  const reporte = buscarPorId(reportes, id);
  const esAdmin = usuarioActual?.role === 'admin';

  let errorTitulo = '';
  let errorMensaje = '';
  if (!reporte) {
    errorTitulo = 'Reporte no encontrado';
    errorMensaje = 'El expediente solicitado no existe o no tienes acceso para consultarlo.';
  } else if (!esAdmin && !mismoId(usuarioActual?.id, reporte.reporterId)) {
    errorTitulo = 'Sin permisos de edición';
    errorMensaje = 'Solo el denunciante original o un administrador puede modificar este reporte.';
  }

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
