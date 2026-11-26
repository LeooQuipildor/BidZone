import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStoreAuctions } from '../estado/storeAuctions';
import { useStoreBids } from '../../pujas/estado/storeBids';
import { useStoreAuthentication } from '../../autenticacion/estado/storeAuthentication';
import { FormularioSubasta } from './FormularioSubasta';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaEditarSubasta() {
  const { id } = useParams();
  const navegar = useNavigate();

  const subastas = useStoreAuctions((estado) => estado.subastas);
  const detalleSubastaActual = useStoreAuctions((estado) => estado.detalleSubastaActual);
  const cargandoDetalle = useStoreAuctions((estado) => estado.cargandoDetalle);
  const obtenerSubastaPorId = useStoreAuctions((estado) => estado.obtenerSubastaPorId);
  const actualizarSubasta = useStoreAuctions((estado) => estado.actualizarSubasta);
  const pujas = useStoreBids((estado) => estado.pujas);
  const obtenerPujas = useStoreBids((estado) => estado.obtenerPujas);
  const usuarioActual = useStoreAuthentication((estado) => estado.usuarioActual);

  useEffect(() => {
    obtenerSubastaPorId(id);
    obtenerPujas();
  }, [id, obtenerSubastaPorId, obtenerPujas]);

  // Selección de la subasta activa
  const subasta =
    detalleSubastaActual && mismoId(detalleSubastaActual.id, id)
      ? detalleSubastaActual
      : buscarPorId(subastas, id);

  const esAdmin = usuarioActual?.rol === 'admin';
  const esDueno = Boolean(subasta && mismoId(usuarioActual?.id, subasta.vendedorId));

  // Control de errores de acceso y existencia
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

  const rutaRetorno = subasta ? `/subastas/${subasta.id}` : '/subastas';

  // Verificación de si la subasta ya recibió pujas para aplicar la RN08
  const tienePujas = Boolean(
    subasta &&
      (Number(subasta.cantidadPujas || 0) > 0 ||
        (Array.isArray(subasta.pujas) && subasta.pujas.length > 0) ||
        pujas.some((puja) => mismoId(puja.subastaId, id)))
  );

  async function manejarActualizacion(datos) {
    await actualizarSubasta(subasta.id, datos);
    navegar(`/subastas/${subasta.id}`);
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
          key={subasta.id}
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
