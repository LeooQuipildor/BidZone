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

  useEffect(() => {
    obtenerUsuarios();
    obtenerSubastas();
    obtenerPujas();
    obtenerReportes();
    obtenerResenas();
    obtenerNotificaciones();
  }, [obtenerUsuarios, obtenerSubastas, obtenerPujas, obtenerReportes, obtenerResenas, obtenerNotificaciones]);

  const esAdmin = usuarioActual?.rol === 'admin';

  // Resolución de la pestaña activa leyendo query params
  const tabUrlRaw = parametrosUrl.get('tab');
  const tabDesdeUrl = tabUrlRaw ? ALIAS_SECCION_URL[tabUrlRaw] || tabUrlRaw : '';
  const abrirNuevoDesdeUrl = parametrosUrl.get('nuevo') === '1' || parametrosUrl.get('new') === '1';
  const seccionSolicitada = tabDesdeUrl || seccionInicial || 'resumen';

  // Seguridad: Si un usuario regular intenta entrar a la pestaña de usuarios, se le redirige al resumen
  const seccionActiva = !esAdmin && seccionSolicitada === 'usuarios' ? 'resumen' : seccionSolicitada;

  function manejarCambioBusqueda(nuevoTexto) {
    setTextoBusqueda(nuevoTexto);
    setPaginaSubastas(1);
  }

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
        etiquetaRol={formatearRolUsuario(usuarioActual?.rol, true)}
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
