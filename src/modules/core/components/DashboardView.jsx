import React, { useEffect, useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useAuthStore } from '../../auth/states/authStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useBidStore } from '../../bids/states/bidStore';
import { useReportStore } from '../../reports/states/reportStore';
import { useReviewStore } from '../../reviews/states/reviewStore';
import { useNotificationStore } from '../../notifications/states/notificationStore';
import { sameId } from '../utils/formatters';
import { getInitials } from './dashboard/dashboardHelpers';
import { DashboardOverviewTab } from './dashboard/DashboardOverviewTab';
import { DashboardAuctionsTab } from './dashboard/DashboardAuctionsTab';
import { DashboardBidsTab } from './dashboard/DashboardBidsTab';
import { DashboardReportsTab } from './dashboard/DashboardReportsTab';
import { DashboardReviewsTab } from './dashboard/DashboardReviewsTab';
import { DashboardUsersTab } from './dashboard/DashboardUsersTab';
import { DashboardNotificationsTab } from './dashboard/DashboardNotificationsTab';
import { DashboardProfileTab } from './dashboard/DashboardProfileTab';
import {
  LayoutDashboard,
  Gavel,
  TrendingUp,
  AlertOctagon,
  Star,
  Users,
  Bell,
  LogOut,
  Search,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';

const SEARCH_PLACEHOLDERS = {
  overview: 'Buscar subasta, usuario o lote...',
  auctions: 'Buscar subasta por título o categoría...',
  bids: 'Buscar puja por lote, postor o nota...',
  reports: 'Buscar expediente, motivo o usuario...',
  reviews: 'Buscar reseña, autor o calificado...',
  users: 'Buscar usuario por nombre, correo o ciudad...',
  notifications: 'Buscar alertas y mensajes...',
  profile: 'Buscar en tu panel...',
};

export function DashboardView({ initialSection = 'overview' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentUser = useAuthStore((s) => s.currentUser);
  const users = useAuthStore((s) => s.users);
  const fetchUsers = useAuthStore((s) => s.fetchUsers);
  const logout = useAuthStore((s) => s.logout);

  const auctions = useAuctionStore((s) => s.auctions);
  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);

  const bids = useBidStore((s) => s.bids);
  const fetchBids = useBidStore((s) => s.fetchBids);

  const reports = useReportStore((s) => s.reports);
  const fetchReports = useReportStore((s) => s.fetchReports);

  const reviews = useReviewStore((s) => s.reviews);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);

  const notifications = useNotificationStore((s) => s.notifications);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);

  const [searchQuery, setSearchQuery] = useState('');
  const [trackerPaused, setTrackerPaused] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [sectionPrefill, setSectionPrefill] = useState(null);
  const [sectionSeed, setSectionSeed] = useState(0);

  // Al entrar al panel cargamos todos los módulos necesarios
  useEffect(() => {
    fetchUsers();
    fetchAuctions();
    fetchBids();
    fetchReports();
    fetchReviews();
    fetchNotifications();
  }, [
    fetchUsers,
    fetchAuctions,
    fetchBids,
    fetchReports,
    fetchReviews,
    fetchNotifications,
  ]);

  // Reloj de 1 segundo para actualizar los contadores en vivo (si no está en pausa)
  useEffect(() => {
    if (trackerPaused) return;
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [trackerPaused]);

  const tabFromUrl = searchParams.get('tab');
  const openNewFromUrl = searchParams.get('new') === '1';
  const activeSection = tabFromUrl || initialSection || 'overview';

  let effectivePrefill = null;
  if (sectionPrefill) {
    effectivePrefill = sectionPrefill;
  } else if (openNewFromUrl) {
    effectivePrefill = { openCreate: true };
  }

  // Cambia de pestaña dentro del mismo panel sin recargar la página
  function handleSelectSection(nextSection, prefillData = null) {
    setSearchQuery('');
    setSectionPrefill(prefillData);
    setSectionSeed((prev) => prev + 1);

    if (location.pathname !== '/dashboard') {
      const targetUrl =
        nextSection === 'overview'
          ? '/dashboard'
          : `/dashboard?tab=${nextSection}`;
      navigate(targetUrl, { replace: true });
      return;
    }

    if (nextSection === 'overview') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab: nextSection }, { replace: true });
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  const isAdmin = currentUser?.role === 'admin';
  const openReportsCount = reports.filter(
    (r) => r.status === 'en_revision'
  ).length;
  const unreadNotifications = notifications.filter(
    (n) => sameId(n.userId, currentUser?.id) && !n.read
  );

  const menuSections = [
    { id: 'overview', label: 'Panel Principal', icon: LayoutDashboard },
    {
      id: 'auctions',
      label: 'Subastas',
      icon: Gavel,
      badge: auctions.length,
      badgeVariant: 'dark',
    },
    { id: 'bids', label: 'Pujas', icon: TrendingUp, count: bids.length },
    {
      id: 'reports',
      label: 'Reportes',
      icon: AlertOctagon,
      badge: openReportsCount > 0 ? openReportsCount : null,
      badgeVariant: 'lime',
    },
    { id: 'reviews', label: 'Reseñas', icon: Star, count: reviews.length },
    { id: 'users', label: 'Usuarios', icon: Users, count: users.length },
  ];

  const generalSections = [
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: Bell,
      badge:
        unreadNotifications.length > 0 ? unreadNotifications.length : null,
    },
    { id: 'profile', label: 'Mi Perfil', icon: UserIcon },
  ];

  const userInitials = getInitials(currentUser?.name);
  const searchPlaceholder =
    SEARCH_PLACEHOLDERS[activeSection] || SEARCH_PLACEHOLDERS.overview;
  const roleLabel = isAdmin ? 'Admin' : 'Socio';

  // Elige qué pestaña mostrar según la sección activa
  function renderActiveSection() {
    switch (activeSection) {
      case 'overview':
        return (
          <DashboardOverviewTab
            currentUser={currentUser}
            users={users}
            auctions={auctions}
            bids={bids}
            reports={reports}
            searchQuery={searchQuery}
            nowMs={nowMs}
            trackerPaused={trackerPaused}
            onTogglePause={() => setTrackerPaused((p) => !p)}
            onSelectSection={handleSelectSection}
          />
        );
      case 'auctions':
        return (
          <DashboardAuctionsTab
            key={`auctions-${sectionSeed}-${openNewFromUrl ? 'new' : 'list'}`}
            currentUser={currentUser}
            users={users}
            auctions={auctions}
            bids={bids}
            searchQuery={searchQuery}
            nowMs={nowMs}
            prefill={effectivePrefill}
          />
        );
      case 'bids':
        return (
          <DashboardBidsTab
            key={`bids-${sectionSeed}`}
            currentUser={currentUser}
            users={users}
            auctions={auctions}
            bids={bids}
            searchQuery={searchQuery}
          />
        );
      case 'reports':
        return (
          <DashboardReportsTab
            key={`reports-${sectionSeed}`}
            currentUser={currentUser}
            users={users}
            auctions={auctions}
            reports={reports}
            searchQuery={searchQuery}
            prefill={effectivePrefill}
          />
        );
      case 'reviews':
        return (
          <DashboardReviewsTab
            key={`reviews-${sectionSeed}`}
            currentUser={currentUser}
            users={users}
            auctions={auctions}
            reviews={reviews}
            searchQuery={searchQuery}
            prefill={effectivePrefill}
          />
        );
      case 'users':
        return (
          <DashboardUsersTab
            key={`users-${sectionSeed}`}
            currentUser={currentUser}
            users={users}
            searchQuery={searchQuery}
          />
        );
      case 'notifications':
        return (
          <DashboardNotificationsTab
            key={`notifications-${sectionSeed}`}
            currentUser={currentUser}
            notifications={notifications}
            searchQuery={searchQuery}
          />
        );
      case 'profile':
        return (
          <DashboardProfileTab
            key={`profile-${sectionSeed}`}
            currentUser={currentUser}
            auctions={auctions}
            bids={bids}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="rounded-[28px] bg-[#F7FBF3] border border-[#224F10]/12 shadow-sm overflow-hidden flex flex-col lg:flex-row">
      {/* Barra lateral izquierda para cambiar de sección */}
      <aside className="w-full lg:w-60 shrink-0 bg-[#F1F8E9] border-b lg:border-b-0 lg:border-r border-[#224F10]/10 p-5 flex flex-col justify-between gap-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#224F10] text-[#B0E454] flex items-center justify-center shadow-2xs">
                <Gavel className="w-4 h-4" />
              </span>
              <span className="text-lg font-bold tracking-tight text-[#0D0D0D]">
                BidZone
              </span>
            </Link>
            <span className="px-2 py-0.5 rounded-full bg-[#B0E454]/40 text-[#224F10] text-[10px] font-bold uppercase">
              {roleLabel}
            </span>
          </div>

          {/* Sección MENU */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0D0D0D]/40 px-3 pb-1.5">
              MENU
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
              {menuSections.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const buttonStyle = isActive
                  ? 'bg-[#EAFFD0]/90 text-[#0D0D0D] font-semibold'
                  : 'text-[#0D0D0D]/65 hover:text-[#0D0D0D] hover:bg-white/70 font-medium';
                const badgeStyle =
                  item.badgeVariant === 'dark'
                    ? 'bg-[#224F10] text-[#EAFFD0]'
                    : 'bg-[#B0E454] text-[#0D0D0D]';
                const hasBadge = item.badge !== undefined && item.badge !== null;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSection(item.id)}
                    className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${buttonStyle}`}
                  >
                    {isActive && (
                      <span className="hidden lg:block absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#224F10]" />
                    )}
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#224F10]' : ''}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>

                    {hasBadge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none shrink-0 ${badgeStyle}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && item.badge === undefined && (
                      <span className="text-[10px] font-bold text-[#224F10]/70 shrink-0">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sección GENERAL */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0D0D0D]/40 px-3 pb-1.5">
              GENERAL
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
              {generalSections.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const buttonStyle = isActive
                  ? 'bg-[#EAFFD0]/90 text-[#0D0D0D] font-semibold'
                  : 'text-[#0D0D0D]/65 hover:text-[#0D0D0D] hover:bg-white/70 font-medium';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSection(item.id)}
                    className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${buttonStyle}`}
                  >
                    {isActive && (
                      <span className="hidden lg:block absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#224F10]" />
                    )}
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#224F10]' : ''}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#B0E454] text-[#0D0D0D] text-[10px] font-bold leading-none shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0D0D0D]/65 hover:text-red-700 hover:bg-red-50/70 text-xs font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tarjeta informativa inferior */}
        <div className="hidden lg:block relative rounded-2xl bg-[#0D0D0D] text-[#EAFFD0] p-4 overflow-hidden shadow-sm">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-[#224F10]/60 blur-xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <span className="w-7 h-7 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#EAFFD0] leading-snug">
                Trato Directo RN05
              </p>
              <p className="text-[10px] text-[#EAFFD0]/65 leading-relaxed">
                Sin comisiones ocultas. Al ganar, coordinas directamente con tu
                contraparte.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectSection('auctions')}
              className="w-full py-2 rounded-full bg-[#224F10] hover:bg-[#B0E454] hover:text-[#0D0D0D] text-[#EAFFD0] text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Explorar Lotes
            </button>
          </div>
        </div>
      </aside>

      {/* Área derecha: barra superior + contenido dinámico */}
      <div className="flex-1 p-5 sm:p-7 space-y-6 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 bg-white border border-[#224F10]/12 rounded-2xl px-3.5 py-2 w-full sm:max-w-xs shadow-2xs">
            <Search className="w-4 h-4 text-[#0D0D0D]/45 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-[#0D0D0D] placeholder-[#0D0D0D]/40 focus:outline-none"
            />
            <span className="px-1.5 py-0.5 rounded-md bg-[#F1F8E9] border border-[#224F10]/10 text-[10px] font-semibold text-[#0D0D0D]/55 shrink-0">
              ⌘ F
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectSection('reports')}
                title="Reportes e Infracciones"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  activeSection === 'reports'
                    ? 'bg-[#224F10] border-[#224F10] text-[#EAFFD0]'
                    : 'bg-white border-[#224F10]/12 hover:border-[#224F10]/30 text-[#0D0D0D]/75'
                }`}
              >
                <Mail className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleSelectSection('notifications')}
                title="Notificaciones"
                className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  activeSection === 'notifications'
                    ? 'bg-[#224F10] border-[#224F10] text-[#EAFFD0]'
                    : 'bg-white border-[#224F10]/12 hover:border-[#224F10]/30 text-[#0D0D0D]/75'
                }`}
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#B0E454] ring-2 ring-white" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSelectSection('profile')}
              className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-white transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#224F10] text-[#B0E454] font-bold text-xs flex items-center justify-center ring-2 ring-[#B0E454]/50 shrink-0">
                {userInitials}
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-bold text-[#0D0D0D]">
                  {currentUser?.name}
                </p>
                <p className="text-[11px] text-[#0D0D0D]/55 truncate max-w-[160px]">
                  {currentUser?.email}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Vista de la pestaña elegida */}
        {renderActiveSection()}
      </div>
    </div>
  );
}
