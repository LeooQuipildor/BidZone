import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreAuthentication } from '../estado/storeAuthentication';
import { FormularioUsuario } from './FormularioUsuario';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaCrearUsuario() {
  const navegar = useNavigate();

  const crearUsuario = useStoreAuthentication((estado) => estado.crearUsuario);

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
