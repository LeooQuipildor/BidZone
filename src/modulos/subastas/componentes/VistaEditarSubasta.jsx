import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usarTiendaSubastas } from '../estado/tiendaSubastas';
import { usarTiendaPujas } from '../../pujas/estado/tiendaPujas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { FormularioSubasta } from './FormularioSubasta';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
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

  const esAdmin = usuarioActual?.role === 'admin';
  const esDueno = Boolean(subasta && mismoId(usuarioActual?.id, subasta.sellerId));

  let errorTitulo = '';
  let errorMensaje = '';
  if (!subasta) {
    errorTitulo = 'Subasta no encontrada';
    errorMensaje = 'La subasta que intentas editar no existe.';
  } else if (!esDueno) {
    errorTitulo = 'Solo el vendedor puede editar';
    errorMensaje =
      'Únicamente el vendedor propietario puede modificar esta publicación. Desde el panel puedes solicitarle correcciones si tiene problemas.';
  }

  const rutaRetorno = subasta ? `/auctions/${subasta.id}` : '/auctions';
  const tienePujas = Boolean(
    subasta &&
      (Number(subasta.bidCount || 0) > 0 ||
        (Array.isArray(subasta.bids) && subasta.bids.length > 0) ||
        pujas.some((puja) => mismoId(puja.auctionId, id)))
  );

  async function manejarActualizacion(datos) {
    await actualizarSubasta(subasta.id, datos);
    navegar(`/auctions/${subasta.id}`);
  }

  return (
    <PaginaFormulario
      titulo={subasta ? `Editar Subasta #${subasta.id}` : 'Editar Subasta'}
      subtitulo="Actualiza la información del artículo o las condiciones de la publicación."
      textoVolver={subasta ? 'Volver al detalle' : 'Volver al catálogo'}
      alVolver={() => navegar(rutaRetorno)}
      cargando={cargandoDetalle && !subasta}
      textoCarga="Cargando subasta..."
      errorTitulo={errorTitulo}
      errorMensaje={errorMensaje}
    >
      {subasta && (
        <FormularioSubasta
          key={`${subasta.id}-${subasta.updatedAt || subasta.endTime}`}
          subasta={subasta}
          tienePujas={tienePujas}
          esAdmin={esAdmin}
          alEnviarFormulario={manejarActualizacion}
          alCancelar={() => navegar(rutaRetorno)}
        />
      )}
    </PaginaFormulario>
  );
}
