import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreAuctions } from '../estado/storeAuctions';
import { FormularioSubasta } from './FormularioSubasta';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaCrearSubasta() {
  const navegar = useNavigate();

  // Acción para persistir la nueva subasta
  const crearSubasta = useStoreAuctions((estado) => estado.crearSubasta);

  async function manejarCreacion(datos) {
    const creada = await crearSubasta(datos);
    navegar(`/subastas/${creada.id}`);
  }

  return (
    <PaginaFormulario
      titulo="Publicar Nueva Subasta"
      subtitulo="Define las condiciones de subasta. Al finalizar con ganador, se liberarán mutuamente los datos de contacto."
      textoVolver="Volver al catálogo"
      alVolver={() => navegar('/subastas')}
    >
      <FormularioSubasta
        alEnviarFormulario={manejarCreacion}
        alCancelar={() => navegar('/subastas')}
        textoBotonGuardar="Publicar Subasta"
      />
    </PaginaFormulario>
  );
}
