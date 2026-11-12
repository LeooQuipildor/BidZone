import { mismoId } from '../../nucleo/utilidades/ayudas';

// Devuelve las subastas finalizadas con ganador en las que participó el usuario y aún no calificó (RN07)
export function obtenerSubastasPendientesResena(subastas, resenas, idUsuarioActual) {
  return subastas.filter((subasta) => {
    if (subasta.status !== 'finalizada' || !subasta.winnerId) return false;

    const participa =
      mismoId(subasta.winnerId, idUsuarioActual) || mismoId(subasta.sellerId, idUsuarioActual);
    const yaCalificada = resenas.some(
      (resena) =>
        mismoId(resena.auctionId, subasta.id) && mismoId(resena.reviewerId, idUsuarioActual)
    );

    return participa && !yaCalificada;
  });
}

// Calcula a qué usuario calificar y en qué rol según quién abre la reseña (RN07)
export function obtenerValoresPorDefectoResena(subasta, idUsuarioActual, otrosUsuarios) {
  const primerUsuario = otrosUsuarios[0] ? String(otrosUsuarios[0].id) : '';
  if (!subasta) {
    return { idUsuarioCalificado: primerUsuario, contextoRol: 'comprador_a_vendedor' };
  }
  if (mismoId(subasta.winnerId, idUsuarioActual)) {
    return { idUsuarioCalificado: String(subasta.sellerId), contextoRol: 'comprador_a_vendedor' };
  }
  if (mismoId(subasta.sellerId, idUsuarioActual)) {
    return { idUsuarioCalificado: String(subasta.winnerId), contextoRol: 'vendedor_a_comprador' };
  }
  return {
    idUsuarioCalificado: String(subasta.sellerId || primerUsuario),
    contextoRol: 'comprador_a_vendedor',
  };
}

