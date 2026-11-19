import { mismoId } from '../../nucleo/utilidades/ayudas';

export function obtenerSubastasPendientesResena(subastas, resenas, idUsuarioActual) {
  return subastas.filter((subasta) => {
    // 1. Debe haber terminado y tener ganador asignado
    if (subasta.estado !== 'finalizada' || !subasta.ganadorId) return false;

    // 2. Comprobamos si el usuario actual es comprador o vendedor de este lote
    const participa =
      mismoId(subasta.ganadorId, idUsuarioActual) || mismoId(subasta.vendedorId, idUsuarioActual);

    // 3. Verificamos mediante 'Array.prototype.some' si ya dejó una reseña previa
    const yaCalificada = resenas.some(
      (resena) =>
        mismoId(resena.subastaId, subasta.id) && mismoId(resena.autorId, idUsuarioActual)
    );

    // Solo es elegible si participó y aún no calificó
    return participa && !yaCalificada;
  });
}

export function obtenerValoresPorDefectoResena(subasta, idUsuarioActual, otrosUsuarios) {
  const primerUsuario = otrosUsuarios[0] ? String(otrosUsuarios[0].id) : '';
  if (!subasta) {
    return { idUsuarioCalificado: primerUsuario, contextoRol: 'comprador_a_vendedor' };
  }
  if (mismoId(subasta.ganadorId, idUsuarioActual)) {
    return { idUsuarioCalificado: String(subasta.vendedorId), contextoRol: 'comprador_a_vendedor' };
  }
  if (mismoId(subasta.vendedorId, idUsuarioActual)) {
    return { idUsuarioCalificado: String(subasta.ganadorId), contextoRol: 'vendedor_a_comprador' };
  }
  return {
    idUsuarioCalificado: String(subasta.vendedorId || primerUsuario),
    contextoRol: 'comprador_a_vendedor',
  };
}

