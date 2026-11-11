import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../core/utils/formatters';
import { Badge, Button } from '../../core/design-system/ui';
import { AlertOctagon, Lock, Mail, MapPin, Phone, ShieldCheck, Star } from 'lucide-react';

// Columna con datos de contacto liberados (RN05)
function ParticipantContactBox({ title, person, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#B0E454]">{title}</span>
      <p className="font-serif-display text-2xl text-[#EAFFD0]">{person?.name}</p>
      <p className="flex items-center gap-2 text-[#EAFFD0]">
        <Phone className="w-3.5 h-3.5 text-[#B0E454]" />
        {person?.phone || 'Sin teléfono'}
      </p>
      <p className="flex items-center gap-2 text-[#EAFFD0]">
        <Mail className="w-3.5 h-3.5 text-[#B0E454]" />
        {person?.email || 'Sin correo'}
      </p>
      <p className="flex items-center gap-2 text-[#EAFFD0]">
        <MapPin className="w-3.5 h-3.5 text-[#B0E454]" />
        {person?.city || 'Argentina'}
      </p>
    </div>
  );
}

// Tarjeta mostrada cuando la subasta finalizó: libera contactos solo a partes autorizadas (RN05)
export function AuctionContactPanel({ auction, seller, winner, canSeeUnlockedContact, isSeller }) {
  if (auction.status !== 'finalizada') return null;

  const counterpartUserId = isSeller ? winner?.id : seller?.id;

  return (
    <div className="rounded-3xl bg-[#0D0D0D] text-[#EAFFD0] p-6 sm:p-8 shadow-lg space-y-5">
      <div className="flex items-center justify-between border-b border-[#EAFFD0]/15 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#B0E454]" />
          <h2 className="font-serif-display text-2xl sm:text-3xl text-[#EAFFD0]">
            Coordinación directa liberada (RN05 / RN06)
          </h2>
        </div>
        <Badge variant="lime">{winner ? 'Adjudicada' : 'Cerrada'}</Badge>
      </div>

      {!winner ? (
        <p className="text-sm text-[#EAFFD0]/80">Esta subasta finalizó sin recibir ofertas.</p>
      ) : canSeeUnlockedContact ? (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-[#EAFFD0]/85 leading-relaxed">
            ¡Felicitaciones! Como parte involucrada en la adjudicación,{' '}
            <strong className="text-[#B0E454]">BidZone ha liberado los datos de contacto oficiales</strong>{' '}
            para coordinar el pago y la entrega por tu cuenta. Ante cualquier incumplimiento puedes
            radicar un reporte para sancionar o cerrar la cuenta infractora.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#224F10]/35 p-5 rounded-2xl border border-[#B0E454]/30 text-xs">
            <ParticipantContactBox title="Datos del Dueño del Artículo" person={seller} />
            <ParticipantContactBox
              title="Datos del Postor Ganador"
              person={winner}
              className="border-t sm:border-t-0 sm:border-l border-[#EAFFD0]/20 pt-3 sm:pt-0 sm:pl-4"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link to={`/reviews/new?auctionId=${auction.id}`}>
              <Button size="sm">
                <Star className="w-4 h-4" />
                Calificar Operación (1 a 5 ★)
              </Button>
            </Link>
            <Link
              to={`/reports/new?auctionId=${auction.id}${counterpartUserId ? `&reportedUserId=${counterpartUserId}` : ''}`}
            >
              <Button variant="secondary" size="sm">
                <AlertOctagon className="w-4 h-4" />
                Informar Incumplimiento / Denunciar
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-[#224F10]/30 p-4 rounded-2xl border border-[#B0E454]/30 text-xs text-[#EAFFD0]">
          <Lock className="w-5 h-5 text-[#B0E454] shrink-0" />
          <div>
            Subasta adjudicada a <strong className="text-[#B0E454]">{winner.name}</strong> por{' '}
            <strong className="text-[#B0E454]">{formatCurrency(auction.currentPrice)}</strong>. Por
            privacidad (RN05), los teléfonos y correos solo son visibles para el vendedor y el ganador.
          </div>
        </div>
      )}
    </div>
  );
}

