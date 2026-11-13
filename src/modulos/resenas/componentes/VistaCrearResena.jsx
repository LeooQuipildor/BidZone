/**
 * ==============================================================================
 * ARCHIVO: src/modulos/resenas/componentes/VistaCrearResena.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de vista de página completa para calificar y dejar una reseña (1 a 5 estrellas)
 * sobre una contraparte al concluir una subasta (ruta `/resenas/nueva`).
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Lee parámetros de búsqueda opcionales de la URL (`?subasta=1`) para preseleccionar el lote.
 * 2. Carga en paralelo subastas, usuarios y reseñas existentes desde sus respectivas tiendas.
 * 3. Utiliza la función utilitaria `obtenerSubastasPendientesResena` para obtener únicamente las
 *    subastas finalizadas con ganador donde el usuario participó y que todavía no ha calificado.
 * 4. Descarta al usuario actual de la lista de contrapartes (`otrosUsuarios`).
 * 5. Integra `FormularioResena` dentro de la plantilla unificada `PaginaFormulario`.
 * 6. Redirige a `/resenas` al guardar o cancelar.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Filtrado de Operaciones Pendientes:
 *   La función `obtenerSubastasPendientesResena` evita que un usuario intente calificar subastas
 *   activas o en las que no participó, garantizando que cada estrella represente una transacción real (RN07).
 */

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usarTiendaResenas } from '../estado/tiendaResenas';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { mismoId } from '../../nucleo/utilidades/ayudas';
import { obtenerSubastasPendientesResena } from '../utilidades/ayudasResena';
import { FormularioResena } from './FormularioResena';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaCrearResena() {
  const navegar = useNavigate();

  // Lectura de parámetros query string opcionales
  const [parametrosUrl] = useSearchParams();
  const idSubastaInicial = parametrosUrl.get('subasta') || parametrosUrl.get('auctionId') || '';

  /**
   * Suscripciones a tiendas:
   */
  const resenas = usarTiendaResenas((estado) => estado.resenas);
  const obtenerResenas = usarTiendaResenas((estado) => estado.obtenerResenas);
  const crearResena = usarTiendaResenas((estado) => estado.crearResena);
  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const cargandoSubastas = usarTiendaSubastas((estado) => estado.cargando);
  const obtenerSubastas = usarTiendaSubastas((estado) => estado.obtenerSubastas);
  const usuarios = usarTiendaAutenticacion((estado) => estado.usuarios);
  const obtenerUsuarios = usarTiendaAutenticacion((estado) => estado.obtenerUsuarios);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);

  /**
   * Carga inicial sincronizada
   */
  useEffect(() => {
    obtenerSubastas();
    obtenerUsuarios();
    obtenerResenas();
  }, [obtenerSubastas, obtenerUsuarios, obtenerResenas]);

  // Subastas cerradas donde el usuario participó y tiene pendiente emitir su reseña
  const subastasElegibles = obtenerSubastasPendientesResena(subastas, resenas, usuarioActual?.id);

  // Lista de contrapartes excluyendo al usuario en sesión
  const otrosUsuarios = usuarios.filter((usuario) => !mismoId(usuario.id, usuarioActual?.id));

  return (
    <PaginaFormulario
      titulo="Emitir Calificación (RN07)"
      subtitulo="Califica de 1 a 5 estrellas a tu contraparte luego de finalizar la subasta y coordinar la entrega."
      alVolver={() => navegar('/resenas')}
      cargando={cargandoSubastas && subastas.length === 0}
      textoCarga="Cargando operaciones calificables..."
    >
      <FormularioResena
        subastasElegibles={subastasElegibles}
        otrosUsuarios={otrosUsuarios}
        resenas={resenas}
        idUsuarioActual={usuarioActual?.id}
        idSubastaInicial={idSubastaInicial}
        alCrearResena={crearResena}
        alGuardar={() => navegar('/resenas')}
        alCancelar={() => navegar('/resenas')}
      />
    </PaginaFormulario>
  );
}
