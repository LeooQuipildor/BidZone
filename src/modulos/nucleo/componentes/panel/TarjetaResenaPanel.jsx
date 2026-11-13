/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/TarjetaResenaPanel.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE COMPONENTE?
 * Es el componente de presentación de una reseña o calificación individual emitida
 * tras el cierre de una subasta, implementando la interfaz para la Regla de Negocio RN07:
 * "Calificaciones, Reseñas y Reputación Comunitaria".
 *
 * ¿POR QUÉ EXISTE Y CUÁL ES SU PROPÓSITO?
 * La reputación es el mecanismo principal de confianza en BidZone. Cuando un vendedor y un
 * ganador concluyen su trato directo (RN05), pueden evaluarse mutuamente con un puntaje
 * del 1 al 5 y un comentario explicativo.
 *
 * Esta tarjeta:
 * 1. Muestra la cantidad de estrellas otorgadas mediante iconos dinámicos rellenos.
 * 2. Muestra la dirección del rol ('Comprador → Vendedor' o 'Vendedor → Comprador').
 * 3. Muestra el comentario, el usuario evaluado, el autor y la subasta relacionada.
 * 4. Permite al autor editar o eliminar su propia calificación, recalculando
 *    inmediatamente el promedio general del usuario calificado en `tiendaAutenticacion.js`.
 *
 * ¿DE DÓNDE PROVIENEN LAS PROPS?
 * - `resena`: Objeto calificación ({ id, auctionId, reviewerId, targetUserId, rating, comment, roleContext, createdAt }).
 * - `tituloSubasta`: Título del lote asociado obtenido desde la lista de subastas.
 * - `nombreAutor`: Nombre del usuario que escribió la reseña.
 * - `nombreCalificado`: Nombre del usuario que recibió el puntaje.
 * - `puedeEditar`: Booleano (true si el usuario actual es el autor de la reseña).
 * - `alEditar`: Callback que abre el formulario para modificar el comentario o puntaje.
 * - `alEliminar`: Callback para borrar la reseña y recalcular la reputación.
 * ==============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Star, Trash2 } from 'lucide-react';
import { formatearFechaHora } from '../../utilidades/formatos';

/** Constante auxiliar: lista fija del 1 al 5 para mapear las estrellas en JSX */
const ESTRELLAS = [1, 2, 3, 4, 5];

/**
 * Componente: TarjetaResenaPanel
 * ----------------------------------------------------------------------------
 * Renderiza la tarjeta con las estrellas, contexto del rol, comentario y metadatos.
 */
export function TarjetaResenaPanel({
  resena,
  tituloSubasta,
  nombreAutor,
  nombreCalificado,
  puedeEditar,
  alEditar,
  alEliminar,
}) {
  return (
    <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between gap-4 shadow-2xs">
      <div className="space-y-3">
        {/* Fila superior: Estrellas de puntuación e Insignia de contexto de rol */}
        <div className="flex items-center justify-between gap-2">
          {/* Mapeo de las 5 estrellas: si el índice es menor o igual al rating, se pinta de color */}
          <div className="flex items-center gap-1">
            {ESTRELLAS.map((numeroEstrella) => (
              <Star
                key={numeroEstrella}
                className={`w-4 h-4 ${
                  numeroEstrella <= Number(resena.rating)
                    ? 'text-[#224F10] fill-[#B0E454]'
                    : 'text-[#0D0D0D]/15'
                }`}
              />
            ))}
            <span className="ml-1.5 text-xs font-bold text-[#224F10]">{resena.rating}.0</span>
          </div>

          {/* Insignia que describe la dirección de la interacción */}
          <span className="px-2.5 py-0.5 rounded-full bg-[#EAFFD0] text-[#224F10] border border-[#224F10]/15 text-[10px] font-bold">
            {resena.roleContext === 'comprador_a_vendedor'
              ? 'Comprador → Vendedor'
              : 'Vendedor → Comprador'}
          </span>
        </div>

        {/* Comentario y opinión textual dejada por el usuario */}
        <p className="text-sm font-medium text-[#0D0D0D] leading-relaxed">
          &ldquo;{resena.comment}&rdquo;
        </p>

        {/* Bloque informativo de contexto: Participantes y Subasta vinculada */}
        <div className="text-xs text-[#0D0D0D]/75 space-y-1 bg-[#F7FBF3] p-3.5 rounded-xl border border-[#224F10]/10">
          <p>
            Calificado: <strong className="text-[#224F10]">{nombreCalificado}</strong>
          </p>
          <p>
            Autor: <strong className="text-[#0D0D0D]">{nombreAutor}</strong>
          </p>
          <p className="truncate">
            Operación:{' '}
            <Link
              to={`/subastas/${resena.auctionId}`}
              className="font-semibold text-[#224F10] hover:underline"
            >
              {tituloSubasta}
            </Link>
          </p>
        </div>
      </div>

      {/* Pie de la tarjeta: Fecha de emisión y botones de acción (si es autor) */}
      <div className="flex items-center justify-between pt-3 border-t border-[#224F10]/8 text-[11px] text-[#0D0D0D]/55">
        <span>{formatearFechaHora(resena.createdAt)}</span>

        {/* Botones de edición y borrado: solo visibles si `puedeEditar` es true */}
        {puedeEditar && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={alEditar}
              title="Editar calificación"
              className="w-7 h-7 rounded-full border border-[#224F10]/15 hover:bg-[#EAFFD0] text-[#0D0D0D]/75 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={alEliminar}
              title="Eliminar calificación"
              className="w-7 h-7 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

