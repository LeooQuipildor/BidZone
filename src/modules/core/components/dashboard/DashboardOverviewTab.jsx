import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  formatCurrency,
  sameId,
  findById,
  matchesSearch,
} from '../../utils/formatters';
import { formatCountdownFromNow, getInitials } from './dashboardHelpers';
import { DashboardStatCard } from './DashboardShared';
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

const RECENT_BADGE_COLORS = [
  'bg-[#224F10] text-[#EAFFD0]',
  'bg-[#B0E454] text-[#0D0D0D]',
  'bg-[#EAFFD0] text-[#224F10]',
  'bg-[#0D0D0D] text-[#EAFFD0]',
  'bg-[#B0E454]/40 text-[#224F10]',
];

const USER_AVATAR_COLORS = [
  'bg-[#EAFFD0] text-[#224F10]',
  'bg-[#B0E454] text-[#0D0D0D]',
  'bg-[#224F10] text-[#EAFFD0]',
  'bg-[#0D0D0D] text-[#B0E454]',
];

// Devuelve el color de fondo de cada barra según su tipo visual
function getActivityBarColor(type) {
  if (type === 'solid-dark') {
    return 'bg-[#224F10]';
  }
  if (type === 'solid-green') {
    return 'bg-[#3A7D20]';
  }
  if (type === 'solid-lime') {
    return 'bg-[#B0E454]';
  }
  return 'border border-[#224F10]/15 bg-[#F8FDF4]';
}

// Calcula la etiqueta y color de estado de un usuario en la lista de comunidad
function getCommunityUserBadge(user) {
  const estaSancionado =
    user.status === 'suspended' || user.status === 'closed';

  if (estaSancionado) {
    return {
      label: 'Sancionado',
      className: 'bg-red-50 text-red-700 border-red-200',
    };
  }
  if (user.role === 'admin') {
    return {
      label: 'Moderador',
      className: 'bg-[#B0E454]/40 text-[#0D0D0D] border-[#224F10]/15',
    };
  }
  return {
    label: 'Verificado',
    className: 'bg-[#EAFFD0] text-[#224F10] border-[#224F10]/15',
  };
}

// Etiqueta que muestra qué rol tuvo el usuario actual dentro de una subasta cerrada
function getDealRoleLabel(deal, currentUserId) {
  if (sameId(currentUserId, deal.winnerId)) {
    return 'Ganaste esta subasta';
  }
  if (sameId(currentUserId, deal.sellerId)) {
    return 'Artículo vendido';
  }
  return 'Auditoría Admin';
}

