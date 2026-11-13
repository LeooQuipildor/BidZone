/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/ayudasPanel.js
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el módulo de funciones auxiliares y constantes para la barra lateral y las vistas
 * del Panel de Control (`VistaPanelControl.jsx`).
 *
 * ¿QUÉ HACE ESTE ARCHIVO?
 * 1. Define opciones de filtrado y ordenamiento específicas para el panel.
 * 2. `construirMenuPanel`: Calcula dinámicamente las opciones de navegación lateral del sidebar,
 *    contando elementos propios y pendientes en tiempo real (ej: notificaciones sin leer,
 *    tickets de reporte abiertos para moderación RN06).
 * 3. `obtenerTextosTabSubastas`: Deriva los títulos y textos descriptivos de la pestaña de subastas
 *    según si quien consulta es un administrador en modo moderación o un usuario regular.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Menú Declarativo Dinámico:
 *   En lugar de escribir enlaces rígidos en el JSX, generamos una estructura de datos `seccionesMenu`
 *   con objetos que incluyen etiqueta, icono, contador de elementos e insignias de alerta.
 * - Filtrado Relacional en Memoria:
 *   Usa `mismoId` para aislar rápidamente "mis subastas", "mis pujas" y "mis notificaciones sin leer".
 */

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

/**
 * Pestañas de alternancia para administradores en la sección de subastas.
 */
export const VISTAS_SUBASTA_ADMIN = [
  { valor: 'todas', etiqueta: 'Todas (Moderación)' },
  { valor: 'mias', etiqueta: 'Mis Subastas' },
];

/**
 * Filtros de estado de sala combinados con la opción "Todas".
 */
export const OPCIONES_ESTADO_PANEL = [
  { valor: 'todas', etiqueta: 'Estado: Todas las subastas' },
  ...OPCIONES_ESTADO_SALA.map((op) => ({ valor: op.valor, etiqueta: `Estado: ${op.etiqueta}` })),
];

/**
 * Criterios de ordenamiento enriquecidos para la barra de herramientas del panel.
 */
export const OPCIONES_ORDEN_PANEL = OPCIONES_ORDEN_SUBASTA.map((op) => ({
  valor: op.valor,
  etiqueta: `Orden: ${op.etiqueta}`,
}));

/**
 * Construye la lista de secciones para el sidebar del panel con sus respectivos contadores.
 *
 * @param {Object} params
 * @param {boolean} params.esAdmin - Si el usuario actual es administrador.
 * @param {Object} params.usuarioActual - Datos de la sesión.
 * @param {Array} params.usuarios - Colección de usuarios.
 * @param {Array} params.subastas - Colección de subastas.
 * @param {Array} params.pujas - Colección de pujas.
 * @param {Array} params.reportes - Colección de reportes.
 * @param {Array} params.resenas - Colección de reseñas.
 * @param {Array} params.notificaciones - Colección de notificaciones.
 * @returns {{seccionesMenu: Array, seccionesCuenta: Array}}
 */
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
  // Filtros de colecciones personales
  const misSubastas = subastas.filter((item) => mismoId(item.sellerId, usuarioActual?.id));
  const misPujas = pujas.filter((item) => mismoId(item.bidderId, usuarioActual?.id));
  const misResenas = resenas.filter(
    (item) =>
      mismoId(item.reviewerId, usuarioActual?.id) || mismoId(item.targetUserId, usuarioActual?.id)
  );

  // Conteo de elementos pendientes que requieren atención urgente
  const reportesAbiertos = reportes.filter((item) => item.status === 'en_revision').length;
  const notificacionesSinLeer = notificaciones.filter(
    (item) => mismoId(item.userId, usuarioActual?.id) && !item.read
  ).length;

  // Bloque principal de navegación funcional
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

  // Si es administrador se agrega la sección de Usuarios
  if (esAdmin) {
    seccionesMenu.push({
      id: 'usuarios',
      etiqueta: 'Usuarios',
      icono: Users,
      cantidad: usuarios.length,
    });
  }

  // Bloque secundario de cuenta personal
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

/**
 * Retorna títulos, subtítulos y mensajes de estado vacío adaptados para la pestaña de subastas.
 *
 * @param {boolean} esAdmin - Si el usuario es administrador.
 * @param {string} vistaAdmin - 'todas' o 'mias'.
 * @param {number} totalPlataforma - Total de subastas en la plataforma.
 * @param {number} totalPropias - Subastas creadas por el usuario en sesión.
 * @returns {{titulo: string, subtitulo: string, vacio: string}}
 */
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
