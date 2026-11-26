import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStoreReviews } from '../estado/storeReviews';
import { useStoreAuctions } from '../../subastas/estado/storeAuctions';
import { useStoreAuthentication } from '../../autenticacion/estado/storeAuthentication';
import { mismoId } from '../../nucleo/utilidades/ayudas';
import { obtenerSubastasPendientesResena } from '../utilidades/ayudasResena';
import { FormularioResena } from './FormularioResena';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaCrearResena() {
  const navegar = useNavigate();

  // Lectura de parámetros query string opcionales
  const [parametrosUrl] = useSearchParams();
  const idSubastaInicial = parametrosUrl.get('subasta') || parametrosUrl.get('auctionId') || '';

  const resenas = useStoreReviews((estado) => estado.resenas);
  const obtenerResenas = useStoreReviews((estado) => estado.obtenerResenas);
  const crearResena = useStoreReviews((estado) => estado.crearResena);
  const subastas = useStoreAuctions((estado) => estado.subastas);
  const cargandoSubastas = useStoreAuctions((estado) => estado.cargando);
  const obtenerSubastas = useStoreAuctions((estado) => estado.obtenerSubastas);
  const usuarios = useStoreAuthentication((estado) => estado.usuarios);
  const obtenerUsuarios = useStoreAuthentication((estado) => estado.obtenerUsuarios);
  const usuarioActual = useStoreAuthentication((estado) => estado.usuarioActual);

  useEffect(() => {
    obtenerSubastas();
    obtenerUsuarios();
    obtenerResenas();
  }, [obtenerSubastas, obtenerUsuarios, obtenerResenas]);

  // Subastas cerradas donde el usuario participó y tiene pendiente emitir su reseña
  const subastasElegibles = obtenerSubastasPendientesResena(subastas, resenas, usuarioActual?.id);

  // Lista de contrapartes excluyendo al usuario en sesión
  const otrosUsuarios = usuarios.filter((usuario) => !mismoId(usuario.id, usuarioActual?.id));

  return (
    <PaginaFormulario
      titulo="Emitir Calificación (RN07)"
      subtitulo="Califica de 1 a 5 estrellas a tu contraparte luego de finalizar la subasta y coordinar la entrega."
      alVolver={() => navegar('/resenas')}
      cargando={cargandoSubastas && subastas.length === 0}
      textoCarga="Cargando operaciones calificables..."
    >
      <FormularioResena
        subastasElegibles={subastasElegibles}
        otrosUsuarios={otrosUsuarios}
        resenas={resenas}
        idUsuarioActual={usuarioActual?.id}
        idSubastaInicial={idSubastaInicial}
        alCrearResena={crearResena}
        alGuardar={() => navegar('/resenas')}
        alCancelar={() => navegar('/resenas')}
      />
    </PaginaFormulario>
  );
}
