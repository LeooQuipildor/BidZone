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
import { mismoId, useRelojSegundo } from '../utilidades/ayudas';
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

  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [datosInicialesSeccion, setDatosInicialesSeccion] = useState(null);
  const [contadorSeccion, setContadorSeccion] = useState(0);

  // Al entrar al panel cargamos los datos de cada módulo
  useEffect(() => {
    obtenerUsuarios();
    obtenerSubastas();
    obtenerPujas();
    obtenerReportes();
    obtenerResenas();
    obtenerNotificaciones();
  }, [obtenerUsuarios, obtenerSubastas, obtenerPujas, obtenerReportes, obtenerResenas, obtenerNotificaciones]);

  const esAdmin = usuarioActual?.role === 'admin';
  const tabUrlRaw = parametrosUrl.get('tab');
  const tabDesdeUrl = tabUrlRaw ? ALIAS_SECCION_URL[tabUrlRaw] || tabUrlRaw : '';
  const abrirNuevoDesdeUrl = parametrosUrl.get('nuevo') === '1' || parametrosUrl.get('new') === '1';
  const seccionSolicitada = tabDesdeUrl || seccionInicial || 'resumen';
  const seccionActiva = !esAdmin && seccionSolicitada === 'usuarios' ? 'resumen' : seccionSolicitada;
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

  const misSubastas = subastas.filter((item) => mismoId(item.sellerId, usuarioActual?.id));
  const misPujas = pujas.filter((item) => mismoId(item.bidderId, usuarioActual?.id));
  const misResenas = resenas.filter(
    (item) => mismoId(item.reviewerId, usuarioActual?.id) || mismoId(item.targetUserId, usuarioActual?.id)
  );
  const reportesAbiertos = reportes.filter((item) => item.status === 'en_revision').length;
  const notificacionesSinLeer = notificaciones.filter(
    (item) => mismoId(item.userId, usuarioActual?.id) && !item.read
  );

  const etiquetaSubastas = esAdmin ? 'Subastas' : 'Mis Subastas';
  const etiquetaReportes = esAdmin ? 'Tickets RN06' : 'Mis Reportes';

  const seccionesMenu = [
    { id: 'resumen', etiqueta: 'Resumen', icono: LayoutDashboard },
    { id: 'subastas', etiqueta: etiquetaSubastas, icono: Gavel, cantidad: esAdmin ? subastas.length : misSubastas.length },
    { id: 'pujas', etiqueta: 'Mis Pujas', icono: TrendingUp, cantidad: misPujas.length },
    { id: 'reportes', etiqueta: etiquetaReportes, icono: AlertOctagon, insignia: reportesAbiertos || null },
    { id: 'resenas', etiqueta: 'Mis Reseñas', icono: Star, cantidad: misResenas.length },
  ];

  if (esAdmin) {
    seccionesMenu.push({ id: 'usuarios', etiqueta: 'Usuarios', icono: Users, cantidad: usuarios.length });
  }

  const seccionesCuenta = [
    { id: 'notificaciones', etiqueta: 'Mis Notificaciones', icono: Bell, insignia: notificacionesSinLeer.length || null },
    { id: 'perfil', etiqueta: 'Mi Perfil', icono: IconoUsuario },
  ];

  const base = { usuarioActual, usuarios, subastas, textoBusqueda };
  const claveTab = `${seccionActiva}-${contadorSeccion}-${abrirNuevoDesdeUrl ? 'nuevo' : 'lista'}`;

  const contenidoPorSeccion = {
    resumen: <TabResumenPanel {...base} pujas={pujas} reportes={reportes} resenas={resenas} ahoraMs={ahoraMs} alElegirSeccion={elegirSeccion} />,
    subastas: <TabSubastasPanel key={claveTab} {...base} pujas={pujas} ahoraMs={ahoraMs} datosIniciales={datosInicialesEfectivos} />,
    pujas: <TabPujasPanel key={claveTab} {...base} pujas={pujas} />,
    reportes: <TabReportesPanel key={claveTab} {...base} reportes={reportes} datosIniciales={datosInicialesEfectivos} />,
    resenas: <TabResenasPanel key={claveTab} {...base} resenas={resenas} datosIniciales={datosInicialesEfectivos} />,
    usuarios: esAdmin ? <TabUsuariosPanel key={claveTab} {...base} /> : null,
    notificaciones: <TabNotificacionesPanel key={claveTab} usuarioActual={usuarioActual} notificaciones={notificaciones} textoBusqueda={textoBusqueda} />,
    perfil: <TabPerfilPanel key={claveTab} usuarioActual={usuarioActual} subastas={subastas} pujas={pujas} />,
  };

  return (
    <div className="rounded-[28px] bg-[#F7FBF3] border border-[#224F10]/12 shadow-sm overflow-hidden flex flex-col lg:flex-row">
      <Sidebar
        seccionActiva={seccionActiva}
        etiquetaRol={esAdmin ? 'Admin' : 'Socio'}
        seccionesMenu={seccionesMenu}
        seccionesCuenta={seccionesCuenta}
        alElegirSeccion={elegirSeccion}
      />

      <div className="flex-1 p-5 sm:p-7 space-y-6 min-w-0">
        <Header
          seccionActiva={seccionActiva}
          textoBusqueda={textoBusqueda}
          alCambiarBusqueda={setTextoBusqueda}
          usuarioActual={usuarioActual}
        />

        {contenidoPorSeccion[seccionActiva] || contenidoPorSeccion.resumen}
      </div>
    </div>
  );
}
