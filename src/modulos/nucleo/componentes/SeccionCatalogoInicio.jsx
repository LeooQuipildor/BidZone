import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TarjetaSubasta } from '../../subastas/componentes/TarjetaSubasta';
import { useRelojSegundo } from '../utilidades/ayudas';
import { FiltrosBotones, TarjetaCtaCatalogo } from '../diseno/componentesBloques';

// Catálogo rápido de subastas en el inicio con filtro por categoría
export function SeccionCatalogoInicio({
  categorias,
  categoriaSeleccionada,
  alElegirCategoria,
  subastas,
  errorSubastas,
}) {
  const navegar = useNavigate();
  const ahoraMs = useRelojSegundo();

  const catalogoFiltrado =
    categoriaSeleccionada === 'Todas'
      ? subastas
      : subastas.filter((subasta) => subasta.category === categoriaSeleccionada);

  return (
    <section className="space-y-7">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#224F10]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#224F10]" />
            <span>CATÁLOGO DE SUBASTAS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0D0D0D]">
            Elige tu próximo artículo
          </h2>
        </div>

        <FiltrosBotones
          opciones={categorias}
          valorActual={categoriaSeleccionada}
          alElegir={alElegirCategoria}
          claseInactivo="bg-white/75 text-[#0D0D0D]/75 hover:bg-white border border-[#224F10]/12"
        />
      </div>

      {errorSubastas && subastas.length === 0 && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-800 font-medium">
          {errorSubastas}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {catalogoFiltrado.slice(0, 7).map((subasta) => (
          <TarjetaSubasta key={subasta.id} subasta={subasta} ahoraMs={ahoraMs} />
        ))}

        <TarjetaCtaCatalogo
          titulo={`${subastas.length} lotes activos y adjudicados`}
          descripcion="Explora todas las categorías, filtra por precio y consulta el historial completo de ofertas en vivo."
          textoBoton="Ver todos los lotes"
          alHacerClic={() => navegar('/auctions')}
        />
      </div>
    </section>
  );
}
