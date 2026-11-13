/**
 * ==============================================================================
 * ARCHIVO: src/modulos/autenticacion/componentes/VistaEditarUsuario.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de vista de página completa para editar los datos de un usuario existente
 * en la ruta `/usuarios/:id/editar`.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Obtiene el parámetro dinámico `id` desde la URL con `useParams()`.
 * 2. Carga la lista global de usuarios desde la tienda si aún no está en memoria (`useEffect`).
 * 3. Localiza el usuario objetivo utilizando la utilidad `buscarPorId`.
 * 4. Valida permisos de seguridad:
 *    - Un administrador puede editar a cualquier usuario.
 *    - Un usuario regular solo puede editar su propio perfil (comparando con `mismoId`).
 *    - Si no tiene permisos o el usuario no existe, muestra un mensaje de error claro en `PaginaFormulario`.
 * 5. Renderiza `FormularioUsuario` pasando `usuarioObjetivo` y la prop `key={usuarioObjetivo.id}`
 *    para forzar el reinicio del estado del formulario si cambia el usuario editado.
 * 6. Redirige a `/usuarios` (para administradores) o a `/panel?tab=perfil` (para usuarios comunes).
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Parámetros de Ruta (`useParams`):
 *   React Router captura la parte variable de la URL (`/usuarios/5/editar` -> `{ id: "5" }`).
 * - Comparación segura con `mismoId`:
 *   Evita los típicos errores de JavaScript al comparar `"5" === 5` (string contra número).
 * - La prop `key` para reiniciar componentes en React:
 *   Al asignar `key={usuarioObjetivo.id}`, si la URL cambia a otro usuario, React destruye la
 *   instancia anterior y crea una nueva, reinicializando limpiamente el estado del formulario.
 */

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usarTiendaAutenticacion } from '../estado/tiendaAutenticacion';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { FormularioUsuario } from './FormularioUsuario';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaEditarUsuario() {
  /**
   * Hook `useParams`:
   * Extrae el ID del usuario desde la ruta URL (ej: /usuarios/:id/editar).
   */
  const { id } = useParams();

  /**
   * Hook `useNavigate`:
   * Para volver atrás o redirigir tras guardar los cambios.
   */
  const navegar = useNavigate();

  /**
   * Suscripciones a la tienda Zustand de autenticación:
   */
  const usuarios = usarTiendaAutenticacion((estado) => estado.usuarios);
  const cargandoUsuarios = usarTiendaAutenticacion((estado) => estado.cargando);
  const obtenerUsuarios = usarTiendaAutenticacion((estado) => estado.obtenerUsuarios);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);
  const actualizarUsuario = usarTiendaAutenticacion((estado) => estado.actualizarUsuario);

  /**
   * Hook `useEffect`:
   * Solicita la lista actualizada de usuarios al montar la vista.
   */
  useEffect(() => {
    obtenerUsuarios();
  }, [obtenerUsuarios]);

  /**
   * Búsqueda y cálculo de permisos:
   */
  const usuarioObjetivo = buscarPorId(usuarios, id);
  const esAdmin = usuarioActual?.role === 'admin';
  const rutaRetorno = esAdmin ? '/usuarios' : '/panel?tab=perfil';

  /**
   * Verificación de seguridad y casos límite:
   */
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
      titulo={usuarioObjetivo ? `Editar Usuario: ${usuarioObjetivo.name}` : 'Editar Usuario'}
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
