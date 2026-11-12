import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Barra de paginación reutilizada en el Catálogo público y en el Panel de Control
export function PaginacionCatalogo({
  paginaActual,
  totalPaginas,
  totalElementos,
  elementosPorPagina,
  etiquetaElemento = 'subastas',
  alCambiarPagina,
}) {
  if (totalElementos === 0) return null;

  const desde = (paginaActual - 1) * elementosPorPagina + 1;
  const hasta = Math.min(paginaActual * elementosPorPagina, totalElementos);
  const paginas = Array.from({ length: totalPaginas }, (_, indice) => indice + 1);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#224F10]/12">
      <p className="text-xs text-[#0D0D0D]/65 font-medium">
        Mostrando <span className="font-semibold text-[#0D0D0D]">{desde}–{hasta}</span> de{' '}
        <span className="font-semibold text-[#0D0D0D]">{totalElementos}</span> {etiquetaElemento}
      </p>

      {totalPaginas > 1 && (
        <nav aria-label="Paginación de subastas" className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={paginaActual <= 1}
            onClick={() => alCambiarPagina(paginaActual - 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#224F10]/15 bg-white text-[#0D0D0D] hover:bg-[#EAFFD0] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Anterior
          </button>

          {paginas.map((numero) => {
            const estaActiva = numero === paginaActual;
            return (
              <button
                key={numero}
                type="button"
                aria-current={estaActiva ? 'page' : undefined}
                onClick={() => alCambiarPagina(numero)}
                className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  estaActiva
                    ? 'bg-[#224F10] text-[#EAFFD0]'
                    : 'bg-white border border-[#224F10]/15 text-[#0D0D0D]/75 hover:bg-[#EAFFD0] hover:text-[#0D0D0D]'
                }`}
              >
                {numero}
              </button>
            );
          })}

          <button
            type="button"
            disabled={paginaActual >= totalPaginas}
            onClick={() => alCambiarPagina(paginaActual + 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#224F10]/15 bg-white text-[#0D0D0D] hover:bg-[#EAFFD0] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            Siguiente
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </nav>
      )}
    </div>
  );
}
