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
import { OPCIONES_ESTADO_SALA, OPCIONES_ORDEN_SUBASTA } from '../../utilidades/formatos';
import { mismoId } from '../../utilidades/ayudas';

export const VISTAS_SUBASTA_ADMIN = [
  { valor: 'todas', etiqueta: 'Todas (Moderación)' },
  { valor: 'mias', etiqueta: 'Mis Subastas' },
];

export const OPCIONES_ESTADO_PANEL = [
  { valor: 'todas', etiqueta: 'Estado: Todas las subastas' },
  ...OPCIONES_ESTADO_SALA.map((op) => ({ valor: op.valor, etiqueta: `Estado: ${op.etiqueta}` })),
];

export const OPCIONES_ORDEN_PANEL = OPCIONES_ORDEN_SUBASTA.map((op) => ({
  valor: op.valor,
  etiqueta: `Orden: ${op.etiqueta}`,
}));

// Construye los grupos de botones de la barra lateral del panel según rol y contadores reales
export function construirMenuPanel({
  esAdmin,
  usuarioActual,
  usuarios,
  subastas,
  pujas,
  reportes,
  resenas,
  notificaciones,
}) {
  const misSubastas = subastas.filter((item) => mismoId(item.sellerId, usuarioActual?.id));
  const misPujas = pujas.filter((item) => mismoId(item.bidderId, usuarioActual?.id));
  const misResenas = resenas.filter(
    (item) =>
      mismoId(item.reviewerId, usuarioActual?.id) || mismoId(item.targetUserId, usuarioActual?.id)
  );
  const reportesAbiertos = reportes.filter((item) => item.status === 'en_revision').length;
  const notificacionesSinLeer = notificaciones.filter(
    (item) => mismoId(item.userId, usuarioActual?.id) && !item.read
  ).length;

  const seccionesMenu = [
    { id: 'resumen', etiqueta: 'Resumen', icono: LayoutDashboard },
    {
      id: 'subastas',
      etiqueta: esAdmin ? 'Subastas' : 'Mis Subastas',
      icono: Gavel,
      cantidad: esAdmin ? subastas.length : misSubastas.length,
    },
    { id: 'pujas', etiqueta: 'Mis Pujas', icono: TrendingUp, cantidad: misPujas.length },
    {
      id: 'reportes',
      etiqueta: esAdmin ? 'Tickets RN06' : 'Mis Reportes',
      icono: AlertOctagon,
      insignia: reportesAbiertos || null,
    },
    { id: 'resenas', etiqueta: 'Mis Reseñas', icono: Star, cantidad: misResenas.length },
  ];

  if (esAdmin) {
    seccionesMenu.push({
      id: 'usuarios',
      etiqueta: 'Usuarios',
      icono: Users,
      cantidad: usuarios.length,
    });
  }

  const seccionesCuenta = [
    {
      id: 'notificaciones',
      etiqueta: 'Mis Notificaciones',
      icono: Bell,
      insignia: notificacionesSinLeer || null,
    },
    { id: 'perfil', etiqueta: 'Mi Perfil', icono: IconoUsuario },
  ];

  return { seccionesMenu, seccionesCuenta };
}

// Calcula título, subtítulo y estado vacío de la pestaña de subastas según rol y vista activa
export function obtenerTextosTabSubastas(esAdmin, vistaAdmin, totalPlataforma, totalPropias) {
  if (esAdmin && vistaAdmin === 'todas') {
    return {
      titulo: 'Subastas de la Plataforma',
      subtitulo: `Moderación global (${totalPlataforma} lotes). Edita los tuyos o solicita correcciones al vendedor en lotes ajenos.`,
      vacio: 'No hay subastas que coincidan con los filtros actuales.',
    };
  }
  return {
    titulo: 'Mis Subastas',
    subtitulo: `Administra tus publicaciones (${totalPropias} creadas con tu cuenta).`,
    vacio:
      totalPropias === 0
        ? 'Todavía no publicaste subastas. Toca "Publicar Subasta" para crear tu primer lote.'
        : 'No hay subastas que coincidan con los filtros actuales.',
  };
}
