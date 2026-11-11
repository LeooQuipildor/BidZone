export const DEFAULT_AUCTION_IMAGE_URL =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80';

export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function toLocalDatetimeInputValue(dateInput) {
  const date = dateInput
    ? new Date(dateInput)
    : new Date(Date.now() + 24 * 3600 * 1000);
  if (Number.isNaN(date.getTime())) return '';
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function toIsoFromLocalInput(localInput) {
  if (!localInput) return '';
  const parsed = new Date(localInput);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString();
}

export function getRemainingTime(endDateString, now = Date.now()) {
  const end = new Date(endDateString).getTime();
  const diff = end - now;

  if (diff <= 0) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: 'Finalizada',
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const pad = (n) => String(n).padStart(2, '0');
  const formatted =
    days > 0
      ? `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    expired: false,
    days,
    hours,
    minutes,
    seconds,
    formatted,
  };
}

