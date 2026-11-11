import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuctionCard } from '../../auctions/components/AuctionCard';
import { ArrowRight, Sparkles } from 'lucide-react';

// Catálogo rápido de subastas en la página de inicio con filtro por categoría
export function HomeCatalogSection({
  categories,
  selectedCategory,
  onSelectCategory,
  auctions,
  auctionsError,
}) {
  const navigate = useNavigate();

  const filteredCatalog =
    selectedCategory === 'Todas'
      ? auctions
      : auctions.filter((a) => a.category === selectedCategory);

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

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#224F10] text-[#EAFFD0]'
                  : 'bg-white/75 text-[#0D0D0D]/75 hover:bg-white border border-[#224F10]/12'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {auctionsError && auctions.length === 0 && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-800 font-medium">
          {auctionsError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCatalog.slice(0, 7).map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}

        <div className="rounded-[28px] bg-[#224F10] text-[#EAFFD0] p-6 sm:p-7 flex flex-col justify-between min-h-[320px] shadow-sm">
          <span className="w-10 h-10 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </span>
          <div className="space-y-4 pt-6">
            <div className="space-y-1.5">
              <h3 className="text-xl font-semibold text-[#EAFFD0] leading-snug">
                {auctions.length} lotes activos y adjudicados
              </h3>
              <p className="text-xs text-[#EAFFD0]/75 leading-relaxed">
                Explora todas las categorías, filtra por precio y consulta el historial completo de ofertas en vivo.
              </p>
            </div>
            <button
              onClick={() => navigate('/auctions')}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] text-[#0D0D0D] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Ver todos los lotes</span>
              <span className="w-6 h-6 rounded-full bg-[#224F10] text-[#EAFFD0] flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

