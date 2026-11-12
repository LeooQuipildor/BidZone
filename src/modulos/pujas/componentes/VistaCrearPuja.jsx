import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usarTiendaPujas } from '../estado/tiendaPujas';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';
import { FormularioPuja } from './FormularioPuja';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaCrearPuja() {
  const navegar = useNavigate();
  const crearPuja = usarTiendaPujas((estado) => estado.crearPuja);
  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const cargandoSubastas = usarTiendaSubastas((estado) => estado.cargando);
  const obtenerSubastas = usarTiendaSubastas((estado) => estado.obtenerSubastas);

  useEffect(() => {
    obtenerSubastas();
  }, [obtenerSubastas]);

  return (
    <PaginaFormulario
      titulo="Registrar nueva puja"
      subtitulo="Emite una oferta vinculante sobre cualquiera de las subastas activas."
      alVolver={() => navegar('/pujas')}
      cargando={cargandoSubastas && subastas.length === 0}
      textoCarga="Cargando subastas activas..."
    >
      <FormularioPuja
        key={subastas.length > 0 ? 'con-subastas' : 'sin-subastas'}
        subastas={subastas}
        alCrearPuja={crearPuja}
        alGuardar={() => navegar('/pujas')}
        alCancelar={() => navegar('/pujas')}
      />
    </PaginaFormulario>
  );
}
