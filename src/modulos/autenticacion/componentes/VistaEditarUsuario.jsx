import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStoreAuthentication } from '../estado/storeAuthentication';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { FormularioUsuario } from './FormularioUsuario';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaEditarUsuario() {
  const { id } = useParams();

  const navegar = useNavigate();

  const usuarios = useStoreAuthentication((estado) => estado.usuarios);
  const cargandoUsuarios = useStoreAuthentication((estado) => estado.cargando);
  const obtenerUsuarios = useStoreAuthentication((estado) => estado.obtenerUsuarios);
  const usuarioActual = useStoreAuthentication((estado) => estado.usuarioActual);
  const actualizarUsuario = useStoreAuthentication((estado) => estado.actualizarUsuario);

  useEffect(() => {
    obtenerUsuarios();
  }, [obtenerUsuarios]);

  const usuarioObjetivo = buscarPorId(usuarios, id);
  const esAdmin = usuarioActual?.rol === 'admin';
  const rutaRetorno = esAdmin ? '/usuarios' : '/panel?tab=perfil';

  let errorTitulo = '';
  let errorMensaje = '';
  if (!usuarioObjetivo) {
    errorTitulo = 'Usuario no encontrado';
    errorMensaje = 'El registro solicitado no existe.';
  } else if (!esAdmin && !mismoId(usuarioActual?.id, usuarioObjetivo.id)) {
    // Si no es admin y no es su propio id, se bloquea la acción
    errorTitulo = 'Sin permisos de edición';
    errorMensaje = 'Solo puedes editar tu propio perfil o contar con permisos de administrador.';
  }

  return (
    <PaginaFormulario
      titulo={usuarioObjetivo ? `Editar Usuario: ${usuarioObjetivo.nombre}` : 'Editar Usuario'}
      subtitulo="Modificación de datos de contacto, rol de acceso y estado disciplinario de la cuenta."
      textoVolver="Volver"
      alVolver={() => navegar(rutaRetorno)}
      cargando={cargandoUsuarios && !usuarioObjetivo}
      textoCarga="Cargando perfil de usuario..."
      errorTitulo={errorTitulo}
      errorMensaje={errorMensaje}
    >
      {usuarioObjetivo && (
        <FormularioUsuario
          key={usuarioObjetivo.id}
          usuario={usuarioObjetivo}
          esAdmin={esAdmin}
          alActualizarUsuario={actualizarUsuario}
          alGuardar={() => navegar(rutaRetorno)}
          alCancelar={() => navegar(rutaRetorno)}
        />
      )}
    </PaginaFormulario>
  );
}