// Columna reutilizable para mostrar los datos de contacto liberados (RN05)
function DealContactColumn({
  title,
  person,
  fallbackName,
  fallbackEmail,
  withDivider = false,
}) {
  const dividerClass = withDivider
    ? 'border-t sm:border-t-0 sm:border-l border-[#224F10]/10 pt-2.5 sm:pt-0 sm:pl-3'
    : '';

  return (
    <div className={`space-y-1 ${dividerClass}`}>
      <p className="font-bold text-[#224F10] uppercase tracking-wider text-[10px]">
        {title}
      </p>
      <p className="font-semibold text-[#0D0D0D]">
        {person?.name || fallbackName}
      </p>
      <p className="flex items-center gap-1.5 text-[#0D0D0D]/75">
        <Phone className="w-3 h-3 text-[#224F10]" />
        {person?.phone || 'Sin teléfono'}
      </p>
      <p className="flex items-center gap-1.5 text-[#0D0D0D]/75 truncate">
        <Mail className="w-3 h-3 text-[#224F10]" />
        {person?.email || fallbackEmail}
      </p>
      <p className="flex items-center gap-1.5 text-[#0D0D0D]/75">
        <MapPin className="w-3 h-3 text-[#224F10]" />
        {person?.city || 'Argentina'}
      </p>
    </div>
  );
}

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

  // Métricas generales para las tarjetas y gráficos
  const activeAuctions = auctions.filter((a) => a.status === 'activa');
  const awardedAuctions = auctions.filter(
    (a) => a.status === 'finalizada' && a.winnerId
  );
  const myBids = bids.filter((b) => sameId(b.bidderId, currentUser?.id));
  const openReports = reports.filter((r) => r.status === 'en_revision');

  // Operaciones finalizadas en las que participa el usuario (o todas si es admin)
  const closedDealsInvolved = auctions.filter((a) => {
    const esAdjudicada = a.status === 'finalizada' && a.winnerId;
    if (!esAdjudicada) {
      return false;
    }
    const participa =
      sameId(a.winnerId, currentUser?.id) || sameId(a.sellerId, currentUser?.id);
    return isAdmin || participa;
  });

  // Buscamos la subasta activa que cierra más pronto
  const sortedActive = [...activeAuctions].sort(
    (a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
  );
  const nextClosingAuction = sortedActive[0] || null;
  const nextClosingCountdown = nextClosingAuction
    ? formatCountdownFromNow(nextClosingAuction.endTime, nowMs)
    : '00:00:00';

  // Porcentajes para el gráfico semicircular de progreso
  const totalCount = Math.max(auctions.length, 1);
  const awardedPct = Math.round((awardedAuctions.length / totalCount) * 100);
  const activePct = Math.round((activeAuctions.length / totalCount) * 100);

  // Listas filtradas según lo escrito en el buscador superior
  const filteredAuctionsList = auctions
    .filter((a) => matchesSearch([a.title, a.category], searchQuery))
    .slice(0, 5);

  const filteredUsersList = users
    .filter((u) => matchesSearch([u.name, u.email, u.city], searchQuery))
    .slice(0, 4);

  const filteredClosedDeals = closedDealsInvolved.filter((deal) => {
    const seller = findById(users, deal.sellerId);
    const winner = findById(users, deal.winnerId);
    return matchesSearch(
      [
        deal.title,
        seller?.name || deal.sellerName,
        winner?.name || deal.winnerName,
      ],
      searchQuery
    );
  });

  // Datos visuales para el gráfico de barras de la semana
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

  // Cálculo de la longitud de los arcos del semicírculo (strokeDasharray)
  // El radio del arco SVG es 82, así que medio círculo mide Math.PI * 82
  const radius = 82;
  const halfCircumference = Math.PI * radius;
  const awardedLen = (awardedPct / 100) * halfCircumference;
  const activeLen = (activePct / 100) * halfCircumference;
  const combinedArcLen = Math.min(halfCircumference, awardedLen + activeLen);

  function handleNextClosingClick() {
    if (nextClosingAuction) {
      navigate(`/auctions/${nextClosingAuction.id}`);
    } else {
      onSelectSection('auctions', { openCreate: true });
    }
  }

  function handleOpenAuctionFromTracker() {
    if (nextClosingAuction) {
      navigate(`/auctions/${nextClosingAuction.id}`);
    } else {
      onSelectSection('auctions');
    }
  }

  const headerSubtitle = isAdmin
    ? 'Supervisa subastas en tiempo real, pujas vinculantes, sanciones y calificaciones.'
    : 'Planifica tus pujas, administra tus publicaciones y coordina cierres adjudicados.';

  return (
    <div className="space-y-6">
      {/* Encabezado y botones rápidos */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
            Panel Principal
          </h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">
            {headerSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onSelectSection('auctions', { openCreate: true })}
            className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publicar Subasta</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSection('reports', { openCreate: true })}
            className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-[#EAFFD0] border border-[#224F10]/20 text-[#0D0D0D] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Informar Incumplimiento</span>
          </button>
        </div>
      </div>

      {/* Fila 1: 4 tarjetas de resumen (KPI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard
          highlight
          title="Total Subastas"
          value={auctions.length}
          topAction={
            <button
              type="button"
              onClick={() => onSelectSection('auctions')}
              className="w-8 h-8 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] text-[#0D0D0D] flex items-center justify-center transition-colors cursor-pointer"
              title="Ver todas las subastas"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          }
          footer={
            <div className="flex items-center gap-2 text-[11px]">
              <span className="px-1.5 py-0.5 rounded bg-[#B0E454]/20 text-[#B0E454] font-bold">
                {activeAuctions.length} ↑
              </span>
              <span className="text-[#EAFFD0]/75">En vivo actualmente</span>
            </div>
          }
        />

        <DashboardStatCard
          title="Subastas Adjudicadas"
          value={awardedAuctions.length}
          topAction={
            <button
              type="button"
              onClick={() =>
                onSelectSection('auctions', { status: 'finalizada' })
              }
              className="w-8 h-8 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center transition-colors cursor-pointer"
              title="Explorar adjudicadas"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          }
          footer={
            <div className="flex items-center gap-2 text-[11px]">
              <span className="px-1.5 py-0.5 rounded bg-[#EAFFD0] text-[#224F10] font-bold">
                {closedDealsInvolved.length} ↑
              </span>
              <span className="text-[#0D0D0D]/55">Con datos liberados RN05</span>
            </div>
          }
        />

        <DashboardStatCard
          title="Pujas Registradas"
          value={bids.length}
          topAction={
            <button
              type="button"
              onClick={() => onSelectSection('bids')}
              className="w-8 h-8 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center transition-colors cursor-pointer"
              title="Historial de pujas"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          }
          footer={
            <div className="flex items-center gap-2 text-[11px]">
              <span className="px-1.5 py-0.5 rounded bg-[#EAFFD0] text-[#224F10] font-bold">
                {myBids.length} ↑
              </span>
              <span className="text-[#0D0D0D]/55">Ofertas realizadas por ti</span>
            </div>
          }
        />

        <DashboardStatCard
          title="Reportes Activos"
          value={openReports.length}
          topAction={
            <button
              type="button"
              onClick={() => onSelectSection('reports')}
              className="w-8 h-8 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center transition-colors cursor-pointer"
              title="Centro de reportes"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          }
          footer={
            <div className="flex items-center gap-2 text-[11px]">
              <span className="px-1.5 py-0.5 rounded bg-[#B0E454]/35 text-[#224F10] font-bold">
                {currentUser?.reputation || '5.0'} ★
              </span>
              <span className="text-[#0D0D0D]/55">Reputación actual</span>
            </div>
          }
        />
      </div>

      {/* Fila 2: gráfico de barras + próximo cierre + subastas recientes */}
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
            {weeklyActivity.map((item) => {
              const barColorClass = getActivityBarColor(item.type);
              const hatchedPattern =
                item.type === 'hatched'
                  ? 'repeating-linear-gradient(135deg, rgba(34,79,16,0.16), rgba(34,79,16,0.16) 4px, transparent 4px, transparent 8px)'
                  : undefined;

              return (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center justify-end h-full gap-2"
                >
                  <div className="relative w-full max-w-[34px] h-full flex items-end justify-center">
                    <div
                      title={`${item.day}: ${item.count} movimientos`}
                      style={{
                        height: `${item.heightPct}%`,
                        backgroundImage: hatchedPattern,
                      }}
                      className={`relative w-full rounded-full transition-all duration-300 ${barColorClass}`}
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
              );
            })}
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
            type="button"
            onClick={handleNextClosingClick}
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
              type="button"
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
              filteredAuctionsList.map((auction, idx) => {
                const badgeColor =
                  RECENT_BADGE_COLORS[idx % RECENT_BADGE_COLORS.length];
                const estadoTexto =
                  auction.status === 'activa' ? 'En subasta' : 'Finalizada';

                return (
                  <button
                    key={auction.id}
                    type="button"
                    onClick={() => navigate(`/auctions/${auction.id}`)}
                    className="w-full flex items-center gap-2.5 text-left hover:bg-[#F7FBF3] p-1.5 -mx-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${badgeColor}`}
                    >
                      <Tag className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#0D0D0D] truncate">
                        {auction.title}
                      </p>
                      <p className="text-[10px] text-[#0D0D0D]/50 truncate">
                        {formatCurrency(auction.currentPrice)} · {estadoTexto}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Fila 3: comunidad + medidor de progreso + cronómetro */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between gap-2 pb-4">
            <h2 className="text-sm font-bold text-[#0D0D0D]">
              Participación y Comunidad
            </h2>
            <button
              type="button"
              onClick={() => onSelectSection('users')}
              className="px-3 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[11px] font-semibold text-[#0D0D0D] transition-colors cursor-pointer"
            >
              + Ver Usuarios
            </button>
          </div>

          <div className="space-y-3">
            {filteredUsersList.map((user, idx) => {
              const userLastBid = bids.find((b) =>
                sameId(b.bidderId, user.id)
              );
              const avatarColor =
                USER_AVATAR_COLORS[idx % USER_AVATAR_COLORS.length];
              const badge = getCommunityUserBadge(user);

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${avatarColor}`}
                    >
                      {getInitials(user.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0D0D0D] truncate">
                        {user.name}
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
                          `${user.city || 'Argentina'} · ${user.reputation || '5.0'} ★`
                        )}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 border ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Medidor semicircular de progreso de subastas */}
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

              {combinedArcLen > 0 && (
                <path
                  d="M 28 110 A 82 82 0 0 1 192 110"
                  fill="none"
                  stroke="#B0E454"
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeDasharray={`${combinedArcLen} ${halfCircumference}`}
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

        {/* Cronómetro en vivo */}
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
              type="button"
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
              type="button"
              onClick={handleOpenAuctionFromTracker}
              title="Ir a la sala de subasta"
              className="w-10 h-10 rounded-full bg-[#B0E454] hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Fila 4: Coordinación directa RN05 */}
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
              const seller = findById(users, deal.sellerId);
              const winner = findById(users, deal.winnerId);
              const isWinner = sameId(currentUser?.id, deal.winnerId);
              const counterpartId = isWinner ? deal.sellerId : deal.winnerId;
              const roleBadge = getDealRoleLabel(deal, currentUser?.id);

              return (
                <div
                  key={deal.id}
                  className="rounded-2xl bg-white border border-[#224F10]/12 p-5 space-y-4 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EAFFD0] text-[#224F10] border border-[#224F10]/15 text-[10px] font-bold mb-1.5">
                        {roleBadge}
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
                    <DealContactColumn
                      title="Dueño del Artículo"
                      person={seller}
                      fallbackName={deal.sellerName || 'Vendedor'}
                      fallbackEmail="Privado (RN05)"
                    />
                    <DealContactColumn
                      title="Ganador Adjudicado"
                      person={winner}
                      fallbackName={deal.winnerName || 'Comprador'}
                      fallbackEmail="Privado (RN05)"
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
    </div>
  );
}
