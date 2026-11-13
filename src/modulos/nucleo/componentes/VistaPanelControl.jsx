/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/VistaPanelControl.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente principal del Panel de Control (Dashboard) de BidZone (ruta `/panel`).
 * Funciona como una aplicación interna (Single Page Dashboard) que integra los 5 módulos
 * del sistema tanto para usuarios estándar como para administradores.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Al montarse (`useEffect`), sincroniza los datos de todas las tiendas Zustand:
 *    usuarios, subastas, pujas, reportes, reseñas y notificaciones.
 * 2. Gestiona la navegación interna por pestañas mediante el parámetro URL `?tab=nombre`:
 *    - `resumen`: Métricas globales, actividad reciente y lotes adjudicados.
 *    - `subastas`: Gestión de publicaciones propias o moderación general.
 *    - `pujas`: Historial de ofertas emitidas y seguimiento de liderazgo.
 *    - `reportes`: Mesa de ayuda y resolución de reclamos RN06.
 *    - `resenas`: Historial de calificaciones recibidas y otorgadas RN07.
 *    - `usuarios`: Directorio y administración disciplinaria (exclusivo administradores).
 *    - `notificaciones`: Centro de alertas del sistema.
 *    - `perfil`: Modificación de datos de contacto personales (RN05).
 * 3. Provee un buscador superior transversal en el `Header` que filtra los datos de la pestaña activa.
 * 4. Mantiene compatibilidad con nombres en inglés anteriores gracias al mapa `ALIAS_SECCION_URL`.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Diccionario de Vistas (View Map Pattern):
 *   `const contenidoPorSeccion = { resumen: <TabResumen />, ... }`
 *   En lugar de una cadena kilométrica de `if/else` o `switch`, se utiliza un objeto donde la clave
 *   es el nombre de la pestaña y el valor es el elemento JSX correspondiente.
 * - Sincronización Bidireccional de Pestaña con URL:
 *   Al hacer clic en una pestaña del sidebar, actualizamos `setParametrosUrl({ tab: nuevaPestaña })`.
 *   Esto permite al usuario compartir enlaces directos (ej: `/panel?tab=perfil`) o usar los botones
 *   de avance/retroceso del navegador sin perder su lugar.
 */

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';
import { usarTiendaPujas } from '../../pujas/estado/tiendaPujas';
import { usarTiendaReportes } from '../../reportes/estado/tiendaReportes';
import { usarTiendaResenas } from '../../resenas/estado/tiendaResenas';
import { usarTiendaNotificaciones } from '../../notificaciones/estado/tiendaNotificaciones';
import { useRelojSegundo } from '../utilidades/ayudas';
import { formatearRolUsuario } from '../utilidades/formatos';
import { construirMenuPanel } from './panel/ayudasPanel';
import { Sidebar } from './panel/Sidebar';
import { Header } from './panel/Header';
import { TabResumenPanel } from './panel/TabResumenPanel';
import { TabSubastasPanel } from './panel/TabSubastasPanel';
import { TabPujasPanel } from './panel/TabPujasPanel';
import { TabReportesPanel } from './panel/TabReportesPanel';
import { TabResenasPanel } from './panel/TabResenasPanel';
import { TabUsuariosPanel } from './panel/TabUsuariosPanel';
import { TabNotificacionesPanel } from './panel/TabNotificacionesPanel';
import { TabPerfilPanel } from './panel/TabPerfilPanel';

/**
 * Diccionario de equivalencias para admitir parámetros de URL heredados en inglés.
 */
const ALIAS_SECCION_URL = {
  overview: 'resumen',
  auctions: 'subastas',
  bids: 'pujas',
  reports: 'reportes',
  reviews: 'resenas',
  users: 'usuarios',
  notifications: 'notificaciones',
  profile: 'perfil',
};

