/**
 * ==============================================================================
 * ARCHIVO: src/modulos/autenticacion/componentes/VistaCrearUsuario.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de vista de página completa para que un administrador dé de alta manualmente
 * un nuevo usuario o administrador en el sistema (ruta `/usuarios/nuevo`).
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Envuelve la experiencia visual en el contenedor unificado `PaginaFormulario`.
 * 2. Conecta la acción `crearUsuario` de la tienda Zustand `usarTiendaAutenticacion`.
 * 3. Renderiza el componente reutilizable `FormularioUsuario` habilitando los controles
 *    administrativos (`esAdmin={true}`).
 * 4. Gestiona la navegación hacia `/usuarios` tanto al completar el guardado como al cancelar.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Patrón Contenedor de Vista (View Container):
 *   Este componente no maneja inputs HTML directamente ni estado complejo de formularios.
 *   Su única responsabilidad es conectar el enrutador y la tienda global con el componente
 *   presentacional `FormularioUsuario`.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usarTiendaAutenticacion } from '../estado/tiendaAutenticacion';
import { FormularioUsuario } from './FormularioUsuario';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaCrearUsuario() {
  /**
   * Hook `useNavigate`:
   * Permite regresar a la lista de usuarios tras el alta o al cancelar.
   */
  const navegar = useNavigate();

  /**
   * Acción de la tienda Zustand:
   * `crearUsuario` realiza el POST /usuarios enviando los datos del nuevo participante.
   */
  const crearUsuario = usarTiendaAutenticacion((estado) => estado.crearUsuario);

  return (
    <PaginaFormulario
      titulo="Alta de Nuevo Usuario"
      subtitulo="Registrar un nuevo usuario o administrador en la plataforma."
      alVolver={() => navegar('/usuarios')}
    >
      <FormularioUsuario
        esAdmin
        alCrearUsuario={crearUsuario}
        alGuardar={() => navegar('/usuarios')}
        alCancelar={() => navegar('/usuarios')}
      />
    </PaginaFormulario>
  );
}
