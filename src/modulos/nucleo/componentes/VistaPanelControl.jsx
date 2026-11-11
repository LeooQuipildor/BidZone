import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertOctagon,
  Bell,
  Gavel,
  LayoutDashboard,
  Star,
  TrendingUp,
  User as IconoUsuario,
  Users,
} from 'lucide-react';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';
import { usarTiendaPujas } from '../../pujas/estado/tiendaPujas';
import { usarTiendaReportes } from '../../reportes/estado/tiendaReportes';
import { usarTiendaResenas } from '../../resenas/estado/tiendaResenas';
import { usarTiendaNotificaciones } from '../../notificaciones/estado/tiendaNotificaciones';
import { mismoId } from '../utilidades/ayudas';
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

// Permite aceptar nombres de pestaña previos por URL sin romper enlaces
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

  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);
  const usuarios = usarTiendaAutenticacion((estado) => estado.usuarios);
  const obtenerUsuarios = usarTiendaAutenticacion((estado) => estado.obtenerUsuarios);
  const cerrarSesion = usarTiendaAutenticacion((estado) => estado.cerrarSesion);
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

  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [relojPausado, setRelojPausado] = useState(false);
  const [ahoraMs, setAhoraMs] = useState(() => Date.now());
  const [datosInicialesSeccion, setDatosInicialesSeccion] = useState(null);
  const [contadorSeccion, setContadorSeccion] = useState(0);

  // Al entrar al panel cargamos la información de todos los módulos
  useEffect(() => {
    obtenerUsuarios();
    obtenerSubastas();
    obtenerPujas();
    obtenerReportes();
    obtenerResenas();
    obtenerNotificaciones();
  }, [obtenerUsuarios, obtenerSubastas, obtenerPujas, obtenerReportes, obtenerResenas, obtenerNotificaciones]);

  // Reloj de 1 segundo para actualizar los contadores regresivos en vivo
  useEffect(() => {
    if (relojPausado) return;
    const intervalo = setInterval(() => setAhoraMs(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, [relojPausado]);

  const tabUrlRaw = parametrosUrl.get('tab');
  const tabDesdeUrl = tabUrlRaw ? ALIAS_SECCION_URL[tabUrlRaw] || tabUrlRaw : '';
  const abrirNuevoDesdeUrl = parametrosUrl.get('nuevo') === '1' || parametrosUrl.get('new') === '1';
  const seccionActiva = tabDesdeUrl || seccionInicial || 'resumen';
  const datosInicialesEfectivos =
    datosInicialesSeccion || (abrirNuevoDesdeUrl ? { abrirFormulario: true } : null);

  function elegirSeccion(siguienteSeccion, datosPrevios = null) {
    setTextoBusqueda('');
    setDatosInicialesSeccion(datosPrevios);
    setContadorSeccion((previo) => previo + 1);

    if (ubicacion.pathname !== '/dashboard') {
      navegar(siguienteSeccion === 'resumen' ? '/dashboard' : `/dashboard?tab=${siguienteSeccion}`, { replace: true });
      return;
    }
    setParametrosUrl(siguienteSeccion === 'resumen' ? {} : { tab: siguienteSeccion }, { replace: true });
  }

  function manejarCierreSesion() {
    cerrarSesion();
    navegar('/');
  }

  const reportesAbiertos = reportes.filter((item) => item.status === 'en_revision').length;
  const notificacionesSinLeer = notificaciones.filter(
    (item) => mismoId(item.userId, usuarioActual?.id) && !item.read
  );

  const seccionesMenu = [
    { id: 'resumen', etiqueta: 'Panel Principal', icono: LayoutDashboard },
    { id: 'subastas', etiqueta: 'Subastas', icono: Gavel, insignia: subastas.length, varianteInsignia: 'oscuro' },
    { id: 'pujas', etiqueta: 'Pujas', icono: TrendingUp, cantidad: pujas.length },
    { id: 'reportes', etiqueta: 'Reportes', icono: AlertOctagon, insignia: reportesAbiertos || null },
    { id: 'resenas', etiqueta: 'Reseñas', icono: Star, cantidad: resenas.length },
    { id: 'usuarios', etiqueta: 'Usuarios', icono: Users, cantidad: usuarios.length },
  ];

  const seccionesGenerales = [
    { id: 'notificaciones', etiqueta: 'Notificaciones', icono: Bell, insignia: notificacionesSinLeer.length || null },
    { id: 'perfil', etiqueta: 'Mi Perfil', icono: IconoUsuario },
  ];

  const base = { usuarioActual, usuarios, subastas, textoBusqueda };
  const claveTab = `${seccionActiva}-${contadorSeccion}-${abrirNuevoDesdeUrl ? 'nuevo' : 'lista'}`;

  const contenidoPorSeccion = {
    resumen: (
      <TabResumenPanel
        {...base}
        pujas={pujas}
        reportes={reportes}
        ahoraMs={ahoraMs}
        relojPausado={relojPausado}
        alAlternarPausa={() => setRelojPausado((pausado) => !pausado)}
        alElegirSeccion={elegirSeccion}
      />
    ),
    subastas: <TabSubastasPanel key={claveTab} {...base} pujas={pujas} ahoraMs={ahoraMs} datosIniciales={datosInicialesEfectivos} />,
    pujas: <TabPujasPanel key={claveTab} {...base} pujas={pujas} />,
    reportes: <TabReportesPanel key={claveTab} {...base} reportes={reportes} datosIniciales={datosInicialesEfectivos} />,
    resenas: <TabResenasPanel key={claveTab} {...base} resenas={resenas} datosIniciales={datosInicialesEfectivos} />,
    usuarios: <TabUsuariosPanel key={claveTab} {...base} />,
    notificaciones: (
      <TabNotificacionesPanel key={claveTab} usuarioActual={usuarioActual} notificaciones={notificaciones} textoBusqueda={textoBusqueda} />
    ),
    perfil: <TabPerfilPanel key={claveTab} usuarioActual={usuarioActual} subastas={subastas} pujas={pujas} />,
  };

  return (
    <div className="rounded-[28px] bg-[#F7FBF3] border border-[#224F10]/12 shadow-sm overflow-hidden flex flex-col lg:flex-row">
      <Sidebar
        seccionActiva={seccionActiva}
        etiquetaRol={usuarioActual?.role === 'admin' ? 'Admin' : 'Socio'}
        seccionesMenu={seccionesMenu}
        seccionesGenerales={seccionesGenerales}
        alElegirSeccion={elegirSeccion}
        alCerrarSesion={manejarCierreSesion}
      />

      <div className="flex-1 p-5 sm:p-7 space-y-6 min-w-0">
        <Header
          seccionActiva={seccionActiva}
          textoBusqueda={textoBusqueda}
          alCambiarBusqueda={setTextoBusqueda}
          cantidadSinLeer={notificacionesSinLeer.length}
          usuarioActual={usuarioActual}
          alElegirSeccion={elegirSeccion}
        />

        {contenidoPorSeccion[seccionActiva] || null}
      </div>
    </div>
  );
}
