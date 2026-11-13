// ============================================================================
// ARCHIVO: src/modulos/subastas/utilidades/filtrosSubasta.js
// RESPONSABILIDAD: Lógica de filtrado, ordenamiento y preparación de datos de subastas.
// ============================================================================
//
// ¿POR QUÉ EXISTE ESTE ARCHIVO?
// En lugar de sobrecargar componentes visuales como 'VistaListaSubastas' o
// 'VistaDetalleSubasta' con decenas de líneas de cálculos y filtros:
// 1. Extrae el algoritmo de búsqueda combinada (texto + categoría + estado + orden).
// 2. Prepara la estructura de datos completa que necesita la vista de detalle
//    (historial de pujas ordenado de mayor a menor, vendedor, ganador y permisos de contacto RN05).
// 3. Facilita que tanto el Catálogo público como el Panel de Control reutilicen
//    exactamente el mismo criterio de filtrado sin duplicar código.
// ============================================================================

import {
  buscarPorId,
  coincideConBusqueda,
  mismoId,
} from '../../nucleo/utilidades/ayudas';

/**
 * Función interna que determina si una subasta coincide con el filtro de estado seleccionado.
 * 
 * CRITERIOS DE ESTADO:
 * - 'todas': Incluye cualquier subasta que no haya sido cancelada administrativamente.
 * - 'finalizada': Solo las que ya cerraron.
 * - 'activa': Debe tener status 'activa' y su fecha de fin debe ser estrictamente futura (> ahoraMs).
 * - 'terminaHoy': Subasta activa cuyo fin ocurre antes de la medianoche de hoy.
 * - 'terminaManana': Subasta activa cuyo fin ocurre entre mañana y pasado mañana.
 * 
 * @param {object} subasta - Registro de la subasta.
 * @param {string} estadoFiltro - 'todas', 'activa', 'terminaHoy', 'terminaManana', 'finalizada'.
 * @param {number} ahoraMs - Hora actual en milisegundos para comparar el cierre en tiempo real.
 * @returns {boolean} - 'true' si califica para mostrarse.
 */
