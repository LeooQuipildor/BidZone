export const DASHBOARD_CATEGORIES = [
  'Todas',
  'Tecnología',
  'Gaming',
  'Hogar y Oficina',
  'Deportes',
  'Fotografía',
  'Vehículos',
];

export const AUCTION_CATEGORY_OPTIONS = [
  { value: 'Tecnología', label: 'Tecnología' },
  { value: 'Gaming', label: 'Gaming' },
  { value: 'Hogar y Oficina', label: 'Hogar y Oficina' },
  { value: 'Deportes', label: 'Deportes' },
  { value: 'Fotografía', label: 'Fotografía' },
  { value: 'Vehículos', label: 'Vehículos' },
];

export function formatCountdownFromNow(endDateString, nowMs) {
  if (!endDateString) return '00:00:00';
  const diff = new Date(endDateString).getTime() - nowMs;
  if (Number.isNaN(diff) || diff <= 0) return '00:00:00';
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function getInitials(name, fallback = 'BZ') {
  return (name || fallback)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

