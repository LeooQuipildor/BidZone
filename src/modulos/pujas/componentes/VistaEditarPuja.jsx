import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usarTiendaPujas } from '../estado/tiendaPujas';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { FormularioPuja } from './FormularioPuja';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { ErrorCard, Loading } from '../../nucleo/diseno/uiFeedback';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaEditarPuja() {
  const { id } = useParams();
  const navegar = useNavigate();

  const pujas = usarTiendaPujas((estado) => estado.pujas);
  const cargandoPujas = usarTiendaPujas((estado) => estado.cargando);
  const obtenerPujas = usarTiendaPujas((estado) => estado.obtenerPujas);
  const actualizarPuja = usarTiendaPujas((estado) => estado.actualizarPuja);
  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const obtenerSubastas = usarTiendaSubastas((estado) => estado.obtenerSubastas);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);

  useEffect(() => {
    obtenerPujas();
    obtenerSubastas();
  }, [obtenerPujas, obtenerSubastas]);

  const puja = buscarPorId(pujas, id);

  if (cargandoPujas && !puja) return <Loading text="Cargando puja..." />;

  if (!puja) {
    return (
      <ErrorCard
        title="Puja no encontrada"
        message="El registro de oferta solicitado no existe."
        backLabel="Volver a Pujas"
        onBack={() => navegar('/bids')}
      />
    );
  }

  const esDuenoPuja = mismoId(usuarioActual?.id, puja.bidderId);
  if (!esDuenoPuja) {
    return (
      <ErrorCard
        title="Sin permisos de edición"
        message="RN04: Solo el postor titular puede editar su nota de coordinación; los montos ofertados no se editan."
        backLabel="Volver a Pujas"
        onBack={() => navegar('/bids')}
      />
    );
  }

  const subasta = buscarPorId(subastas, puja.auctionId);
  const tituloSubasta = subasta?.title || puja.auctionTitle || `#${puja.auctionId}`;

  return (
    <PaginaFormulario
      titulo={`Editar Nota de Puja #${puja.id}`}
      subtitulo={`Subasta asociada: ${tituloSubasta}`}
      alVolver={() => navegar('/bids')}
    >
      <FormularioPuja
        key={puja.id}
        puja={puja}
        subastas={subastas}
        alActualizarPuja={actualizarPuja}
        alGuardar={() => navegar('/bids')}
        alCancelar={() => navegar('/bids')}
      />
    </PaginaFormulario>
  );
}
