/**
 * ==============================================================================
 * ARCHIVO: src/modulos/pujas/componentes/VistaEditarPuja.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de vista de página completa para modificar la nota u observación
 * de una puja existente en la ruta `/pujas/:id/editar`.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Obtiene el parámetro dinámico `id` de la puja desde la URL con `useParams()`.
 * 2. Carga en memoria las ofertas y las subastas mediante sus respectivos stores Zustand.
 * 3. Valida la titularidad de la oferta:
 *    - Comprueba con `mismoId` si el usuario autenticado es el autor de la puja (`puja.bidderId`).
 *    - Si no es el titular, deniega el acceso explicando la regla de privacidad y autoría.
 * 4. Pasa la información a `FormularioPuja` asegurando que el importe económico permanezca
 *    congelado de acuerdo con la Regla de Negocio RN04.
 * 5. Redirige a `/pujas` al guardar o cancelar.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Protección de Entidades Inmutables en Frontend:
 *   Aunque la ruta se llame "Editar", este componente educa al programador en que no todos los campos
 *   deben ser editables en un sistema transaccional de subastas.
 */

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usarTiendaPujas } from '../estado/tiendaPujas';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { FormularioPuja } from './FormularioPuja';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaEditarPuja() {
  const { id } = useParams();
  const navegar = useNavigate();

  /**
   * Suscripciones a tiendas:
   */
  const pujas = usarTiendaPujas((estado) => estado.pujas);
  const cargandoPujas = usarTiendaPujas((estado) => estado.cargando);
  const obtenerPujas = usarTiendaPujas((estado) => estado.obtenerPujas);
  const actualizarPuja = usarTiendaPujas((estado) => estado.actualizarPuja);
  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const obtenerSubastas = usarTiendaSubastas((estado) => estado.obtenerSubastas);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);

  /**
   * Sincronización inicial de datos con useEffect
   */
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
  } else if (!mismoId(usuarioActual?.id, puja.bidderId)) {
    errorTitulo = 'Sin permisos de edición';
    errorMensaje = 'RN04: Solo el postor titular puede editar su nota de coordinación; los montos ofertados no se editan.';
  }

  // Identificación de la subasta vinculada
  const subasta = puja ? buscarPorId(subastas, puja.auctionId) : null;
  const tituloSubasta = subasta?.title || puja?.auctionTitle || `#${puja?.auctionId}`;

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
