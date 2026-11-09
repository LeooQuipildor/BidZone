import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import { Card, Button, Badge } from '../design-system/ui';
import { formatCurrency, getRemainingTime } from '../utils/formatters';
import {
  Gavel,
  ShieldCheck,
  PhoneCall,
  Clock,
  ArrowRight,
} from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const auctions = useAuctionStore((s) => s.auctions);
  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const activeAuctions = auctions
    .filter((a) => a.status === 'activa')
    .slice(0, 3);

  return (
    <div className="space-y-14">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#224F10]/60 via-[#141A12] to-[#0D0D0D] border border-[#B0E454]/30 p-8 sm:p-12 shadow-2xl">
        <div className="max-w-3xl space-y-6">
          <Badge variant="lime" className="px-3 py-1 text-xs">
            SUBASTAS TRANSPARENTES EN TIEMPO REAL
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-[#EAFFD0] tracking-tight leading-tight">
            Oferta en vivo, adjudica al instante y{' '}
            <span className="text-[#B0E454]">coordina directo</span> con el dueño.
          </h1>
          <p className="text-base sm:text-lg text-[#EAFFD0]/75 leading-relaxed">
            En <strong className="text-[#EAFFD0]">BidZone</strong> participas en pujas auditables con cierre automático por tiempo. Al finalizar la subasta, liberamos los datos de contacto entre el ganador y el vendedor para que coordinen el pago y la entrega sin comisiones ocultas, respaldados por nuestro sistema de reputación e infracciones.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button size="lg" onClick={() => navigate('/auctions')}>
              <Gavel className="w-5 h-5" />
              Explorar Catálogo de Subastas
            </Button>
            {currentUser ? (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/dashboard')}
              >
                Ir a mi Panel Principal
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión / Demo
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Pilares del Sistema */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="space-y-3 border-[#224F10]">
          <div className="w-11 h-11 rounded-xl bg-[#224F10] text-[#B0E454] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#EAFFD0]">
            1. Pujas en Vivo e Imparciales
          </h3>
          <p className="text-sm text-[#EAFFD0]/70 leading-relaxed">
            Cada artículo tiene un precio base, un incremento mínimo obligatorio y un temporizador de cierre estricto que adjudica al mejor postor.
          </p>
        </Card>

        <Card className="space-y-3 border-[#224F10]">
          <div className="w-11 h-11 rounded-xl bg-[#224F10] text-[#B0E454] flex items-center justify-center">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#EAFFD0]">
            2. Liberación de Contacto Directo
          </h3>
          <p className="text-sm text-[#EAFFD0]/70 leading-relaxed">
            Una vez cerrada la subasta con ganador, se habilitan mutuamente el teléfono, WhatsApp y correo del vendedor y comprador para coordinar pago y retiro.
          </p>
        </Card>

        <Card className="space-y-3 border-[#224F10]">
          <div className="w-11 h-11 rounded-xl bg-[#224F10] text-[#B0E454] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#EAFFD0]">
            3. Reputación y Régimen de Sanciones
          </h3>
          <p className="text-sm text-[#EAFFD0]/70 leading-relaxed">
            Si alguna de las partes incumple lo pactado, se informa mediante el Centro de Reportes para aplicar infracciones o el cierre definitivo de la cuenta.
          </p>
        </Card>
      </section>

      {/* Subastas Destacadas */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#EAFFD0]">
              Subastas Activas Destacadas
            </h2>
            <p className="text-sm text-[#EAFFD0]/65">
              Artículos recibiendo ofertas en este momento
            </p>
          </div>
          <Link to="/auctions">
            <Button variant="secondary" size="sm">
              Ver todas ({auctions.length})
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeAuctions.map((auction) => {
            const remaining = getRemainingTime(auction.endTime);
            return (
              <Card
                key={auction.id}
                className="flex flex-col justify-between p-0 overflow-hidden hover:border-[#B0E454]/60 transition-colors"
              >
                <div>
                  <div className="relative h-48 bg-[#0D0D0D]">
                    <img
                      src={auction.imageUrl}
                      alt={auction.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="lime">{auction.category}</Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-[#0D0D0D]/90 border border-[#B0E454]/40 px-2.5 py-1 rounded-lg text-xs font-mono text-[#B0E454]">
                      ⏱ {remaining.formatted}
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-base text-[#EAFFD0] line-clamp-1">
                      {auction.title}
                    </h3>
                    <p className="text-xs text-[#EAFFD0]/65 line-clamp-2">
                      {auction.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-[#224F10]/50 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase text-[#EAFFD0]/55 block">
                      Oferta actual
                    </span>
                    <span className="text-lg font-extrabold text-[#B0E454]">
                      {formatCurrency(auction.currentPrice)}
                    </span>
                  </div>
                  <Link to={`/auctions/${auction.id}`}>
                    <Button size="sm">
                      <Gavel className="w-3.5 h-3.5" />
                      Pujar ahora
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Home;
