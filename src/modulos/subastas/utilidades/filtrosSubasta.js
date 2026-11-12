import {
  buscarPorId,
  coincideConBusqueda,
  mismoId,
} from '../../nucleo/utilidades/ayudas';

// Verifica si una subasta cumple con el filtro de estado o ventana de cierre
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

// Filtra por texto, categoría y estado, y luego ordena las subastas según el criterio elegido
export function filtrarYOrdenarSubastas(
  subastas,
  textoBusqueda,
  categoria,
  estadoFiltro,
  ordenarPor,
  ahoraMs = Date.now()
) {
  const filtradas = subastas.filter((subasta) => {
    const coincideTexto = coincideConBusqueda(
      [subasta.title, subasta.description, subasta.category],
      textoBusqueda
    );
    const coincideCategoria = categoria === 'Todas' || subasta.category === categoria;
    const coincideEstado = coincideEstadoSubasta(subasta, estadoFiltro, ahoraMs);
    return coincideTexto && coincideCategoria && coincideEstado;
  });

  return filtradas.sort((subastaA, subastaB) => {
    if (ordenarPor === 'menorPrecio') {
      return Number(subastaA.currentPrice) - Number(subastaB.currentPrice);
    }
    if (ordenarPor === 'mayorPrecio') {
      return Number(subastaB.currentPrice) - Number(subastaA.currentPrice);
    }
    return new Date(subastaA.endTime).getTime() - new Date(subastaB.endTime).getTime();
  });
}

// Reúne pujas ordenadas, vendedor, ganador y permisos de contacto para VistaDetalleSubasta
export function prepararDatosDetalleSubasta({
  subasta,
  detalleEncontrado,
  pujas,
  usuarios,
  usuarioActual,
}) {
  const pujasBase = Array.isArray(detalleEncontrado?.bids)
    ? detalleEncontrado.bids
    : pujas.filter((puja) => mismoId(puja.auctionId, subasta.id));

  const pujasSubasta = [...pujasBase].sort(
    (pujaA, pujaB) => Number(pujaB.amount) - Number(pujaA.amount)
  );

  const vendedor = detalleEncontrado?.seller ||
    buscarPorId(usuarios, subasta.sellerId) || {
      id: subasta.sellerId,
      name: subasta.sellerName || 'Vendedor',
      reputation: subasta.sellerReputation || 5.0,
    };

  let ganador = detalleEncontrado?.winner || null;
  if (!ganador && subasta.winnerId) {
    ganador = buscarPorId(usuarios, subasta.winnerId) || {
      id: subasta.winnerId,
      name: subasta.winnerName || 'Ganador',
    };
  }

  const esVendedor = Boolean(usuarioActual && mismoId(usuarioActual.id, subasta.sellerId));
  const esAdmin = usuarioActual?.role === 'admin';
  const esGanador = Boolean(usuarioActual && ganador && mismoId(usuarioActual.id, ganador.id));

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

