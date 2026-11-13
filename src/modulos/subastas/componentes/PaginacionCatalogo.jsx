/**
 * ==============================================================================
 * ARCHIVO: src/modulos/subastas/componentes/PaginacionCatalogo.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de barra de paginación reutilizable para navegar por colecciones de elementos
 * divididas en páginas (como el catálogo de subastas o listas de reportes en el panel).
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Si no hay elementos (`totalElementos === 0`), no renderiza nada (`return null`).
 * 2. Calcula e imprime el rango de elementos visibles (ej: "Mostrando 1–8 de 25 subastas").
 * 3. Si hay más de una página, muestra botones para ir a la página anterior, posterior y
 *    botones numéricos individuales para cada página disponible.
 * 4. Aplica estilos visuales destacados a la página activa.
 * 5. Notifica al componente padre invocando `alCambiarPagina(nuevoNumero)` al hacer clic.
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * - `paginaActual`: Número de página activa (ej: 1, 2, 3...).
 * - `totalPaginas`: Cantidad total de páginas calculadas con `Math.ceil(total / porPagina)`.
 * - `totalElementos`: Conteo total de ítems en la colección.
 * - `elementosPorPagina`: Cantidad de ítems configurados por página.
 * - `etiquetaElemento`: Nombre de los elementos en plural (por defecto 'subastas').
 * - `alCambiarPagina`: Función manejadora que actualiza el estado de la página en el componente padre.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Generación de rangos numéricos con `Array.from`:
 *   `Array.from({ length: totalPaginas }, (_, i) => i + 1)` crea un arreglo `[1, 2, 3, ...]`
 *   sin necesidad de escribir un bucle imperativo `for`.
 * - Límites matemáticos con `Math.min`:
 *   `Math.min(paginaActual * elementosPorPagina, totalElementos)` garantiza que en la última página
 *   nunca se muestre un número superior al total real de elementos existentes.
 * - Accesibilidad Web (a11y):
 *   Usa atributos estándar `aria-label="Paginación de subastas"` y `aria-current="page"` para que
 *   los lectores de pantalla indiquen al usuario en qué página se encuentra.
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function PaginacionCatalogo({
  paginaActual,
  totalPaginas,
  totalElementos,
  elementosPorPagina,
  etiquetaElemento = 'subastas',
  alCambiarPagina,
}) {
  // Retorno temprano si no hay registros para mostrar
  if (totalElementos === 0) return null;

  // Cálculo del rango inferior y superior visible
  const desde = (paginaActual - 1) * elementosPorPagina + 1;
  const hasta = Math.min(paginaActual * elementosPorPagina, totalElementos);

  // Arreglo dinámico con los números de página [1, 2, 3...]
  const paginas = Array.from({ length: totalPaginas }, (_, indice) => indice + 1);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#224F10]/12">
      {/* Texto informativo de elementos mostrados */}
      <p className="text-xs text-[#0D0D0D]/65 font-medium">
        Mostrando <span className="font-semibold text-[#0D0D0D]">{desde}–{hasta}</span> de{' '}
        <span className="font-semibold text-[#0D0D0D]">{totalElementos}</span> {etiquetaElemento}
      </p>

      {/* Controles de navegación interactivos (solo si hay más de 1 página) */}
      {totalPaginas > 1 && (
        <nav aria-label="Paginación de subastas" className="flex flex-wrap items-center gap-1.5">
          {/* Botón Página Anterior */}
          <button
            type="button"
            disabled={paginaActual <= 1}
            onClick={() => alCambiarPagina(paginaActual - 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#224F10]/15 bg-white text-[#0D0D0D] hover:bg-[#EAFFD0] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Anterior
          </button>

          {/* Botones numéricos individuales */}
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

          {/* Botón Página Siguiente */}
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
