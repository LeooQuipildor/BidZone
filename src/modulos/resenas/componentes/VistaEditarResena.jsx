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

  const resenas = usarTiendaResenas((estado) => estado.resenas);
  const cargandoResenas = usarTiendaResenas((estado) => estado.cargando);
  const obtenerResenas = usarTiendaResenas((estado) => estado.obtenerResenas);
  const actualizarResena = usarTiendaResenas((estado) => estado.actualizarResena);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);

  useEffect(() => {
    obtenerResenas();
  }, [obtenerResenas]);

  const resena = buscarPorId(resenas, id);

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
