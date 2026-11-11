import React from 'react';
import { useNavigate } from 'react-router-dom';
import { sameId, findById, matchesSearch } from '../../utils/formatters';
import { formatCountdownFromNow } from './dashboardHelpers';
import { DashboardStatCard } from './DashboardShared';
import { NextClosingCard, RecentAuctionsCard } from './OverviewWidgets';
import { OverviewProgressRow } from './OverviewProgressRow';
import { OverviewClosedDeals } from './OverviewClosedDeals';
import { Plus, ArrowUpRight } from 'lucide-react';

function StatArrowButton({ onClick, title, highlight = false }) {
  const colorClass = highlight ? 'bg-[#EAFFD0] hover:bg-[#B0E454]' : 'border border-[#224F10]/20 hover:bg-[#EAFFD0]';
  return (
    <button type="button" onClick={onClick} title={title} className={`w-8 h-8 rounded-full text-[#0D0D0D] flex items-center justify-center transition-colors cursor-pointer ${colorClass}`}>
      <ArrowUpRight className="w-4 h-4" />
    </button>
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

  // Métricas reales calculadas a partir de la base de datos
  const activeAuctions = auctions.filter((a) => a.status === 'activa');
  const awardedAuctions = auctions.filter((a) => a.status === 'finalizada' && a.winnerId);
  const myBids = bids.filter((b) => sameId(b.bidderId, currentUser?.id));
  const openReports = reports.filter((r) => r.status === 'en_revision');

  // Subastas finalizadas donde participa el usuario (o todas si es admin)
  const closedDealsInvolved = awardedAuctions.filter((a) => {
    const participa = sameId(a.winnerId, currentUser?.id) || sameId(a.sellerId, currentUser?.id);
    return isAdmin || participa;
  });

  // Subasta activa que cierra más pronto
  const sortedActive = [...activeAuctions].sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
  const nextClosingAuction = sortedActive[0] || null;
  const nextClosingCountdown = nextClosingAuction ? formatCountdownFromNow(nextClosingAuction.endTime, nowMs) : '00:00:00';

  const filteredAuctionsList = auctions.filter((a) => matchesSearch([a.title, a.category], searchQuery)).slice(0, 5);
  const filteredUsersList = users.filter((u) => matchesSearch([u.name, u.email, u.city], searchQuery)).slice(0, 4);
  const filteredClosedDeals = closedDealsInvolved.filter((deal) => {
    const seller = findById(users, deal.sellerId);
    const winner = findById(users, deal.winnerId);
    return matchesSearch([deal.title, seller?.name || deal.sellerName, winner?.name || deal.winnerName], searchQuery);
  });

  const headerSubtitle = isAdmin
    ? 'Supervisa subastas en tiempo real, pujas vinculantes, sanciones y calificaciones.'
    : 'Planifica tus pujas, administra tus publicaciones y coordina cierres adjudicados.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">Panel Principal</h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">{headerSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={() => onSelectSection('auctions', { openCreate: true })} className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Publicar Subasta</span>
          </button>
          <button type="button" onClick={() => onSelectSection('reports', { openCreate: true })} className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-[#EAFFD0] border border-[#224F10]/20 text-[#0D0D0D] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer">
            <span>Informar Incumplimiento</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de métricas (KPI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard highlight title="Total Subastas" value={auctions.length} topAction={<StatArrowButton highlight title="Ver todas las subastas" onClick={() => onSelectSection('auctions')} />} subtitle={`${activeAuctions.length} en vivo actualmente`} />
        <DashboardStatCard title="Subastas Adjudicadas" value={awardedAuctions.length} topAction={<StatArrowButton title="Explorar adjudicadas" onClick={() => onSelectSection('auctions', { status: 'finalizada' })} />} subtitle={`${closedDealsInvolved.length} con contacto liberado RN05`} />
        <DashboardStatCard title="Pujas Registradas" value={bids.length} topAction={<StatArrowButton title="Historial de pujas" onClick={() => onSelectSection('bids')} />} subtitle={`${myBids.length} ofertas realizadas por ti`} />
        <DashboardStatCard title="Reportes Activos" value={openReports.length} topAction={<StatArrowButton title="Centro de reportes" onClick={() => onSelectSection('reports')} />} subtitle={`Tu reputación: ${currentUser?.reputation || '5.0'} ★`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <NextClosingCard
          auction={nextClosingAuction}
          countdown={nextClosingCountdown}
          onAction={() => (nextClosingAuction ? navigate(`/auctions/${nextClosingAuction.id}`) : onSelectSection('auctions', { openCreate: true }))}
        />
        <RecentAuctionsCard
          auctions={filteredAuctionsList}
          onCreateClick={() => onSelectSection('auctions', { openCreate: true })}
          onOpenAuction={(id) => navigate(`/auctions/${id}`)}
        />
      </div>

      <OverviewProgressRow
        users={filteredUsersList}
        bids={bids}
        awardedCount={awardedAuctions.length}
        activeCount={activeAuctions.length}
        totalCount={auctions.length}
        nextClosingAuction={nextClosingAuction}
        countdown={nextClosingCountdown}
        trackerPaused={trackerPaused}
        onTogglePause={onTogglePause}
        onOpenTracker={() => (nextClosingAuction ? navigate(`/auctions/${nextClosingAuction.id}`) : onSelectSection('auctions'))}
        onViewUsers={() => onSelectSection('users')}
      />

      <OverviewClosedDeals deals={filteredClosedDeals} users={users} currentUserId={currentUser?.id} onSelectSection={onSelectSection} />
    </div>
  );
}
