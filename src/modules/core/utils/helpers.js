import { formatCurrency } from './formatters';

// Compara dos IDs sin importar si uno viene como número y otro como texto ("1" y 1 son iguales)
export function sameId(idA, idB) {
  if (idA === null || idA === undefined || idA === '') return false;
  if (idB === null || idB === undefined || idB === '') return false;
  return Number(idA) === Number(idB);
}

// Busca un elemento por su propiedad `id` dentro de un array
export function findById(list, id) {
  if (!Array.isArray(list)) return null;
  return list.find((item) => sameId(item.id, id)) || null;
}

// Reemplaza un elemento en la lista cuando coincide su ID
export function replaceById(list, id, updatedItem) {
  return list.map((item) => (sameId(item.id, id) ? updatedItem : item));
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

// Elige un ID válido de una lista: primero preferredId, luego fallbackId, o el primero disponible
export function pickValidId(list, preferredId, fallbackId = '') {
  if (!Array.isArray(list) || list.length === 0) return '';
  if (findById(list, preferredId)) return String(preferredId);
  if (findById(list, fallbackId)) return String(fallbackId);
  return String(list[0].id);
}

// Verifica si alguno de los textos de un elemento coincide con lo escrito en el buscador
export function matchesSearch(fields, search) {
  if (!search || !search.trim()) return true;
  const textoBuscado = search.trim().toLowerCase();
  return fields.some((field) =>
    String(field || '').toLowerCase().includes(textoBuscado)
  );
}

// Calcula la oferta mínima recomendada para una subasta (RN01: precio actual + incremento mínimo)
export function getSuggestedBidAmount(auction) {
  if (!auction) return '';
  const minimo = Number(auction.currentPrice) + Number(auction.minIncrement);
  return String(minimo);
}

// Calcula el tope máximo permitido para una puja (10 veces el precio inicial)
export function getMaxBidAmount(auction) {
  if (!auction) return undefined;
  const precioInicial = Number(auction.basePrice || auction.currentPrice);
  return precioInicial * 10;
}

// Valida los datos de una nueva puja antes de mostrar el modal de confirmación
export function validateBidInput({
  auction,
  amount,
  commitmentAccepted,
  checkMax = true,
}) {
  if (!auction) return 'Debes seleccionar una subasta activa.';

  const montoNumerico = Number(amount);
  if (!amount || Number.isNaN(montoNumerico) || montoNumerico <= 0) {
    return 'Por favor ingresa un monto numérico válido para ofertar.';
  }

  const minimoPermitido =
    Number(auction.currentPrice) + Number(auction.minIncrement);
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

