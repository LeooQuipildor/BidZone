import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStoreReports } from '../estado/storeReports';
import { useStoreAuctions } from '../../subastas/estado/storeAuctions';
import { useStoreAuthentication } from '../../autenticacion/estado/storeAuthentication';
import { mismoId } from '../../nucleo/utilidades/ayudas';
import { FormularioReporte } from './FormularioReporte';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaCrearReporte() {
  const navegar = useNavigate();

  const [parametrosUrl] = useSearchParams();
  const idSubastaInicial = parametrosUrl.get('subasta') || parametrosUrl.get('auctionId') || '';
  const idUsuarioReportadoInicial =
    parametrosUrl.get('reportado') || parametrosUrl.get('reportedUserId') || '';

  const crearReporte = useStoreReports((estado) => estado.crearReporte);
  const subastas = useStoreAuctions((estado) => estado.subastas);
  const obtenerSubastas = useStoreAuctions((estado) => estado.obtenerSubastas);
  const usuarios = useStoreAuthentication((estado) => estado.usuarios);
  const obtenerUsuarios = useStoreAuthentication((estado) => estado.obtenerUsuarios);
  const usuarioActual = useStoreAuthentication((estado) => estado.usuarioActual);

  useEffect(() => {
    obtenerSubastas();
    obtenerUsuarios();
  }, [obtenerSubastas, obtenerUsuarios]);

  // Lista de usuarios descartando al propio usuario en sesión
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
