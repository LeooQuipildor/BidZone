import React from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Star, Trash2 } from 'lucide-react';
import { formatearFechaHora } from '../../utilidades/formatos';

const ESTRELLAS = [1, 2, 3, 4, 5];

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
                  numeroEstrella <= Number(resena.puntaje)
                    ? 'text-[#224F10] fill-[#B0E454]'
                    : 'text-[#0D0D0D]/15'
                }`}
              />
            ))}
            <span className="ml-1.5 text-xs font-bold text-[#224F10]">{resena.puntaje}.0</span>
          </div>

          {/* Insignia que describe la dirección de la interacción */}
          <span className="px-2.5 py-0.5 rounded-full bg-[#EAFFD0] text-[#224F10] border border-[#224F10]/15 text-[10px] font-bold">
            {resena.contextoRol === 'comprador_a_vendedor'
              ? 'Comprador → Vendedor'
              : 'Vendedor → Comprador'}
          </span>
        </div>

        {/* Comentario y opinión textual dejada por el usuario */}
        <p className="text-sm font-medium text-[#0D0D0D] leading-relaxed">
          &ldquo;{resena.comentario}&rdquo;
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
              to={`/subastas/${resena.subastaId}`}
              className="font-semibold text-[#224F10] hover:underline"
            >
              {tituloSubasta}
            </Link>
          </p>
        </div>
      </div>

      {/* Pie de la tarjeta: Fecha de emisión y botones de acción (si es autor) */}
      <div className="flex items-center justify-between pt-3 border-t border-[#224F10]/8 text-[11px] text-[#0D0D0D]/55">
        <span>{formatearFechaHora(resena.creadoEn)}</span>

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

