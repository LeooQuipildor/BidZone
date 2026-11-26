import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStoreBids } from '../estado/storeBids';
import { useStoreAuctions } from '../../subastas/estado/storeAuctions';
import { useStoreAuthentication } from '../../autenticacion/estado/storeAuthentication';
import { FormularioPuja } from './FormularioPuja';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaEditarPuja() {
  const { id } = useParams();
  const navegar = useNavigate();

  const pujas = useStoreBids((estado) => estado.pujas);
  const cargandoPujas = useStoreBids((estado) => estado.cargando);
  const obtenerPujas = useStoreBids((estado) => estado.obtenerPujas);
  const actualizarPuja = useStoreBids((estado) => estado.actualizarPuja);
  const subastas = useStoreAuctions((estado) => estado.subastas);
  const obtenerSubastas = useStoreAuctions((estado) => estado.obtenerSubastas);
  const usuarioActual = useStoreAuthentication((estado) => estado.usuarioActual);

  useEffect(() => {
    obtenerPujas();
    obtenerSubastas();
  }, [obtenerPujas, obtenerSubastas]);

  // Búsqueda de la puja objetivo
  const puja = buscarPorId(pujas, id);

  // Verificación de seguridad y titularidad
  let errorTitulo = '';
  let errorMensaje = '';
  if (!puja) {
    errorTitulo = 'Puja no encontrada';
    errorMensaje = 'El registro de oferta solicitado no existe.';
  } else if (!mismoId(usuarioActual?.id, puja.postorId)) {
    errorTitulo = 'Sin permisos de edición';
    errorMensaje = 'Solo el postor titular puede editar su nota de coordinación; los montos ofertados no se editan.';
  }

  // Identificación de la subasta vinculada
  const subasta = puja ? buscarPorId(subastas, puja.subastaId) : null;
  const tituloSubasta = subasta?.titulo || puja?.tituloSubasta || `#${puja?.subastaId}`;

  return (
    <PaginaFormulario
      titulo={puja ? `Editar Nota de Puja #${puja.id}` : 'Editar Nota de Puja'}
      subtitulo={`Subasta asociada: ${tituloSubasta}`}
      textoVolver="Volver a Pujas"
      alVolver={() => navegar('/pujas')}
      cargando={cargandoPujas && !puja}
      textoCarga="Cargando puja..."
      errorTitulo={errorTitulo}
      errorMensaje={errorMensaje}
    >
      {puja && (
        <FormularioPuja
          key={puja.id}
          puja={puja}
          subastas={subastas}
          alActualizarPuja={actualizarPuja}
          alGuardar={() => navegar('/pujas')}
          alCancelar={() => navegar('/pujas')}
        />
      )}
    </PaginaFormulario>
  );
}
