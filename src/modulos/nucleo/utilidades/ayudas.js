import { useEffect, useState } from 'react';
import { formatearMoneda } from './formatos';

// Reloj simple que actualiza la hora actual cada 1 segundo para los contadores en vivo
export function useRelojSegundo(activo = true) {
  const [ahoraMs, setAhoraMs] = useState(() => Date.now());

  useEffect(() => {
    if (!activo) return undefined;
    const intervalo = setInterval(() => setAhoraMs(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, [activo]);

  return ahoraMs;
}

// Compara dos IDs sin importar si uno es número (1) y el otro texto ("1")
export function mismoId(idA, idB) {
  if (idA === null || idA === undefined || idA === '') return false;
  if (idB === null || idB === undefined || idB === '') return false;
  return Number(idA) === Number(idB);
}

// Busca un elemento por su ID dentro de una lista
export function buscarPorId(lista, id) {
  if (!Array.isArray(lista)) return null;
  return lista.find((elemento) => mismoId(elemento.id, id)) || null;
}

// Reemplaza en una lista el elemento que coincide con el ID indicado
export function reemplazarPorId(lista, id, elementoNuevo) {
  return lista.map((elemento) => (mismoId(elemento.id, id) ? elementoNuevo : elemento));
}

// Quita de una lista el elemento cuyo ID coincide con el indicado
export function eliminarPorId(lista, id) {
  return lista.filter((elemento) => !mismoId(elemento.id, id));
}

// Agrega un elemento al principio de la lista o lo actualiza si ya existía
export function agregarOActualizarPorId(lista, elemento) {
  if (buscarPorId(lista, elemento.id)) {
    return reemplazarPorId(lista, elemento.id, elemento);
  }
  return [elemento, ...lista];
}

// Elige un ID válido de la lista: primero el preferido, luego el alternativo, o el primero disponible
export function elegirIdValido(lista, idPreferido, idAlternativo = '') {
  if (!Array.isArray(lista) || lista.length === 0) return '';
  if (buscarPorId(lista, idPreferido)) return String(idPreferido);
  if (buscarPorId(lista, idAlternativo)) return String(idAlternativo);
  return String(lista[0].id);
}

// Indica si algún texto de un registro coincide con lo que escribió la persona en el buscador
export function coincideConBusqueda(campos, textoBuscado) {
  if (!textoBuscado || !textoBuscado.trim()) return true;
  const filtro = textoBuscado.trim().toLowerCase();
  return campos.some((campo) => String(campo || '').toLowerCase().includes(filtro));
}

// Calcula el monto mínimo recomendado para ofertar (RN01: precio actual + incremento mínimo)
export function obtenerMontoPujaSugerido(subasta) {
  if (!subasta) return '';
  const minimo = Number(subasta.currentPrice) + Number(subasta.minIncrement);
  return String(minimo);
}

// Calcula el límite máximo permitido por puja (10 veces el precio inicial)
export function obtenerMontoPujaMaximo(subasta) {
  if (!subasta) return undefined;
  const precioInicial = Number(subasta.basePrice || subasta.currentPrice);
  return precioInicial * 10;
}

// Valida una oferta antes de abrir la ventana de confirmación
export function validarDatosPuja({
  subasta,
  monto,
  compromisoAceptado,
  validarMaximo = true,
}) {
  if (!subasta) return 'Debes seleccionar una subasta activa.';

  const montoNumerico = Number(monto);
  if (!monto || Number.isNaN(montoNumerico) || montoNumerico <= 0) {
    return 'Por favor ingresa un monto numérico válido para ofertar.';
  }

  const minimoPermitido = Number(subasta.currentPrice) + Number(subasta.minIncrement);
  if (montoNumerico < minimoPermitido) {
    return `RN01: La oferta debe ser de al menos ${formatearMoneda(minimoPermitido)} (Precio actual + incremento mínimo).`;
  }

  if (validarMaximo) {
    const maximoPermitido = obtenerMontoPujaMaximo(subasta);
    if (maximoPermitido && montoNumerico > maximoPermitido) {
      return `La oferta no puede superar 10 veces el precio inicial de la subasta (${formatearMoneda(maximoPermitido)}).`;
    }
  }

  if (!compromisoAceptado) {
    return 'Debes aceptar el compromiso vinculante (RN04) antes de enviar tu oferta.';
  }

  return '';
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

