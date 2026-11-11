import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { HomeHero } from './HomeHero';
import { HomeCatalogSection } from './HomeCatalogSection';
import { HomeModulesSection } from './HomeModulesSection';
import { ArrowUpRight, Gavel, PhoneCall, Star, AlertTriangle } from 'lucide-react';

const HOME_CATEGORIES = ['Todas', 'Tecnología', 'Gaming', 'Hogar y Oficina', 'Fotografía'];

const SECURITY_CARDS = [
  {
    title: 'Ofertas en vivo auditables',
    text: 'Cada puja supera el monto actual respetando el incremento mínimo configurado por el dueño (RN01).',
    icon: Gavel,
    highlight: true,
  },
  {
    title: 'Liberación de datos al ganar',
    text: 'Cuando cierra la subasta se desbloquean teléfono, WhatsApp y correo del vendedor y del ganador (RN05).',
    icon: PhoneCall,
  },
  {
    title: 'Infracción o cierre de cuenta',
    text: 'Si alguna parte incumple el pago o entrega, se reporta en la página y se aplica sanción o cierre (RN06).',
    icon: AlertTriangle,
  },
  {
    title: 'Reputación de 1 a 5 estrellas',
    text: 'Calificaciones mutuas verificadas tras cada operación para construir confianza en la comunidad (RN07).',
    icon: Star,
  },
];

export function Home() {
  const navigate = useNavigate();
  const auctions = useAuctionStore((s) => s.auctions);
  const auctionsError = useAuctionStore((s) => s.error);
  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);
  const setFilters = useAuctionStore((s) => s.setFilters);

  const [selectedCategory, setSelectedCategory] = useState('Todas');

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  function handleHeroSearch(filters) {
    setFilters(filters);
    navigate('/auctions');
  }

  return (
    <div className="w-full">
      <HomeHero categories={HOME_CATEGORIES} onSearch={handleHeroSearch} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-16 py-12 sm:py-16">
        {/* Tarjetas explicativas sobre seguridad y reglas */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-6 space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#224F10]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#224F10]" />
                <span>SOBRE LA PLATAFORMA</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0D0D0D] leading-tight">
                Tu seguridad en cada puja empieza aquí
              </h2>
            </div>

            <div className="lg:col-span-6 space-y-3">
              <p className="text-xs sm:text-sm text-[#0D0D0D]/70 leading-relaxed">
                BidZone elimina comisiones ocultas, billeteras complejas y retenciones bancarias. Al finalizar una
                subasta con ganador, se liberan automáticamente los datos de contacto de ambas partes.
              </p>
              <Link
                to="/reports"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#0D0D0D] hover:text-[#224F10]"
              >
                <span>Conoce nuestro reglamento y sanciones</span>
                <span className="w-6 h-6 rounded-full bg-white border border-[#224F10]/20 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#224F10]" />
                </span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SECURITY_CARDS.map((card) => {
              const Icon = card.icon;
              const boxClass = card.highlight
                ? 'bg-[#224F10] text-[#EAFFD0] shadow-sm'
                : 'bg-white/80 border border-[#224F10]/12';
              const iconClass = card.highlight
                ? 'bg-[#EAFFD0] text-[#224F10]'
                : 'bg-[#B0E454]/40 text-[#224F10]';
              const textClass = card.highlight ? 'text-[#EAFFD0]/75' : 'text-[#0D0D0D]/65';

              return (
                <div
                  key={card.title}
                  className={`rounded-3xl p-6 flex flex-col justify-between min-h-[210px] ${boxClass}`}
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center ${iconClass}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="space-y-1.5 pt-8">
                    <h3 className="text-base font-semibold">{card.title}</h3>
                    <p className={`text-xs leading-relaxed ${textClass}`}>{card.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <HomeCatalogSection
          categories={HOME_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          auctions={auctions}
          auctionsError={auctionsError}
        />

        <HomeModulesSection />
      </div>
    </div>
  );
}

export default Home;
