/**
 * ==============================================================================
 * ARCHIVO: src/modulos/reportes/componentes/VistaCrearReporte.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de vista de página completa para radicar una denuncia o reclamo
 * formal por incumplimiento de una operación (ruta `/reportes/nuevo`), bajo la Regla RN06.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Lee parámetros de búsqueda en la URL (`useSearchParams`), tales como `?subasta=1&reportado=2`,
 *    para preseleccionar automáticamente el lote y la contraparte denunciada.
 * 2. Carga en paralelo la lista de subastas y la lista de usuarios desde sus respectivas tiendas Zustand.
 * 3. Excluye de la lista de denunciables al usuario actualmente autenticado (`!mismoId(usuario.id, usuarioActual?.id)`),
 *    evitando que una persona se denuncie a sí misma.
 * 4. Pasa los datos y la acción `crearReporte` a `FormularioReporte`.
 * 5. Al guardar, redirige a la lista general de tickets en `/reportes`.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Lectura de Parámetros URL con `useSearchParams`:
 *   A diferencia de `useParams` (que lee segmentos de ruta `/reportes/:id`), `useSearchParams`
 *   lee los parámetros query string después del signo de interrogación `?clave=valor`.
 * - Filtrado Preventivo de Usuarios:
 *   Garantiza que la interfaz impida selecciones erróneas antes de que los datos viajen al servidor.
 */

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usarTiendaReportes } from '../estado/tiendaReportes';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { mismoId } from '../../nucleo/utilidades/ayudas';
import { FormularioReporte } from './FormularioReporte';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaCrearReporte() {
  const navegar = useNavigate();

  /**
   * Hook `useSearchParams`:
   * Permite capturar valores pasados por la URL al navegar desde el detalle de la subasta.
   */
  const [parametrosUrl] = useSearchParams();
  const idSubastaInicial = parametrosUrl.get('subasta') || parametrosUrl.get('auctionId') || '';
  const idUsuarioReportadoInicial =
    parametrosUrl.get('reportado') || parametrosUrl.get('reportedUserId') || '';

  /**
   * Suscripciones a tiendas Zustand:
   */
  const crearReporte = usarTiendaReportes((estado) => estado.crearReporte);
  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const obtenerSubastas = usarTiendaSubastas((estado) => estado.obtenerSubastas);
  const usuarios = usarTiendaAutenticacion((estado) => estado.usuarios);
  const obtenerUsuarios = usarTiendaAutenticacion((estado) => estado.obtenerUsuarios);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);

  /**
   * Carga de datos necesarios para los selectores
   */
  useEffect(() => {
    obtenerSubastas();
    obtenerUsuarios();
  }, [obtenerSubastas, obtenerUsuarios]);

  // Lista de usuarios descartando al propio usuario en sesión
  const otrosUsuarios = usuarios.filter((usuario) => !mismoId(usuario.id, usuarioActual?.id));

  return (
    <PaginaFormulario
      titulo="Informar Incumplimiento de Operación"
      subtitulo="Si liberados los datos de contacto la contraparte no abona el artículo o no lo entrega, radica la denuncia para evaluar sanción."
      alVolver={() => navegar('/reportes')}
    >
      <FormularioReporte
        subastas={subastas}
        otrosUsuarios={otrosUsuarios}
        idSubastaInicial={idSubastaInicial}
        idUsuarioReportadoInicial={idUsuarioReportadoInicial}
        alCrearReporte={crearReporte}
        alGuardar={() => navegar('/reportes')}
        alCancelar={() => navegar('/reportes')}
      />
    </PaginaFormulario>
  );
}