export function VistaPanelControl({ seccionInicial = 'resumen' }) {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [parametrosUrl, setParametrosUrl] = useSearchParams();

  // Reloj de cuenta regresiva sincronizado para los componentes del panel
  const ahoraMs = useRelojSegundo();

  /**
   * Suscripciones a los 6 stores Zustand:
   */
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);
  const usuarios = usarTiendaAutenticacion((estado) => estado.usuarios);
  const obtenerUsuarios = usarTiendaAutenticacion((estado) => estado.obtenerUsuarios);
  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const obtenerSubastas = usarTiendaSubastas((estado) => estado.obtenerSubastas);
  const pujas = usarTiendaPujas((estado) => estado.pujas);
  const obtenerPujas = usarTiendaPujas((estado) => estado.obtenerPujas);
  const reportes = usarTiendaReportes((estado) => estado.reportes);
  const obtenerReportes = usarTiendaReportes((estado) => estado.obtenerReportes);
  const resenas = usarTiendaResenas((estado) => estado.resenas);
  const obtenerResenas = usarTiendaResenas((estado) => estado.obtenerResenas);
  const notificaciones = usarTiendaNotificaciones((estado) => estado.notificaciones);
  const obtenerNotificaciones = usarTiendaNotificaciones((estado) => estado.obtenerNotificaciones);

  // Estados locales para la barra de búsqueda y paginación interna
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [paginaSubastas, setPaginaSubastas] = useState(1);
  const [datosInicialesSeccion, setDatosInicialesSeccion] = useState(null);

  /**
   * Hook `useEffect`:
   * Carga la totalidad de datos al ingresar al panel de control para tener la información lista.
   */
  useEffect(() => {
    obtenerUsuarios();
    obtenerSubastas();
    obtenerPujas();
    obtenerReportes();
    obtenerResenas();
    obtenerNotificaciones();
  }, [obtenerUsuarios, obtenerSubastas, obtenerPujas, obtenerReportes, obtenerResenas, obtenerNotificaciones]);

  const esAdmin = usuarioActual?.role === 'admin';

  // Resolución de la pestaña activa leyendo query params
  const tabUrlRaw = parametrosUrl.get('tab');
  const tabDesdeUrl = tabUrlRaw ? ALIAS_SECCION_URL[tabUrlRaw] || tabUrlRaw : '';
  const abrirNuevoDesdeUrl = parametrosUrl.get('nuevo') === '1' || parametrosUrl.get('new') === '1';
  const seccionSolicitada = tabDesdeUrl || seccionInicial || 'resumen';

  // Seguridad: Si un usuario regular intenta entrar a la pestaña de usuarios, se le redirige al resumen
  const seccionActiva = !esAdmin && seccionSolicitada === 'usuarios' ? 'resumen' : seccionSolicitada;

  /**
   * Manejador de búsqueda transversal en el Header.
   */
  function manejarCambioBusqueda(nuevoTexto) {
    setTextoBusqueda(nuevoTexto);
    setPaginaSubastas(1);
  }

  /**
   * Cambia de pestaña actualizando los parámetros de URL de forma limpia.
   */
  function elegirSeccion(siguienteSeccion, datosPrevios = null) {
    setTextoBusqueda('');
    setPaginaSubastas(1);
    setDatosInicialesSeccion(datosPrevios);

    if (ubicacion.pathname !== '/panel') {
      const destino = siguienteSeccion === 'resumen' ? '/panel' : `/panel?tab=${siguienteSeccion}`;
      navegar(destino, { replace: true });
      return;
    }

    setParametrosUrl(siguienteSeccion === 'resumen' ? {} : { tab: siguienteSeccion }, { replace: true });
  }

  /**
   * Limpia parámetros de modal tras abrir una creación.
   */
  function limpiarAperturaFormulario() {
    if (abrirNuevoDesdeUrl) {
      setParametrosUrl({ tab: 'subastas' }, { replace: true });
    }
    if (datosInicialesSeccion?.abrirFormulario) {
      setDatosInicialesSeccion(null);
    }
  }

  // Generación de elementos de menú con contadores reactivos (insignias numéricas)
  const { seccionesMenu, seccionesCuenta } = construirMenuPanel({
    esAdmin,
    usuarioActual,
    usuarios,
    subastas,
    pujas,
    reportes,
    resenas,
    notificaciones,
  });

  const abrirFormularioSubasta = abrirNuevoDesdeUrl || Boolean(datosInicialesSeccion?.abrirFormulario);

  /**
   * Mapeo de vistas por sección:
   */
  const contenidoPorSeccion = {
    resumen: (
      <TabResumenPanel
        usuarioActual={usuarioActual} usuarios={usuarios} subastas={subastas}
        pujas={pujas} reportes={reportes} resenas={resenas}
        textoBusqueda={textoBusqueda} ahoraMs={ahoraMs} alElegirSeccion={elegirSeccion}
      />
    ),
    subastas: (
      <TabSubastasPanel
        usuarioActual={usuarioActual} usuarios={usuarios} subastas={subastas}
        pujas={pujas} textoBusqueda={textoBusqueda} ahoraMs={ahoraMs}
        paginaActual={paginaSubastas} alCambiarPagina={setPaginaSubastas}
        abrirDesdeAccesoExterno={abrirFormularioSubasta}
        alLimpiarNuevo={limpiarAperturaFormulario}
      />
    ),
    pujas: <TabPujasPanel usuarioActual={usuarioActual} subastas={subastas} pujas={pujas} textoBusqueda={textoBusqueda} />,
    reportes: (
      <TabReportesPanel
        usuarioActual={usuarioActual} usuarios={usuarios} subastas={subastas}
        reportes={reportes} textoBusqueda={textoBusqueda} datosIniciales={datosInicialesSeccion}
      />
    ),
    resenas: (
      <TabResenasPanel
        usuarioActual={usuarioActual} usuarios={usuarios} subastas={subastas}
        resenas={resenas} textoBusqueda={textoBusqueda} datosIniciales={datosInicialesSeccion}
      />
    ),
    usuarios: esAdmin ? <TabUsuariosPanel usuarioActual={usuarioActual} usuarios={usuarios} textoBusqueda={textoBusqueda} /> : null,
    notificaciones: <TabNotificacionesPanel usuarioActual={usuarioActual} notificaciones={notificaciones} textoBusqueda={textoBusqueda} />,
    perfil: <TabPerfilPanel usuarioActual={usuarioActual} subastas={subastas} pujas={pujas} />,
  };

  return (
    <div className="rounded-[28px] bg-[#F7FBF3] border border-[#224F10]/12 shadow-sm overflow-hidden flex flex-col lg:flex-row">
      {/* Barra lateral de navegación con insignias numéricas */}
      <Sidebar
        seccionActiva={seccionActiva}
        etiquetaRol={formatearRolUsuario(usuarioActual?.role, true)}
        seccionesMenu={seccionesMenu}
        seccionesCuenta={seccionesCuenta}
        alElegirSeccion={elegirSeccion}
      />

      {/* Área de contenido dinámico */}
      <div className="flex-1 p-5 sm:p-7 space-y-6 min-w-0">
        <Header
          seccionActiva={seccionActiva}
          textoBusqueda={textoBusqueda}
          alCambiarBusqueda={manejarCambioBusqueda}
          usuarioActual={usuarioActual}
        />

        {/* Renderizado de la pestaña activa o resumen por defecto */}
        {contenidoPorSeccion[seccionActiva] || contenidoPorSeccion.resumen}
      </div>
    </div>
  );
}
