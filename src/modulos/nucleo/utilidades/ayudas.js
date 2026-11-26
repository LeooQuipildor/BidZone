import { useEffect, useState } from 'react';
import { formatearMoneda } from './formatos';

export function useRelojSegundo(activo = true) {
  // Inicializamos el estado con la marca de tiempo actual
  const [ahoraMs, setAhoraMs] = useState(() => Date.now());

  useEffect(() => {
    // Si no está activo (por ejemplo, si la subasta ya finalizó), no creamos intervalo
    if (!activo) return undefined;

    // Creamos el intervalo que actualiza el estado cada 1000 milisegundos
    const intervalo = setInterval(() => setAhoraMs(Date.now()), 1000);

    // FUNCIÓN DE LIMPIEZA (Cleanup): React la ejecuta al desmontar el componente
    return () => clearInterval(intervalo);
  }, [activo]);

  return ahoraMs;
}

export function mismoId(idA, idB) {
  if (idA === null || idA === undefined || idA === '') return false;
  if (idB === null || idB === undefined || idB === '') return false;
  return Number(idA) === Number(idB);
}

export function buscarPorId(lista, id) {
  if (!Array.isArray(lista)) return null;
  return lista.find((elemento) => mismoId(elemento.id, id)) || null;
}

export function reemplazarPorId(lista, id, elementoNuevo) {
  return lista.map((elemento) => (mismoId(elemento.id, id) ? elementoNuevo : elemento));
}

export function eliminarPorId(lista, id) {
  return lista.filter((elemento) => !mismoId(elemento.id, id));
}

export function agregarOActualizarPorId(lista, elemento) {
  if (buscarPorId(lista, elemento.id)) {
    return reemplazarPorId(lista, elemento.id, elemento);
  }
  return [elemento, ...lista];
}

export function elegirIdValido(lista, idPreferido, idAlternativo = '') {
  if (!Array.isArray(lista) || lista.length === 0) return '';
  if (buscarPorId(lista, idPreferido)) return String(idPreferido);
  if (buscarPorId(lista, idAlternativo)) return String(idAlternativo);
  return String(lista[0].id);
}

export function coincideConBusqueda(campos, textoBuscado) {
  if (!textoBuscado || !textoBuscado.trim()) return true;
  const filtro = textoBuscado.trim().toLowerCase();
  return campos.some((campo) => String(campo || '').toLowerCase().includes(filtro));
}

export function obtenerMontoPujaSugerido(subasta) {
  if (!subasta) return '';
  const minimo = Number(subasta.precioActual) + Number(subasta.incrementoMinimo);
  return String(minimo);
}

export function obtenerMontoPujaMaximo(subasta) {
  if (!subasta) return undefined;
  const precioInicial = Number(subasta.precioBase || subasta.precioActual);
  return precioInicial * 10;
}

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

  const minimoPermitido = Number(subasta.precioActual) + Number(subasta.incrementoMinimo);
  if (montoNumerico < minimoPermitido) {
    return `La oferta debe ser de al menos ${formatearMoneda(minimoPermitido)} (Precio actual + incremento mínimo).`;
  }

  if (validarMaximo) {
    const maximoPermitido = obtenerMontoPujaMaximo(subasta);
    if (maximoPermitido && montoNumerico > maximoPermitido) {
      return `La oferta no puede superar 10 veces el precio inicial de la subasta (${formatearMoneda(maximoPermitido)}).`;
    }
  }

  if (!compromisoAceptado) {
    return 'Debes aceptar el compromiso vinculante antes de enviar tu oferta.';
  }

  return '';
}

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

