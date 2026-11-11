import {
  CATEGORIAS_FILTRO_SUBASTA,
  completarDosDigitos,
} from '../../utilidades/formatos';
import { coincideConBusqueda, mismoId } from '../../utilidades/ayudas';

export const CATEGORIAS_PANEL = CATEGORIAS_FILTRO_SUBASTA;

// Devuelve el tiempo restante en formato HH:MM:SS para relojes en vivo del panel
export function formatearCuentaRegresiva(fechaFinTexto, ahoraMs) {
  if (!fechaFinTexto) return '00:00:00';

  const diferenciaMs = new Date(fechaFinTexto).getTime() - ahoraMs;
  if (Number.isNaN(diferenciaMs) || diferenciaMs <= 0) return '00:00:00';

  const totalSegundos = Math.floor(diferenciaMs / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  return `${completarDosDigitos(horas)}:${completarDosDigitos(minutos)}:${completarDosDigitos(segundos)}`;
}

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

// Filtra por texto, categoría y estado, y ordena la lista de subastas
export function filtrarYOrdenarSubastas(subastas, textoBusqueda, categoria, estadoFiltro, ordenarPor) {
  const filtradas = subastas.filter((subasta) => {
    const coincideTexto = coincideConBusqueda([subasta.title, subasta.description, subasta.category], textoBusqueda);
    const coincideCategoria = categoria === 'Todas' || subasta.category === categoria;
    const coincideEstado = estadoFiltro === 'todas' || subasta.status === estadoFiltro;
    return coincideTexto && coincideCategoria && coincideEstado;
  });

  return filtradas.sort((subastaA, subastaB) => {
    if (ordenarPor === 'menorPrecio') return Number(subastaA.currentPrice) - Number(subastaB.currentPrice);
    if (ordenarPor === 'mayorPrecio') return Number(subastaB.currentPrice) - Number(subastaA.currentPrice);
    return new Date(subastaA.endTime).getTime() - new Date(subastaB.endTime).getTime();
  });
}

