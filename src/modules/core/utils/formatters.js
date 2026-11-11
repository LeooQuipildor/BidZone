// Imagen por defecto cuando una subasta no tiene URL de foto propia
export const DEFAULT_AUCTION_IMAGE_URL =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80';

// Categorías oficiales para crear o editar una subasta
export const AUCTION_CATEGORY_OPTIONS = [
  { value: 'Tecnología', label: 'Tecnología' },
  { value: 'Gaming', label: 'Gaming' },
  { value: 'Hogar y Oficina', label: 'Hogar y Oficina' },
  { value: 'Deportes', label: 'Deportes' },
  { value: 'Fotografía', label: 'Fotografía' },
  { value: 'Vehículos', label: 'Vehículos' },
];

// Lista de categorías para filtros (incluye la opción "Todas")
export const AUCTION_FILTER_CATEGORIES = [
  'Todas',
  'Tecnología',
  'Gaming',
  'Hogar y Oficina',
  'Deportes',
  'Fotografía',
  'Vehículos',
];

// Formatea un número a pesos argentinos sin decimales (ej: $ 150.000)
export function formatCurrency(amount) {
  const numero = Number(amount) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(numero);
}

// Convierte una fecha ISO a texto legible en español (ej: 10 nov 2026, 18:30)
export function formatDateTime(dateString) {
  if (!dateString) return '—';
  const fecha = new Date(dateString);
  if (Number.isNaN(fecha.getTime())) return dateString;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
}

// Convierte una fecha al formato YYYY-MM-DDTHH:mm para usar en <input type="datetime-local">
export function toLocalDatetimeInputValue(dateInput) {
  const unDiaEnMs = 24 * 60 * 60 * 1000;
  const fecha = dateInput ? new Date(dateInput) : new Date(Date.now() + unDiaEnMs);
  if (Number.isNaN(fecha.getTime())) return '';

  const diferenciaLocalMs = fecha.getTimezoneOffset() * 60 * 1000;
  return new Date(fecha.getTime() - diferenciaLocalMs).toISOString().slice(0, 16);
}

// Convierte el valor de un <input type="datetime-local"> a fecha ISO UTC para guardar en el backend
export function toIsoFromLocalInput(localInput) {
  if (!localInput) return '';
  const fecha = new Date(localInput);
  return Number.isNaN(fecha.getTime()) ? '' : fecha.toISOString();
}

// Agrega un cero a la izquierda si el número tiene un solo dígito (ej: 5 -> "05")
export function padTwoDigits(number) {
  return String(number).padStart(2, '0');
}

// Calcula cuánto tiempo falta hasta el cierre de una subasta
export function getRemainingTime(endDateString, now = Date.now()) {
  const diferenciaMs = new Date(endDateString).getTime() - now;
  if (Number.isNaN(diferenciaMs) || diferenciaMs <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, formatted: 'Finalizada' };
  }

  const totalSegundos = Math.floor(diferenciaMs / 1000);
  const days = Math.floor(totalSegundos / 86400);
  const hours = Math.floor((totalSegundos % 86400) / 3600);
  const minutes = Math.floor((totalSegundos % 3600) / 60);
  const seconds = totalSegundos % 60;

  let formatted = `${padTwoDigits(hours)}:${padTwoDigits(minutes)}:${padTwoDigits(seconds)}`;
  if (days > 0) {
    formatted = `${days}d ${padTwoDigits(hours)}h ${padTwoDigits(minutes)}m ${padTwoDigits(seconds)}s`;
  }

  return { expired: false, days, hours, minutes, seconds, formatted };
}

// Re-exportamos los helpers de listas y pujas para que las importaciones existentes sigan funcionando
export * from './helpers';
