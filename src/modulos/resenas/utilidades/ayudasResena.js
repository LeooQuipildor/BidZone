// ============================================================================
// ARCHIVO: src/modulos/resenas/utilidades/ayudasResena.js
// RESPONSABILIDAD: Lógica de negocio y cálculo de contrapartes para reseñas (RN07).
// ============================================================================
//
// ¿POR QUÉ EXISTE ESTE ARCHIVO?
// La regla de negocio RN07 establece que las calificaciones mutuas de 1 a 5 estrellas
// no pueden emitirse libremente entre cualquier usuario arbitrario, sino ÚNICAMENTE entre
// las partes legítimas de una subasta concluida (el Vendedor y el Ganador adjudicado).
// Este archivo concentra las validaciones de elegibilidad y la deducción automática
// de a quién se debe calificar cuando el usuario pulsa "Calificar operación".
// ============================================================================

import { mismoId } from '../../nucleo/utilidades/ayudas';

/**
 * Devuelve la lista de subastas finalizadas en las que participó el usuario y donde
 * todavía tiene pendiente emitir su reseña sobre la contraparte (RN07).
 * 
 * CONDICIONES DE ELEGIBILIDAD:
 * 1. La subasta debe estar 'finalizada' y tener un 'winnerId' (ganador adjudicado).
 * 2. El usuario actual debe haber sido o bien el vendedor ('sellerId') o el ganador ('winnerId').
 * 3. El usuario actual NO debe haber emitido ya una reseña para esa misma subasta ('!yaCalificada').
 * 
 * @param {Array} subastas - Lista completa de subastas.
 * @param {Array} resenas - Lista completa de reseñas existentes en la plataforma.
 * @param {number|string} idUsuarioActual - ID del usuario con sesión activa.
 * @returns {Array} - Subastas donde el usuario puede emitir una reseña.
 */
export function obtenerSubastasPendientesResena(subastas, resenas, idUsuarioActual) {
  return subastas.filter((subasta) => {
    // 1. Debe haber terminado y tener ganador asignado
    if (subasta.status !== 'finalizada' || !subasta.winnerId) return false;

    // 2. Comprobamos si el usuario actual es comprador o vendedor de este lote
    const participa =
      mismoId(subasta.winnerId, idUsuarioActual) || mismoId(subasta.sellerId, idUsuarioActual);

    // 3. Verificamos mediante 'Array.prototype.some' si ya dejó una reseña previa
    const yaCalificada = resenas.some(
      (resena) =>
        mismoId(resena.auctionId, subasta.id) && mismoId(resena.reviewerId, idUsuarioActual)
    );

    // Solo es elegible si participó y aún no calificó
    return participa && !yaCalificada;
  });
}

/**
 * Deduce automáticamente a quién se debe calificar y en qué rol según quién abre el formulario.
 * 
 * REGLAS DE DEDUCCIÓN:
 * - Si el usuario actual es el GANADOR: la contraparte a calificar es el VENDEDOR ('comprador_a_vendedor').
 * - Si el usuario actual es el VENDEDOR: la contraparte a calificar es el GANADOR ('vendedor_a_comprador').
 * 
 * @param {object|null} subasta - Subasta seleccionada.
 * @param {number|string} idUsuarioActual - ID del usuario conectado.
 * @param {Array} otrosUsuarios - Lista de respaldo de otros usuarios.
 * @returns {{ idUsuarioCalificado: string, contextoRol: string }}
 */
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