function coincideEstadoSubasta(subasta, estadoFiltro, ahoraMs) {
  if (estadoFiltro === 'todas') return subasta.status !== 'cancelada';
  if (estadoFiltro === 'finalizada') return subasta.status === 'finalizada';

  const fechaFinMs = new Date(subasta.endTime).getTime();
  const estaActiva =
    subasta.status === 'activa' && !Number.isNaN(fechaFinMs) && fechaFinMs > ahoraMs;
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

/**
 * Filtra y ordena el listado de subastas en memoria.
 * 
 * CONCEPTOS JAVASCRIPT:
 * - 'Array.prototype.filter': Recorre cada subasta y conserva solo aquellas donde el callback
 *   retorna 'true'.
 * - 'Array.prototype.sort': Ordena los elementos comparando pares (A y B).
 *   - Si retorna un número negativo: A va antes que B.
 *   - Si retorna un número positivo: B va antes que A.
 * 
 * @param {Array} subastas - Array original de subastas.
 * @param {string} textoBusqueda - Texto a buscar en título, descripción o categoría.
 * @param {string} categoria - Categoría seleccionada o 'Todas'.
 * @param {string} estadoFiltro - 'activa', 'terminaHoy', etc.
 * @param {string} ordenarPor - 'menorPrecio', 'mayorPrecio' o 'proximasACerrar'.
 * @param {number} ahoraMs - Marca de tiempo actual (Date.now()).
 * @returns {Array} - Nuevo array filtrado y ordenado.
 */
export function filtrarYOrdenarSubastas(
  subastas,
  textoBusqueda,
  categoria,
  estadoFiltro,
  ordenarPor,
  ahoraMs = Date.now()
) {
  // 1. Filtrado multidimensional
  const filtradas = subastas.filter((subasta) => {
    const coincideTexto = coincideConBusqueda(
      [subasta.title, subasta.description, subasta.category],
      textoBusqueda
    );
    const coincideCategoria = categoria === 'Todas' || subasta.category === categoria;
    const coincideEstado = coincideEstadoSubasta(subasta, estadoFiltro, ahoraMs);
    return coincideTexto && coincideCategoria && coincideEstado;
  });

  // 2. Ordenamiento según el criterio elegido
  return filtradas.sort((subastaA, subastaB) => {
    if (ordenarPor === 'menorPrecio') {
      return Number(subastaA.currentPrice) - Number(subastaB.currentPrice);
    }
    if (ordenarPor === 'mayorPrecio') {
      return Number(subastaB.currentPrice) - Number(subastaA.currentPrice);
    }
    // Por defecto: próximas a cerrar (las de menor fecha de fin van primero)
    return new Date(subastaA.endTime).getTime() - new Date(subastaB.endTime).getTime();
  });
}

/**
 * Prepara y normaliza los datos requeridos por la vista de detalle de subasta ('VistaDetalleSubasta').
 * 
 * ¿QUÉ RESUELVE?
 * Cuando un usuario visita '/subastas/:id', la información puede provenir de dos lugares:
 * 1. Del listado general de subastas previamente cargado en memoria.
 * 2. De la respuesta detallada del endpoint '/api/auctions/:id' (que incluye datos del vendedor y pujas).
 * Esta función combina ambas fuentes, ordena las ofertas de mayor a menor y calcula si se
 * deben desbloquear los datos de contacto directo (WhatsApp, teléfono, correo) según la regla RN05.
 * 
 * REGLA DE NEGOCIO RN05:
 * El contacto se desbloquea únicamente si la subasta finalizó y el usuario conectado
 * es el vendedor, el ganador legítimo o un administrador.
 * 
 * @returns {{
 *   pujasSubasta: Array,
 *   vendedor: object,
 *   ganador: object|null,
 *   esVendedor: boolean,
 *   esAdmin: boolean,
 *   puedeVerContactoDesbloqueado: boolean
 * }}
 */
export function prepararDatosDetalleSubasta({
  subasta,
  detalleEncontrado,
  pujas,
  usuarios,
  usuarioActual,
}) {
  // 1. Obtenemos las pujas de la subasta (priorizando las del detalle devuelto por la API)
  const pujasBase = Array.isArray(detalleEncontrado?.bids)
    ? detalleEncontrado.bids
    : pujas.filter((puja) => mismoId(puja.auctionId, subasta.id));

  // 2. Ordenamos las pujas de forma descendente (la mayor oferta queda en la posición 0)
  const pujasSubasta = [...pujasBase].sort(
    (pujaA, pujaB) => Number(pujaB.amount) - Number(pujaA.amount)
  );

  // 3. Identificamos los datos del vendedor
  const vendedor = detalleEncontrado?.seller ||
    buscarPorId(usuarios, subasta.sellerId) || {
      id: subasta.sellerId,
      name: subasta.sellerName || 'Vendedor',
      reputation: subasta.sellerReputation || 5.0,
    };

  // 4. Identificamos al ganador (si la subasta ya concluyó y fue adjudicada)
  let ganador = detalleEncontrado?.winner || null;
  if (!ganador && subasta.winnerId) {
    ganador = buscarPorId(usuarios, subasta.winnerId) || {
      id: subasta.winnerId,
      name: subasta.winnerName || 'Ganador',
    };
  }

  // 5. Calculamos roles de autorización del usuario actual
  const esVendedor = Boolean(usuarioActual && mismoId(usuarioActual.id, subasta.sellerId));
  const esAdmin = usuarioActual?.role === 'admin';
  const esGanador = Boolean(usuarioActual && ganador && mismoId(usuarioActual.id, ganador.id));

  // 6. Aplicamos la regla RN05 de liberación condicional de contacto
  const puedeVerContactoDesbloqueado = detalleEncontrado
    ? Boolean(detalleEncontrado.contactUnlocked)
    : Boolean(subasta.status === 'finalizada' && ganador && (esVendedor || esAdmin || esGanador));

  return {
    pujasSubasta,
    vendedor,
    ganador,
    esVendedor,
    esAdmin,
    puedeVerContactoDesbloqueado,
  };
}

