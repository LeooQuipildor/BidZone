/**
 * ==============================================================================
 * ARCHIVO: src/modulos/subastas/componentes/VistaEditarSubasta.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de vista de página completa para modificar una subasta existente
 * en la ruta `/subastas/:id/editar`.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Obtiene el parámetro `id` de la subasta desde la URL con `useParams()`.
 * 2. Carga en paralelo la información de la subasta (`obtenerSubastaPorId`) y las pujas del sistema (`obtenerPujas`).
 * 3. Valida la titularidad del lote:
 *    - Comprueba con `mismoId` si el usuario autenticado es el vendedor propietario (`esDueno`).
 *    - Si no es el dueño, bloquea la edición mostrando un mensaje claro de denegación de permisos.
 * 4. Determina si el lote ya tiene ofertas acumuladas (`tienePujas`) inspeccionando `bidCount`, `bids` y la tienda de pujas.
 * 5. Transfiere `tienePujas` y el rol de admin (`esAdmin`) a `FormularioSubasta` para congelar automáticamente
 *    los campos financieros según la Regla RN08.
 * 6. Actualiza el lote en el backend y devuelve al usuario a la ficha de detalle (`/subastas/:id`).
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Detección exhaustiva de pujas:
 *   Inspecciona tres fuentes (`subasta.bidCount`, `subasta.bids` y `pujas.some(...)`) para asegurar que,
 *   sin importar cómo responda el backend, ninguna subasta con ofertas quede desprotegida contra ediciones indebidas.
 * - Validación de autoría en el cliente:
 *   Aunque el backend siempre debe proteger sus endpoints, verificar la autoría en el cliente evita
 *   renderizar formularios inútiles y mejora la claridad para el usuario.
 */

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

  /**
   * Suscripciones a tiendas de subastas, pujas y autenticación:
   */
  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const detalleSubastaActual = usarTiendaSubastas((estado) => estado.detalleSubastaActual);
  const cargandoDetalle = usarTiendaSubastas((estado) => estado.cargandoDetalle);
  const obtenerSubastaPorId = usarTiendaSubastas((estado) => estado.obtenerSubastaPorId);
  const actualizarSubasta = usarTiendaSubastas((estado) => estado.actualizarSubasta);
  const pujas = usarTiendaPujas((estado) => estado.pujas);
  const obtenerPujas = usarTiendaPujas((estado) => estado.obtenerPujas);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);

  /**
   * Hook `useEffect`:
   * Trae los datos de la subasta y las ofertas vigentes al cargar la vista.
   */
  useEffect(() => {
    obtenerSubastaPorId(id);
    obtenerPujas();
  }, [id, obtenerSubastaPorId, obtenerPujas]);

  // Selección de la subasta activa
  const subasta =
    detalleSubastaActual && mismoId(detalleSubastaActual.id, id)
      ? detalleSubastaActual
      : buscarPorId(subastas, id);

  const esAdmin = usuarioActual?.role === 'admin';
  const esDueno = Boolean(subasta && mismoId(usuarioActual?.id, subasta.sellerId));

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
      (Number(subasta.bidCount || 0) > 0 ||
        (Array.isArray(subasta.bids) && subasta.bids.length > 0) ||
        pujas.some((puja) => mismoId(puja.auctionId, id)))
  );

  /**
   * Manejador de actualización:
   * Guarda los cambios en la tienda y regresa a la ficha del artículo.
   */
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
