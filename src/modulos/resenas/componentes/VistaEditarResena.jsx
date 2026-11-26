import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStoreReviews } from '../estado/storeReviews';
import { useStoreAuthentication } from '../../autenticacion/estado/storeAuthentication';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { FormularioResena } from './FormularioResena';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaEditarResena() {
  const { id } = useParams();
  const navegar = useNavigate();

  const resenas = useStoreReviews((estado) => estado.resenas);
  const cargandoResenas = useStoreReviews((estado) => estado.cargando);
  const obtenerResenas = useStoreReviews((estado) => estado.obtenerResenas);
  const actualizarResena = useStoreReviews((estado) => estado.actualizarResena);
  const usuarioActual = useStoreAuthentication((estado) => estado.usuarioActual);

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
  } else if (!mismoId(usuarioActual?.id, resena.autorId)) {
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
