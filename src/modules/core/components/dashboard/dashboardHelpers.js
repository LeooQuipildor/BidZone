import {
  AUCTION_CATEGORY_OPTIONS,
  AUCTION_FILTER_CATEGORIES,
  padTwoDigits,
  sameId,
} from '../../utils/formatters';

// Re-exportamos estas listas para mantener compatibilidad con los componentes del panel
export { AUCTION_CATEGORY_OPTIONS };
export const DASHBOARD_CATEGORIES = AUCTION_FILTER_CATEGORIES;

// Devuelve las horas, minutos y segundos restantes en formato HH:MM:SS
export function formatCountdownFromNow(endDateString, nowMs) {
  if (!endDateString) {
    return '00:00:00';
  }

  const diffMs = new Date(endDateString).getTime() - nowMs;
  if (Number.isNaN(diffMs) || diffMs <= 0) {
    return '00:00:00';
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${padTwoDigits(hours)}:${padTwoDigits(minutes)}:${padTwoDigits(seconds)}`;
}

// Toma las primeras 2 iniciales de un nombre para mostrar en el avatar (ej: "Juan Pérez" -> "JP")
export function getInitials(name, fallback = 'BZ') {
  const texto = String(name || fallback).trim();
  if (!texto) {
    return fallback;
  }

  const palabras = texto.split(' ');
  let iniciales = '';

  for (const palabra of palabras) {
    if (palabra) {
      iniciales += palabra[0];
    }
    if (iniciales.length === 2) {
      break;
    }
  }

  return (iniciales || fallback).toUpperCase();
}

// Calcula a qué usuario calificar y con qué rol según quién entra a calificar una subasta finalizada
export function getReviewDefaults(auction, currentUserId, otherUsers) {
  const primerUsuario = otherUsers[0] ? String(otherUsers[0].id) : '';

  if (!auction) {
    return {
      targetUserId: primerUsuario,
      roleContext: 'comprador_a_vendedor',
    };
  }

  if (sameId(auction.winnerId, currentUserId)) {
    return {
      targetUserId: String(auction.sellerId),
      roleContext: 'comprador_a_vendedor',
    };
  }

  if (sameId(auction.sellerId, currentUserId)) {
    return {
      targetUserId: String(auction.winnerId),
      roleContext: 'vendedor_a_comprador',
    };
  }

  return {
    targetUserId: String(auction.sellerId || primerUsuario),
    roleContext: 'comprador_a_vendedor',
  };
}
