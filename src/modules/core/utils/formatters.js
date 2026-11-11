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
  if (!dateString) {
    return '—';
  }
  const fecha = new Date(dateString);
  if (Number.isNaN(fecha.getTime())) {
    return dateString;
  }
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

  if (Number.isNaN(fecha.getTime())) {
    return '';
  }

  // Ajustamos la diferencia horaria local para mostrar la hora correcta en el input
  const diferenciaLocalMs = fecha.getTimezoneOffset() * 60 * 1000;
  const fechaLocal = new Date(fecha.getTime() - diferenciaLocalMs);
  return fechaLocal.toISOString().slice(0, 16);
}

// Convierte el valor de un <input type="datetime-local"> a fecha ISO UTC para guardar en el backend
export function toIsoFromLocalInput(localInput) {
  if (!localInput) {
    return '';
  }
  const fecha = new Date(localInput);
  if (Number.isNaN(fecha.getTime())) {
    return '';
  }
  return fecha.toISOString();
}

// Agrega un cero a la izquierda si el número tiene un solo dígito (ej: 5 -> "05")
export function padTwoDigits(number) {
  return String(number).padStart(2, '0');
}

// Calcula cuánto tiempo falta hasta el cierre de una subasta
export function getRemainingTime(endDateString, now = Date.now()) {
  const fechaFinMs = new Date(endDateString).getTime();
  const diferenciaMs = fechaFinMs - now;

  if (Number.isNaN(diferenciaMs) || diferenciaMs <= 0) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: 'Finalizada',
    };
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

  return {
    expired: false,
    days,
    hours,
    minutes,
    seconds,
    formatted,
  };
}

// Compara dos IDs sin importar si uno viene como número y otro como texto ("1" y 1 son iguales)
export function sameId(idA, idB) {
  if (idA === null || idA === undefined || idA === '') {
    return false;
  }
  if (idB === null || idB === undefined || idB === '') {
    return false;
  }
  return Number(idA) === Number(idB);
}

// Busca un elemento por su propiedad `id` dentro de un array
export function findById(list, id) {
  if (!Array.isArray(list)) {
    return null;
  }
  const found = list.find((item) => sameId(item.id, id));
  return found || null;
}

// Reemplaza un elemento en la lista cuando coincide su ID
export function replaceById(list, id, updatedItem) {
  return list.map((item) => {
    if (sameId(item.id, id)) {
      return updatedItem;
    }
    return item;
  });
}

// Elimina un elemento de la lista según su ID
export function removeById(list, id) {
  return list.filter((item) => !sameId(item.id, id));
}

// Inserta un elemento nuevo al principio, o lo actualiza si ya existía en la lista
export function upsertById(list, item) {
  if (findById(list, item.id)) {
    return replaceById(list, item.id, item);
  }
  return [item, ...list];
}

// Elige un ID válido de una lista: primero intenta con preferredId, luego fallbackId, o el primero disponible
export function pickValidId(list, preferredId, fallbackId = '') {
  if (!Array.isArray(list) || list.length === 0) {
    return '';
  }
  if (findById(list, preferredId)) {
    return String(preferredId);
  }
  if (findById(list, fallbackId)) {
    return String(fallbackId);
  }
  return String(list[0].id);
}

// Verifica si alguno de los textos de un elemento coincide con lo escrito en el buscador
export function matchesSearch(fields, search) {
  if (!search || !search.trim()) {
    return true;
  }
  const textoBuscado = search.trim().toLowerCase();
  for (const field of fields) {
    const textoCampo = String(field || '').toLowerCase();
    if (textoCampo.includes(textoBuscado)) {
      return true;
    }
  }
  return false;
}

// Calcula la oferta mínima recomendada para una subasta (RN01: precio actual + incremento mínimo)
export function getSuggestedBidAmount(auction) {
  if (!auction) {
    return '';
  }
  const minimo = Number(auction.currentPrice) + Number(auction.minIncrement);
  return String(minimo);
}

// Calcula el tope máximo permitido para una puja (10 veces el precio inicial)
export function getMaxBidAmount(auction) {
  if (!auction) {
    return undefined;
  }
  const precioInicial = Number(auction.basePrice || auction.currentPrice);
  return precioInicial * 10;
}

// Valida los datos de una nueva puja antes de mostrar el modal de confirmación
// Devuelve un texto de error si algo falla, o '' (vacío) si todo está correcto
export function validateBidInput({
  auction,
  amount,
  commitmentAccepted,
  checkMax = true,
}) {
  if (!auction) {
    return 'Debes seleccionar una subasta activa.';
  }

  const montoNumerico = Number(amount);
  if (!amount || Number.isNaN(montoNumerico) || montoNumerico <= 0) {
    return 'Por favor ingresa un monto numérico válido para ofertar.';
  }

  const minimoPermitido = Number(auction.currentPrice) + Number(auction.minIncrement);
  if (montoNumerico < minimoPermitido) {
    return `RN01: La oferta debe ser de al menos ${formatCurrency(minimoPermitido)} (Precio actual + incremento mínimo).`;
  }

  if (checkMax) {
    const maximoPermitido = getMaxBidAmount(auction);
    if (maximoPermitido && montoNumerico > maximoPermitido) {
      return `La oferta no puede superar 10 veces el precio inicial de la subasta (${formatCurrency(maximoPermitido)}).`;
    }
  }

  if (!commitmentAccepted) {
    return 'Debes aceptar el compromiso vinculante (RN04) antes de enviar tu oferta.';
  }

  return '';
}
