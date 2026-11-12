import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usarTiendaAutenticacion } from '../estado/tiendaAutenticacion';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { FormularioUsuario } from './FormularioUsuario';
import { ErrorCard, Loading } from '../../nucleo/diseno/uiFeedback';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaEditarUsuario() {
  const { id } = useParams();
  const navegar = useNavigate();

  const usuarios = usarTiendaAutenticacion((estado) => estado.usuarios);
  const cargandoUsuarios = usarTiendaAutenticacion((estado) => estado.cargando);
  const obtenerUsuarios = usarTiendaAutenticacion((estado) => estado.obtenerUsuarios);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);
  const actualizarUsuario = usarTiendaAutenticacion((estado) => estado.actualizarUsuario);

  useEffect(() => {
    obtenerUsuarios();
  }, [obtenerUsuarios]);

  const usuarioObjetivo = buscarPorId(usuarios, id);
  const esAdmin = usuarioActual?.role === 'admin';
  const rutaRetorno = esAdmin ? '/users' : '/dashboard?tab=perfil';

  if (cargandoUsuarios && !usuarioObjetivo) {
    return <Loading text="Cargando perfil de usuario..." />;
  }

  if (!usuarioObjetivo) {
    return (
      <ErrorCard
        title="Usuario no encontrado"
        message="El registro solicitado no existe."
        backLabel="Volver"
        onBack={() => navegar(rutaRetorno)}
      />
    );
  }

  const esPropioPerfil = mismoId(usuarioActual?.id, usuarioObjetivo.id);
  if (!esAdmin && !esPropioPerfil) {
    return (
      <ErrorCard
        title="Sin permisos de edición"
        message="Solo puedes editar tu propio perfil o contar con permisos de administrador."
        backLabel="Volver"
        onBack={() => navegar(rutaRetorno)}
      />
    );
  }

  return (
    <PaginaFormulario
      titulo={`Editar Usuario: ${usuarioObjetivo.name}`}
      subtitulo="Modificación de datos de contacto, rol de acceso y estado disciplinario de la cuenta."
      alVolver={() => navegar(rutaRetorno)}
    >
      <FormularioUsuario
        key={usuarioObjetivo.id}
        usuario={usuarioObjetivo}
        esAdmin={esAdmin}
        alActualizarUsuario={actualizarUsuario}
        alGuardar={() => navegar(rutaRetorno)}
        alCancelar={() => navegar(rutaRetorno)}
      />
    </PaginaFormulario>
  );
}
