import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreBids } from '../estado/storeBids';
import { useStoreAuctions } from '../../subastas/estado/storeAuctions';
import { FormularioPuja } from './FormularioPuja';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaCrearPuja() {
  const navegar = useNavigate();

  // Acciones y estados de stores
  const crearPuja = useStoreBids((estado) => estado.crearPuja);
  const subastas = useStoreAuctions((estado) => estado.subastas);
  const cargandoSubastas = useStoreAuctions((estado) => estado.cargando);
  const obtenerSubastas = useStoreAuctions((estado) => estado.obtenerSubastas);

  // Asegura que las subastas estén cargadas en el store
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
