import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { formatCountdownFromNow, getInitials } from './dashboardHelpers';
import {
  Gavel,
  Plus,
  Mail,
  ArrowUpRight,
  Phone,
  MapPin,
  Pause,
  Play,
  ExternalLink,
  Clock,
  Tag,
  Star,
  AlertOctagon,
} from 'lucide-react';

export function DashboardOverviewTab({
  currentUser,
  users,
  auctions,
  bids,
  reports,
  searchQuery,
  nowMs,
  trackerPaused,
  onTogglePause,
  onSelectSection,
}) {
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === 'admin';

  const activeAuctions = auctions.filter((a) => a.status === 'activa');
  const awardedAuctions = auctions.filter(
    (a) => a.status === 'finalizada' && a.winnerId
  );
  const myBids = bids.filter(
    (b) => Number(b.bidderId) === Number(currentUser?.id)
  );
  const openReports = reports.filter((r) => r.status === 'en_revision');

  const closedDealsInvolved = auctions.filter(
    (a) =>
      a.status === 'finalizada' &&
      a.winnerId &&
      (Number(a.winnerId) === Number(currentUser?.id) ||
        Number(a.sellerId) === Number(currentUser?.id) ||
        isAdmin)
  );

  const nextClosingAuction = [...activeAuctions].sort(
    (a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
  )[0];

  const nextClosingCountdown = nextClosingAuction
    ? formatCountdownFromNow(nextClosingAuction.endTime, nowMs)
    : '00:00:00';

  const totalCount = Math.max(auctions.length, 1);
  const awardedPct = Math.round((awardedAuctions.length / totalCount) * 100);
  const activePct = Math.round((activeAuctions.length / totalCount) * 100);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredAuctionsList = auctions
    .filter(
      (a) =>
        !normalizedQuery ||
        a.title.toLowerCase().includes(normalizedQuery) ||
        a.category.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, 5);

  const filteredUsersList = users
    .filter(
      (u) =>
        !normalizedQuery ||
        u.name.toLowerCase().includes(normalizedQuery) ||
        u.email.toLowerCase().includes(normalizedQuery) ||
        (u.city || '').toLowerCase().includes(normalizedQuery)
    )
    .slice(0, 4);

  const filteredClosedDeals = closedDealsInvolved.filter((deal) => {
    if (!normalizedQuery) return true;
    const seller = users.find((u) => Number(u.id) === Number(deal.sellerId));
    const winner = users.find((u) => Number(u.id) === Number(deal.winnerId));
    return (
      deal.title.toLowerCase().includes(normalizedQuery) ||
      (seller?.name || '').toLowerCase().includes(normalizedQuery) ||
      (winner?.name || '').toLowerCase().includes(normalizedQuery)
    );
  });

  const weeklyActivity = [
    { day: 'D', count: 2, heightPct: 58, type: 'hatched' },
    { day: 'L', count: 5, heightPct: 74, type: 'solid-green' },
    {
      day: 'M',
      count: Math.max(bids.length, 6),
      heightPct: 70,
      type: 'solid-lime',
      badge: `${Math.min(96, 62 + bids.length * 2)}%`,
    },
    { day: 'X', count: 7, heightPct: 90, type: 'solid-dark' },
    { day: 'J', count: 4, heightPct: 68, type: 'hatched' },
    { day: 'V', count: 3, heightPct: 54, type: 'hatched' },
    { day: 'S', count: 4, heightPct: 64, type: 'hatched' },
  ];

  const radius = 82;
  const halfCircumference = Math.PI * radius;
  const awardedLen = (awardedPct / 100) * halfCircumference;
  const activeLen = (activePct / 100) * halfCircumference;

  return (
    <div className="space-y-6">
      {/* Title & Action Pills */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
            Panel Principal
          </h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">
            {isAdmin
              ? 'Supervisa subastas en tiempo real, pujas vinculantes, sanciones y calificaciones.'
              : 'Planifica tus pujas, administra tus publicaciones y coordina cierres adjudicados.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onSelectSection('auctions', { openCreate: true })}
            className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publicar Subasta</span>
          </button>

          <button
            onClick={() => onSelectSection('reports', { openCreate: true })}
            className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-[#EAFFD0] border border-[#224F10]/20 text-[#0D0D0D] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Informar Incumplimiento</span>
          </button>
        </div>
      </div>

      {/* ROW 1: 4 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#224F10] to-[#122B08] text-[#EAFFD0] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#EAFFD0]/90">
              Total Subastas
            </span>
            <button
              onClick={() => onSelectSection('auctions')}
              className="w-8 h-8 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] text-[#0D0D0D] flex items-center justify-center transition-colors cursor-pointer"
              title="Ver todas las subastas"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-4xl font-bold tracking-tight my-3">
            {auctions.length}
          </p>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-[#B0E454]/20 text-[#B0E454] font-bold">
              {activeAuctions.length} ↑
            </span>
            <span className="text-[#EAFFD0]/75">En vivo actualmente</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#0D0D0D]/80">
              Subastas Adjudicadas
            </span>
            <button
              onClick={() => onSelectSection('auctions', { status: 'finalizada' })}
              className="w-8 h-8 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center transition-colors cursor-pointer"
              title="Explorar adjudicadas"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-3">
            {awardedAuctions.length}
          </p>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-[#EAFFD0] text-[#224F10] font-bold">
              {closedDealsInvolved.length} ↑
            </span>
            <span className="text-[#0D0D0D]/55">Con datos liberados RN05</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#0D0D0D]/80">
              Pujas Registradas
            </span>
            <button
              onClick={() => onSelectSection('bids')}
              className="w-8 h-8 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center transition-colors cursor-pointer"
              title="Historial de pujas"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-3">
            {bids.length}
          </p>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-[#EAFFD0] text-[#224F10] font-bold">
              {myBids.length} ↑
            </span>
            <span className="text-[#0D0D0D]/55">Ofertas realizadas por ti</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#0D0D0D]/80">
              Reportes Activos
            </span>
            <button
              onClick={() => onSelectSection('reports')}
              className="w-8 h-8 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center transition-colors cursor-pointer"
              title="Centro de reportes"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-3">
            {openReports.length}
          </p>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-[#B0E454]/35 text-[#224F10] font-bold">
              {currentUser?.reputation || '5.0'} ★
            </span>
            <span className="text-[#0D0D0D]/55">Reputación actual</span>
          </div>
        </div>
      </div>

      {/* ROW 2: ANALYTICS BAR CHART + NEXT CLOSING + RECENT AUCTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#0D0D0D]">
              Actividad de Pujas
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-[#F1F8E9] text-[#224F10] text-[10px] font-semibold">
              Últimos 7 días
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2.5 sm:gap-3 pt-8 pb-1">
            {weeklyActivity.map((item) => (
              <div
                key={item.day}
                className="flex-1 flex flex-col items-center justify-end h-full gap-2"
              >
                <div className="relative w-full max-w-[34px] h-full flex items-end justify-center">
                  <div
                    title={`${item.day}: ${item.count} movimientos`}
                    style={{
                      height: `${item.heightPct}%`,
                      backgroundImage:
                        item.type === 'hatched'
                          ? 'repeating-linear-gradient(135deg, rgba(34,79,16,0.16), rgba(34,79,16,0.16) 4px, transparent 4px, transparent 8px)'
                          : undefined,
                    }}
                    className={`relative w-full rounded-full transition-all duration-300 ${
                      item.type === 'solid-dark'
                        ? 'bg-[#224F10]'
                        : item.type === 'solid-green'
                          ? 'bg-[#3A7D20]'
                          : item.type === 'solid-lime'
                            ? 'bg-[#B0E454]'
                            : 'border border-[#224F10]/15 bg-[#F8FDF4]'
                    }`}
                  >
                    {item.badge && (
                      <>
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-[#EAFFD0] border border-[#224F10]/20 text-[#224F10] text-[9px] font-bold whitespace-nowrap shadow-2xs z-10 pointer-events-none">
                          {item.badge}
                        </span>
                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#224F10]" />
                      </>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#0D0D0D]/55">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#0D0D0D]">Próximo Cierre</h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#224F10] bg-[#EAFFD0] px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#224F10] animate-pulse" />
              En vivo
            </span>
          </div>

          {nextClosingAuction ? (
            <div className="my-4 space-y-2">
              <p className="text-lg font-bold text-[#224F10] leading-snug line-clamp-2">
                {nextClosingAuction.title}
              </p>
              <p className="text-xs text-[#0D0D0D]/60 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#224F10]" />
                <span>Cierre en {nextClosingCountdown}</span>
              </p>
              <p className="text-xs font-semibold text-[#0D0D0D]">
                Oferta líder:{' '}
                <span className="text-[#224F10]">
                  {formatCurrency(nextClosingAuction.currentPrice)}
                </span>
              </p>
            </div>
          ) : (
            <div className="my-4">
              <p className="text-sm font-semibold text-[#0D0D0D]/70">
                No hay subastas activas pendientes
              </p>
              <p className="text-xs text-[#0D0D0D]/50 mt-1">
                Publica un nuevo lote para iniciar una sala en tiempo real.
              </p>
            </div>
          )}

          <button
            onClick={() => {
              if (nextClosingAuction) {
                navigate(`/auctions/${nextClosingAuction.id}`);
              } else {
                onSelectSection('auctions', { openCreate: true });
              }
            }}
            className="w-full py-2.5 px-4 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>
              {nextClosingAuction ? 'Entrar a Pujar' : 'Publicar Nuevo Lote'}
            </span>
          </button>
        </div>

        <div className="lg:col-span-3 rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between gap-2 pb-3">
            <h2 className="text-sm font-bold text-[#0D0D0D]">Subastas</h2>
            <button
              onClick={() => onSelectSection('auctions', { openCreate: true })}
              className="px-2.5 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[11px] font-semibold text-[#0D0D0D] transition-colors cursor-pointer"
            >
              + Nueva
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {filteredAuctionsList.length === 0 ? (
              <p className="text-xs text-[#0D0D0D]/50 py-6 text-center">
                Sin coincidencias.
              </p>
            ) : (
              filteredAuctionsList.map((a, idx) => {
                const badgeStyles = [
                  'bg-[#224F10] text-[#EAFFD0]',
                  'bg-[#B0E454] text-[#0D0D0D]',
                  'bg-[#EAFFD0] text-[#224F10]',
                  'bg-[#0D0D0D] text-[#EAFFD0]',
                  'bg-[#B0E454]/40 text-[#224F10]',
                ];
                return (
                  <button
                    key={a.id}
                    onClick={() => navigate(`/auctions/${a.id}`)}
                    className="w-full flex items-center gap-2.5 text-left hover:bg-[#F7FBF3] p-1.5 -mx-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        badgeStyles[idx % badgeStyles.length]
                      }`}
                    >
                      <Tag className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#0D0D0D] truncate">
                        {a.title}
                      </p>
                      <p className="text-[10px] text-[#0D0D0D]/50 truncate">
                        {formatCurrency(a.currentPrice)} ·{' '}
                        {a.status === 'activa' ? 'En subasta' : 'Finalizada'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ROW 3: COMMUNITY + PROGRESS GAUGE + LIVE TRACKER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between gap-2 pb-4">
            <h2 className="text-sm font-bold text-[#0D0D0D]">
              Participación y Comunidad
            </h2>
            <button
              onClick={() => onSelectSection('users')}
              className="px-3 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[11px] font-semibold text-[#0D0D0D] transition-colors cursor-pointer"
            >
              + Ver Usuarios
            </button>
          </div>

          <div className="space-y-3">
            {filteredUsersList.map((u, idx) => {
              const userLastBid = bids.find(
                (b) => Number(b.bidderId) === Number(u.id)
              );
              const avatarColors = [
                'bg-[#EAFFD0] text-[#224F10]',
                'bg-[#B0E454] text-[#0D0D0D]',
                'bg-[#224F10] text-[#EAFFD0]',
                'bg-[#0D0D0D] text-[#B0E454]',
              ];
              const isSuspended =
                u.status === 'suspended' || u.status === 'closed';

              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                        avatarColors[idx % avatarColors.length]
                      }`}
                    >
                      {getInitials(u.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0D0D0D] truncate">
                        {u.name}
                      </p>
                      <p className="text-[11px] text-[#0D0D0D]/55 truncate">
                        {userLastBid ? (
                          <>
                            Última puja:{' '}
                            <span className="font-semibold text-[#0D0D0D]/80">
                              {formatCurrency(userLastBid.amount)}
                            </span>
                          </>
                        ) : (
                          `${u.city || 'Argentina'} · ${u.reputation || '5.0'} ★`
                        )}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 border ${
                      isSuspended
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : u.role === 'admin'
                          ? 'bg-[#B0E454]/40 text-[#0D0D0D] border-[#224F10]/15'
                          : 'bg-[#EAFFD0] text-[#224F10] border-[#224F10]/15'
                    }`}
                  >
                    {isSuspended
                      ? 'Sancionado'
                      : u.role === 'admin'
                        ? 'Moderador'
                        : 'Verificado'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <h2 className="text-sm font-bold text-[#0D0D0D]">
            Progreso de Subastas
          </h2>

          <div className="relative flex flex-col items-center justify-center my-2">
            <svg
              viewBox="0 0 220 128"
              className="w-full max-w-[230px] overflow-visible"
            >
              <defs>
                <pattern
                  id="gaugeHatch"
                  width="8"
                  height="8"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="8"
                    stroke="#224F10"
                    strokeWidth="3"
                    strokeOpacity="0.18"
                  />
                </pattern>
              </defs>

              <path
                d="M 28 110 A 82 82 0 0 1 192 110"
                fill="none"
                stroke="url(#gaugeHatch)"
                strokeWidth="22"
                strokeLinecap="round"
              />

              {awardedLen + activeLen > 0 && (
                <path
                  d="M 28 110 A 82 82 0 0 1 192 110"
                  fill="none"
                  stroke="#B0E454"
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.min(
                    halfCircumference,
                    awardedLen + activeLen
                  )} ${halfCircumference}`}
                />
              )}

              {awardedLen > 0 && (
                <path
                  d="M 28 110 A 82 82 0 0 1 192 110"
                  fill="none"
                  stroke="#224F10"
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeDasharray={`${awardedLen} ${halfCircumference}`}
                />
              )}
            </svg>

            <div className="absolute bottom-2 flex flex-col items-center text-center">
              <span className="text-3xl font-bold tracking-tight text-[#0D0D0D]">
                {awardedPct}%
              </span>
              <span className="text-[11px] font-medium text-[#224F10]">
                Subastas Adjudicadas
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2 text-[11px] font-medium text-[#0D0D0D]/70">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#224F10]" />
              Adjudicadas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B0E454]" />
              En Vivo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#224F10]/20 border border-[#224F10]/30" />
              Pendientes
            </span>
          </div>
        </div>

        <div className="lg:col-span-3 relative rounded-2xl bg-gradient-to-br from-[#0D0D0D] via-[#132B08] to-[#224F10] text-[#EAFFD0] p-5 flex flex-col justify-between overflow-hidden min-h-[210px] shadow-sm">
          <svg
            viewBox="0 0 240 240"
            className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
            preserveAspectRatio="none"
          >
            <path
              d="M-20,40 Q80,10 140,80 T260,60"
              fill="none"
              stroke="#B0E454"
              strokeWidth="1.5"
            />
            <path
              d="M-20,85 Q90,45 150,120 T260,105"
              fill="none"
              stroke="#B0E454"
              strokeWidth="1.5"
            />
            <path
              d="M-20,130 Q100,90 160,165 T260,150"
              fill="none"
              stroke="#EAFFD0"
              strokeWidth="1"
            />
            <path
              d="M-20,175 Q110,135 170,210 T260,195"
              fill="none"
              stroke="#B0E454"
              strokeWidth="1.5"
            />
          </svg>

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-medium text-[#EAFFD0]/85">
              Cronómetro de Cierre
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#B0E454]/20 text-[#B0E454] text-[10px] font-bold">
              {trackerPaused ? 'PAUSA' : 'EN VIVO'}
            </span>
          </div>

          <div className="relative z-10 my-3 text-center">
            <p className="text-3xl sm:text-4xl font-bold tracking-wider tabular-nums text-white">
              {nextClosingCountdown}
            </p>
            <p className="text-[11px] text-[#EAFFD0]/65 mt-1 truncate">
              {nextClosingAuction
                ? nextClosingAuction.title
                : 'Sin lotes corriendo'}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-center gap-3">
            <button
              onClick={onTogglePause}
              title={trackerPaused ? 'Reanudar reloj' : 'Pausar reloj'}
              className="w-10 h-10 rounded-full bg-white hover:bg-[#B0E454] text-[#0D0D0D] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            >
              {trackerPaused ? (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              ) : (
                <Pause className="w-4 h-4 fill-current" />
              )}
            </button>

            <button
              onClick={() => {
                if (nextClosingAuction) {
                  navigate(`/auctions/${nextClosingAuction.id}`);
                } else {
                  onSelectSection('auctions');
                }
              }}
              title="Ir a la sala de subasta"
              className="w-10 h-10 rounded-full bg-[#B0E454] hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ROW 4: COORDINACIÓN DIRECTA RN05 */}
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
            {filteredClosedDeals.length} operaciones adjudicadas
          </span>
        </div>

        {filteredClosedDeals.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#224F10]/10 p-6 text-center text-xs text-[#0D0D0D]/60">
            No hay subastas finalizadas con adjudicación para mostrar con los
            filtros actuales.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredClosedDeals.map((deal) => {
              const seller = users.find(
                (u) => Number(u.id) === Number(deal.sellerId)
              );
              const winner = users.find(
                (u) => Number(u.id) === Number(deal.winnerId)
              );
              const isWinner = Number(currentUser?.id) === Number(deal.winnerId);
              const counterpartId = isWinner ? deal.sellerId : deal.winnerId;

              return (
                <div
                  key={deal.id}
                  className="rounded-2xl bg-white border border-[#224F10]/12 p-5 space-y-4 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EAFFD0] text-[#224F10] border border-[#224F10]/15 text-[10px] font-bold mb-1.5">
                        {isWinner
                          ? 'Ganaste esta subasta'
                          : Number(currentUser?.id) === Number(deal.sellerId)
                            ? 'Artículo vendido'
                            : 'Auditoría Admin'}
                      </span>
                      <h3 className="text-base font-bold text-[#0D0D0D]">
                        {deal.title}
                      </h3>
                      <p className="text-xs text-[#0D0D0D]/60 mt-0.5">
                        Monto final:{' '}
                        <strong className="text-[#224F10]">
                          {formatCurrency(deal.currentPrice)}
                        </strong>
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
                    <div className="space-y-1">
                      <p className="font-bold text-[#224F10] uppercase tracking-wider text-[10px]">
                        Dueño del Artículo
                      </p>
                      <p className="font-semibold text-[#0D0D0D]">
                        {seller?.name || 'Vendedor'}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#0D0D0D]/75">
                        <Phone className="w-3 h-3 text-[#224F10]" />
                        {seller?.phone}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#0D0D0D]/75 truncate">
                        <Mail className="w-3 h-3 text-[#224F10]" />
                        {seller?.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#0D0D0D]/75">
                        <MapPin className="w-3 h-3 text-[#224F10]" />
                        {seller?.city}
                      </p>
                    </div>

                    <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-[#224F10]/10 pt-2.5 sm:pt-0 sm:pl-3">
                      <p className="font-bold text-[#224F10] uppercase tracking-wider text-[10px]">
                        Ganador Adjudicado
                      </p>
                      <p className="font-semibold text-[#0D0D0D]">
                        {winner?.name || 'Comprador'}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#0D0D0D]/75">
                        <Phone className="w-3 h-3 text-[#224F10]" />
                        {winner?.phone}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#0D0D0D]/75 truncate">
                        <Mail className="w-3 h-3 text-[#224F10]" />
                        {winner?.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#0D0D0D]/75">
                        <MapPin className="w-3 h-3 text-[#224F10]" />
                        {winner?.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
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
    </div>
  );
}

