import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usarTiendaReportes } from '../estado/tiendaReportes';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { mismoId } from '../../nucleo/utilidades/ayudas';
import { FormularioReporte } from './FormularioReporte';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaCrearReporte() {
  const navegar = useNavigate();
  const [parametrosUrl] = useSearchParams();
  const idSubastaInicial = parametrosUrl.get('subasta') || parametrosUrl.get('auctionId') || '';
  const idUsuarioReportadoInicial =
    parametrosUrl.get('reportado') || parametrosUrl.get('reportedUserId') || '';

  const crearReporte = usarTiendaReportes((estado) => estado.crearReporte);
  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const obtenerSubastas = usarTiendaSubastas((estado) => estado.obtenerSubastas);
  const usuarios = usarTiendaAutenticacion((estado) => estado.usuarios);
  const obtenerUsuarios = usarTiendaAutenticacion((estado) => estado.obtenerUsuarios);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);

  useEffect(() => {
    obtenerSubastas();
    obtenerUsuarios();
  }, [obtenerSubastas, obtenerUsuarios]);

  const otrosUsuarios = usuarios.filter((usuario) => !mismoId(usuario.id, usuarioActual?.id));

  return (
    <PaginaFormulario
      titulo="Informar Incumplimiento de Operación"
      subtitulo="Si liberados los datos de contacto la contraparte no abona el artículo o no lo entrega, radica la denuncia para evaluar sanción."
      alVolver={() => navegar('/reportes')}
    >
      <FormularioReporte
        subastas={subastas}
        otrosUsuarios={otrosUsuarios}
        idSubastaInicial={idSubastaInicial}
        idUsuarioReportadoInicial={idUsuarioReportadoInicial}
        alCrearReporte={crearReporte}
        alGuardar={() => navegar('/reportes')}
        alCancelar={() => navegar('/reportes')}
      />
    </PaginaFormulario>
  );
}
