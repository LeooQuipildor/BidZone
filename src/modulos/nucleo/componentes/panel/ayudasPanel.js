import {
  CATEGORIAS_FILTRO_SUBASTA,
  OPCIONES_ESTADO_SALA,
} from '../../utilidades/formatos';
import { coincideConBusqueda, mismoId } from '../../utilidades/ayudas';

export const CATEGORIAS_PANEL = CATEGORIAS_FILTRO_SUBASTA;

export const VISTAS_SUBASTA_ADMIN = [
  { valor: 'todas', etiqueta: 'Todas (Moderación)' },
  { valor: 'mias', etiqueta: 'Mis Subastas' },
];

export const OPCIONES_ESTADO_PANEL = [
  { valor: 'todas', etiqueta: 'Todas las subastas' },
  ...OPCIONES_ESTADO_SALA,
];

// Toma las primeras 2 iniciales de un nombre para el avatar circular (ejemplo: "Juan Pérez" -> "JP")
export function obtenerIniciales(nombre, respaldo = 'BZ') {
  const texto = String(nombre || respaldo).trim();
  if (!texto) return respaldo;

  const palabras = texto.split(' ');
  let iniciales = '';
  for (const palabra of palabras) {
    if (palabra) iniciales += palabra[0];
    if (iniciales.length === 2) break;
  }
  return (iniciales || respaldo).toUpperCase();
}

// Devuelve las subastas finalizadas con ganador en las que participó el usuario y aún no calificó (RN07)
export function obtenerSubastasPendientesResena(subastas, resenas, idUsuarioActual) {
  return subastas.filter((subasta) => {
    if (subasta.status !== 'finalizada' || !subasta.winnerId) return false;
    const participa =
      mismoId(subasta.winnerId, idUsuarioActual) || mismoId(subasta.sellerId, idUsuarioActual);
    const yaCalificada = resenas.some(
      (resena) =>
        mismoId(resena.auctionId, subasta.id) && mismoId(resena.reviewerId, idUsuarioActual)
    );
    return participa && !yaCalificada;
  });
}

// Calcula a qué usuario calificar y en qué rol según quién abre la reseña (RN07)
export function obtenerValoresPorDefectoResena(subasta, idUsuarioActual, otrosUsuarios) {
  const primerUsuario = otrosUsuarios[0] ? String(otrosUsuarios[0].id) : '';
  if (!subasta) {
    return { idUsuarioCalificado: primerUsuario, contextoRol: 'comprador_a_vendedor' };
  }
  if (mismoId(subasta.winnerId, idUsuarioActual)) {
    return { idUsuarioCalificado: String(subasta.sellerId), contextoRol: 'comprador_a_vendedor' };
  }
  if (mismoId(subasta.sellerId, idUsuarioActual)) {
    return { idUsuarioCalificado: String(subasta.winnerId), contextoRol: 'vendedor_a_comprador' };
  }
  return {
    idUsuarioCalificado: String(subasta.sellerId || primerUsuario),
    contextoRol: 'comprador_a_vendedor',
  };
}

function coincideEstadoSubasta(subasta, estadoFiltro, ahoraMs) {
  if (estadoFiltro === 'todas') return subasta.status !== 'cancelada';
  if (estadoFiltro === 'finalizada') return subasta.status === 'finalizada';

  const fechaFinMs = new Date(subasta.endTime).getTime();
  const estaActiva = subasta.status === 'activa' && !Number.isNaN(fechaFinMs) && fechaFinMs > ahoraMs;
  if (!estaActiva) return false;
  if (estadoFiltro === 'activa') return true;

  const ahora = new Date(ahoraMs);
  const finHoyMs = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1).getTime();
  if (estadoFiltro === 'terminaHoy') return fechaFinMs < finHoyMs;

  if (estadoFiltro === 'terminaManana') {
    const finMananaMs = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 2).getTime();
    return fechaFinMs >= finHoyMs && fechaFinMs < finMananaMs;
  }

  return subasta.status === estadoFiltro;
}

// Filtra por texto, categoría, estado o ventana de cierre, y ordena la lista de subastas
export function filtrarYOrdenarSubastas(subastas, textoBusqueda, categoria, estadoFiltro, ordenarPor) {
  const ahoraMs = Date.now();
  const filtradas = subastas.filter((subasta) => {
    const coincideTexto = coincideConBusqueda([subasta.title, subasta.description, subasta.category], textoBusqueda);
    const coincideCategoria = categoria === 'Todas' || subasta.category === categoria;
    const coincideEstado = coincideEstadoSubasta(subasta, estadoFiltro, ahoraMs);
    return coincideTexto && coincideCategoria && coincideEstado;
  });

  return filtradas.sort((subastaA, subastaB) => {
    if (ordenarPor === 'menorPrecio') return Number(subastaA.currentPrice) - Number(subastaB.currentPrice);
    if (ordenarPor === 'mayorPrecio') return Number(subastaB.currentPrice) - Number(subastaA.currentPrice);
    return new Date(subastaA.endTime).getTime() - new Date(subastaB.endTime).getTime();
  });
}

// Corta cualquier listado al tamaño de página indicado manteniendo la página dentro de rango
export function paginarLista(elementos, paginaSolicitada, porPagina) {
  const totalPaginas = Math.max(1, Math.ceil(elementos.length / porPagina));
  const paginaActual = Math.min(Math.max(1, paginaSolicitada), totalPaginas);
  const inicio = (paginaActual - 1) * porPagina;
  return {
    elementosPagina: elementos.slice(inicio, inicio + porPagina),
    paginaActual,
    totalPaginas,
  };
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

