import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usarTiendaSubastas } from '../estado/tiendaSubastas';
import { usarTiendaPujas } from '../../pujas/estado/tiendaPujas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { FormularioSubasta } from './FormularioSubasta';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { Loading, ErrorCard } from '../../nucleo/diseno/uiFeedback';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaEditarSubasta() {
  const { id } = useParams();
  const navegar = useNavigate();

  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const detalleSubastaActual = usarTiendaSubastas((estado) => estado.detalleSubastaActual);
  const cargandoDetalle = usarTiendaSubastas((estado) => estado.cargandoDetalle);
  const obtenerSubastaPorId = usarTiendaSubastas((estado) => estado.obtenerSubastaPorId);
  const actualizarSubasta = usarTiendaSubastas((estado) => estado.actualizarSubasta);
  const pujas = usarTiendaPujas((estado) => estado.pujas);
  const obtenerPujas = usarTiendaPujas((estado) => estado.obtenerPujas);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);

  useEffect(() => {
    obtenerSubastaPorId(id);
    obtenerPujas();
  }, [id, obtenerSubastaPorId, obtenerPujas]);

  const subasta =
    detalleSubastaActual && mismoId(detalleSubastaActual.id, id)
      ? detalleSubastaActual
      : buscarPorId(subastas, id);

  if (cargandoDetalle && !subasta) {
    return <Loading text="Cargando subasta..." />;
  }

  if (!subasta) {
    return (
      <ErrorCard
        title="Subasta no encontrada"
        message="La subasta que intentas editar no existe."
        backLabel="Volver al catálogo"
        onBack={() => navegar('/auctions')}
      />
    );
  }

  const esAdmin = usuarioActual?.role === 'admin';
  const esDueno = mismoId(usuarioActual?.id, subasta.sellerId);

  if (!esDueno) {
    return (
      <ErrorCard
        title="Solo el vendedor puede editar"
        message="Únicamente el vendedor propietario puede modificar esta publicación. Desde el panel puedes solicitarle correcciones si tiene problemas."
        backLabel="Volver al detalle"
        onBack={() => navegar(`/auctions/${subasta.id}`)}
      />
    );
  }

  const tienePujas =
    Number(subasta.bidCount || 0) > 0 ||
    (Array.isArray(subasta.bids) && subasta.bids.length > 0) ||
    pujas.some((puja) => mismoId(puja.auctionId, id));

  async function manejarActualizacion(datos) {
    await actualizarSubasta(subasta.id, datos);
    navegar(`/auctions/${subasta.id}`);
  }

  return (
    <PaginaFormulario
      titulo={`Editar Subasta #${subasta.id}`}
      subtitulo="Actualiza la información del artículo o las condiciones de la publicación."
      textoVolver="Volver al detalle"
      alVolver={() => navegar(`/auctions/${subasta.id}`)}
    >
      <FormularioSubasta
        key={`${subasta.id}-${subasta.updatedAt || subasta.endTime}`}
        subasta={subasta}
        tienePujas={tienePujas}
        esAdmin={esAdmin}
        alEnviarFormulario={manejarActualizacion}
        alCancelar={() => navegar(`/auctions/${subasta.id}`)}
      />
    </PaginaFormulario>
  );
}
