import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usarTiendaAutenticacion } from '../estado/tiendaAutenticacion';
import { FormularioUsuario } from './FormularioUsuario';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaCrearUsuario() {
  const navegar = useNavigate();
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
