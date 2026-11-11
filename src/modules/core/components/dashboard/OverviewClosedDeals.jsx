import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, sameId, findById } from '../../utils/formatters';
import { Mail, MapPin, Phone, Star, AlertOctagon } from 'lucide-react';

// Columna reutilizable para mostrar los datos de contacto liberados (RN05)
function DealContactColumn({ title, person, fallbackName, withDivider = false }) {
  const dividerClass = withDivider
    ? 'border-t sm:border-t-0 sm:border-l border-[#224F10]/10 pt-2.5 sm:pt-0 sm:pl-3'
    : '';

  return (
    <div className={`space-y-1 ${dividerClass}`}>
      <p className="font-bold text-[#224F10] uppercase tracking-wider text-[10px]">{title}</p>
      <p className="font-semibold text-[#0D0D0D]">{person?.name || fallbackName}</p>
      <p className="flex items-center gap-1.5 text-[#0D0D0D]/75">
        <Phone className="w-3 h-3 text-[#224F10]" />
        {person?.phone || 'Sin teléfono'}
      </p>
      <p className="flex items-center gap-1.5 text-[#0D0D0D]/75 truncate">
        <Mail className="w-3 h-3 text-[#224F10]" />
        {person?.email || 'Privado (RN05)'}
      </p>
      <p className="flex items-center gap-1.5 text-[#0D0D0D]/75">
        <MapPin className="w-3 h-3 text-[#224F10]" />
        {person?.city || 'Argentina'}
      </p>
    </div>
  );
}

// Etiqueta según el rol que tuvo el usuario en esa subasta cerrada
function getDealRoleLabel(deal, currentUserId) {
  if (sameId(currentUserId, deal.winnerId)) return 'Ganaste esta subasta';
  if (sameId(currentUserId, deal.sellerId)) return 'Artículo vendido';
  return 'Auditoría Admin';
}

// Sección de subastas finalizadas con liberación de datos de contacto (RN05 y RN06)
export function OverviewClosedDeals({ deals, users, currentUserId, onSelectSection }) {
  return (
    <section className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#224F10]">
            REGLA DE NEGOCIO RN05 & RN06
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-[#0D0D0D] mt-0.5">
            Coordinación directa y datos liberados al cierre
          </h2>
        </div>
        <span className="text-xs text-[#0D0D0D]/55">
          {deals.length} operaciones adjudicadas
        </span>
      </div>

      {deals.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-6 text-center text-xs text-[#0D0D0D]/60">
          No hay subastas finalizadas con adjudicación para mostrar con los filtros actuales.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {deals.map((deal) => {
            const seller = findById(users, deal.sellerId);
            const winner = findById(users, deal.winnerId);
            const isWinner = sameId(currentUserId, deal.winnerId);
            const counterpartId = isWinner ? deal.sellerId : deal.winnerId;

            return (
              <div
                key={deal.id}
                className="rounded-2xl bg-white border border-[#224F10]/12 p-5 space-y-4 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EAFFD0] text-[#224F10] border border-[#224F10]/15 text-[10px] font-bold mb-1.5">
                      {getDealRoleLabel(deal, currentUserId)}
                    </span>
                    <h3 className="text-base font-bold text-[#0D0D0D]">{deal.title}</h3>
                    <p className="text-xs text-[#0D0D0D]/60 mt-0.5">
                      Monto final:{' '}
                      <strong className="text-[#224F10]">{formatCurrency(deal.currentPrice)}</strong>
                    </p>
                  </div>

                  <Link
                    to={`/auctions/${deal.id}`}
                    className="px-3.5 py-1.5 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] text-[11px] font-semibold transition-colors shrink-0"
                  >
                    Ver lote
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F7FBF3] p-3.5 rounded-xl border border-[#224F10]/10">
                  <DealContactColumn
                    title="Dueño del Artículo"
                    person={seller}
                    fallbackName={deal.sellerName || 'Vendedor'}
                  />
                  <DealContactColumn
                    title="Ganador Adjudicado"
                    person={winner}
                    fallbackName={deal.winnerName || 'Comprador'}
                    withDivider
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onSelectSection('reviews', {
                        openCreate: true,
                        auctionId: String(deal.id),
                        targetUserId: String(counterpartId || ''),
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <Star className="w-3 h-3" />
                    Calificar Contraparte
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onSelectSection('reports', {
                        openCreate: true,
                        auctionId: String(deal.id),
                        reportedUserId: String(counterpartId || ''),
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#B0E454] hover:bg-[#EAFFD0] text-[#0D0D0D] text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <AlertOctagon className="w-3 h-3" />
                    Denunciar Incumplimiento
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

