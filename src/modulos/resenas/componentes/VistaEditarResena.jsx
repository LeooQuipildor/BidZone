import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usarTiendaResenas } from '../estado/tiendaResenas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { FormularioResena } from './FormularioResena';
import { Loading, ErrorCard } from '../../nucleo/diseno/uiFeedback';
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
  const esAdmin = usuarioActual?.role === 'admin';

  if (cargandoResenas && !resena) return <Loading text="Cargando calificación..." />;

  if (!resena) {
    return (
      <ErrorCard
        title="Calificación no encontrada"
        message="El registro solicitado no existe."
        backLabel="Volver a Calificaciones"
        onBack={() => navegar('/reviews')}
      />
    );
  }

  const esAutor = mismoId(usuarioActual?.id, resena.reviewerId);
  if (!esAdmin && !esAutor) {
    return (
      <ErrorCard
        title="Sin permisos de edición"
        message="Solo el autor de la reseña o un administrador puede modificarla."
        backLabel="Volver a Calificaciones"
        onBack={() => navegar('/reviews')}
      />
    );
  }

  return (
    <PaginaFormulario
      titulo={`Editar Calificación #${resena.id}`}
      subtitulo="Modifica la puntuación o el comentario asociado a esta operación."
      alVolver={() => navegar('/reviews')}
    >
      <FormularioResena
        key={`${resena.id}-${resena.updatedAt || resena.rating}`}
        resena={resena}
        alActualizarResena={actualizarResena}
        alGuardar={() => navegar('/reviews')}
        alCancelar={() => navegar('/reviews')}
      />
    </PaginaFormulario>
  );
}
