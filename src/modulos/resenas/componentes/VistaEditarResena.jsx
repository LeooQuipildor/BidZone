/**
 * ==============================================================================
 * ARCHIVO: src/modulos/resenas/componentes/VistaEditarResena.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de vista de página completa para editar una reseña o calificación
 * previamente emitida por el usuario (ruta `/resenas/:id/editar`).
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Obtiene el parámetro dinámico `id` de la reseña desde la URL con `useParams()`.
 * 2. Carga las reseñas en memoria con `obtenerResenas()` al montar la vista.
 * 3. Valida la titularidad de la reseña:
 *    - Comprueba con `mismoId` que el usuario en sesión sea el evaluador original (`resena.reviewerId`).
 *    - Si no es el autor, deniega el acceso y muestra un error amigable.
 * 4. Pasa la reseña a `FormularioResena` para permitir modificar estrellas y texto.
 * 5. Al guardar, actualiza el backend y redirige a `/resenas`.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Integridad de Reputación y Reseñas:
 *   Nadie puede editar una reseña salvo quien la escribió, asegurando que las valoraciones reflejen
 *   fielmente la experiencia personal de cada usuario.
 */

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usarTiendaResenas } from '../estado/tiendaResenas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { FormularioResena } from './FormularioResena';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaEditarResena() {
  const { id } = useParams();
  const navegar = useNavigate();

  /**
   * Suscripciones a tiendas:
   */
  const resenas = usarTiendaResenas((estado) => estado.resenas);
  const cargandoResenas = usarTiendaResenas((estado) => estado.cargando);
  const obtenerResenas = usarTiendaResenas((estado) => estado.obtenerResenas);
  const actualizarResena = usarTiendaResenas((estado) => estado.actualizarResena);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);

  /**
   * Sincronización inicial
   */
  useEffect(() => {
    obtenerResenas();
  }, [obtenerResenas]);

  // Búsqueda de la reseña a editar
  const resena = buscarPorId(resenas, id);

  // Verificación de autoría
  let errorTitulo = '';
  let errorMensaje = '';
  if (!resena) {
    errorTitulo = 'Calificación no encontrada';
    errorMensaje = 'El registro solicitado no existe.';
  } else if (!mismoId(usuarioActual?.id, resena.reviewerId)) {
    errorTitulo = 'Sin permisos de edición';
    errorMensaje = 'Solo el autor de la reseña puede modificarla.';
  }

  return (
    <PaginaFormulario
      titulo={resena ? `Editar Calificación #${resena.id}` : 'Editar Calificación'}
      subtitulo="Modifica la puntuación o el comentario asociado a esta operación."
      textoVolver="Volver a Calificaciones"
      alVolver={() => navegar('/resenas')}
      cargando={cargandoResenas && !resena}
      textoCarga="Cargando calificación..."
      errorTitulo={errorTitulo}
      errorMensaje={errorMensaje}
    >
      {resena && (
        <FormularioResena
          key={resena.id}
          resena={resena}
          alActualizarResena={actualizarResena}
          alGuardar={() => navegar('/resenas')}
          alCancelar={() => navegar('/resenas')}
        />
      )}
    </PaginaFormulario>
  );
}
