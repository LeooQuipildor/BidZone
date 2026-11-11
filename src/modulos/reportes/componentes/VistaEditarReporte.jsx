import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usarTiendaReportes } from '../estado/tiendaReportes';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { FormularioReporte } from './FormularioReporte';
import { ErrorCard, Loading } from '../../nucleo/diseno/uiFeedback';
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

  if (cargandoReportes && !reporte) return <Loading text="Cargando expediente..." />;

  if (!reporte) {
    return (
      <ErrorCard
        title="Reporte no encontrado"
        message="El expediente solicitado no existe o no tienes acceso para consultarlo."
        backLabel="Volver a Reportes"
        onBack={() => navegar('/reports')}
      />
    );
  }

  const esDenunciante = mismoId(usuarioActual?.id, reporte.reporterId);
  if (!esAdmin && !esDenunciante) {
    return (
      <ErrorCard
        title="Sin permisos de edición"
        message="Solo el denunciante original o un administrador puede modificar este reporte."
        backLabel="Volver a Reportes"
        onBack={() => navegar('/reports')}
      />
    );
  }

  const usuarioReportado = buscarPorId(usuarios, reporte.reportedUserId);
  const nombreReportado =
    usuarioReportado?.name || reporte.reportedUserName || `#${reporte.reportedUserId}`;
  const estadoReportado = usuarioReportado?.status
    ? `Estado actual: ${usuarioReportado.status}`
    : 'En evaluación';

  return (
    <PaginaFormulario
      titulo={`Expediente de reporte #${reporte.id}`}
      subtitulo={`Usuario denunciado: ${nombreReportado} (${estadoReportado})`}
      alVolver={() => navegar('/reports')}
    >
      <FormularioReporte
        key={`${reporte.id}-${reporte.updatedAt || reporte.status}`}
        reporte={reporte}
        esAdmin={esAdmin}
        alActualizarReporte={actualizarReporte}
        alGuardar={() => navegar('/reports')}
        alCancelar={() => navegar('/reports')}
      />
    </PaginaFormulario>
  );
}
