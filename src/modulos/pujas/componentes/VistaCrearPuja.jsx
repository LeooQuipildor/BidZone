/**
 * ==============================================================================
 * ARCHIVO: src/modulos/pujas/componentes/VistaCrearPuja.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de vista de página completa para registrar una nueva puja vinculante (ruta `/pujas/nueva`).
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Envuelve el proceso en el contenedor estándar `PaginaFormulario`.
 * 2. Carga la lista global de subastas activas desde la tienda Zustand `usarTiendaSubastas`.
 * 3. Inyecta la acción `crearPuja` de `usarTiendaPujas` en el componente reutilizable `FormularioPuja`.
 * 4. Al completar con éxito el registro de la puja, redirige a la lista personal en `/pujas`.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Integración Multitienda:
 *   Demuestra cómo una vista puede sincronizar dos almacenes Zustand diferentes (`usarTiendaPujas`
 *   y `usarTiendaSubastas`) colaborando sin acoplar sus códigos fuente.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usarTiendaPujas } from '../estado/tiendaPujas';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';
import { FormularioPuja } from './FormularioPuja';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaCrearPuja() {
  const navegar = useNavigate();

  // Acciones y estados de tiendas
  const crearPuja = usarTiendaPujas((estado) => estado.crearPuja);
  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const cargandoSubastas = usarTiendaSubastas((estado) => estado.cargando);
  const obtenerSubastas = usarTiendaSubastas((estado) => estado.obtenerSubastas);

  // Asegura que las subastas estén cargadas en la tienda
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
