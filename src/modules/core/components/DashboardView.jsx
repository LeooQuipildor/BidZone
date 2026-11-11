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

  const effectivePrefill =
    sectionPrefill ||
    (openNewFromUrl ? { openCreate: true } : null);

  const handleSelectSection = (nextSection, prefillData = null) => {
    setSearchQuery('');
    setSectionPrefill(prefillData);
    setSectionSeed((prev) => prev + 1);

    if (location.pathname !== '/dashboard') {
      navigate(
        nextSection === 'overview'
          ? '/dashboard'
          : `/dashboard?tab=${nextSection}`,
        { replace: true }
      );
      return;
    }

    if (nextSection === 'overview') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab: nextSection }, { replace: true });
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const openReportsCount = reports.filter(
    (r) => r.status === 'en_revision'
  ).length;
  const unreadNotifications = notifications.filter(
    (n) => Number(n.userId) === Number(currentUser?.id) && !n.read
  );

  const menuSections = [
    {
      id: 'overview',
      label: 'Panel Principal',
      icon: LayoutDashboard,
    },
    {
      id: 'auctions',
      label: 'Subastas',
      icon: Gavel,
      badge: auctions.length,
      badgeVariant: 'dark',
    },
    {
      id: 'bids',
      label: 'Pujas',
      icon: TrendingUp,
      count: bids.length,
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: AlertOctagon,
      badge: openReportsCount > 0 ? openReportsCount : null,
      badgeVariant: 'lime',
    },
    {
      id: 'reviews',
      label: 'Reseñas',
      icon: Star,
      count: reviews.length,
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: Users,
      count: users.length,
    },
  ];

  const generalSections = [
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: Bell,
      badge: unreadNotifications.length > 0 ? unreadNotifications.length : null,
    },
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: UserIcon,
    },
  ];

  const searchPlaceholders = {
    overview: 'Buscar subasta, usuario o lote...',
    auctions: 'Buscar subasta por título o categoría...',
    bids: 'Buscar puja por lote, postor o nota...',
    reports: 'Buscar expediente, motivo o usuario...',
    reviews: 'Buscar reseña, autor o calificado...',
    users: 'Buscar usuario por nombre, correo o ciudad...',
    notifications: 'Buscar alertas y mensajes...',
    profile: 'Buscar en tu panel...',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userInitials = getInitials(currentUser?.name);

  return (
    <div className="rounded-[28px] bg-[#F7FBF3] border border-[#224F10]/12 shadow-sm overflow-hidden flex flex-col lg:flex-row">
      {/* =====================================================================
          LEFT SIDEBAR (Dynamic Section Switcher)
         ===================================================================== */}
      <aside className="w-full lg:w-60 shrink-0 bg-[#F1F8E9] border-b lg:border-b-0 lg:border-r border-[#224F10]/10 p-5 flex flex-col justify-between gap-6">
        <div className="space-y-6">
          {/* Brand */}
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
              {isAdmin ? 'Admin' : 'Socio'}
            </span>
          </div>

          {/* MENU Section */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0D0D0D]/40 px-3 pb-1.5">
              MENU
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
              {menuSections.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSection(item.id)}
                    className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#EAFFD0]/90 text-[#0D0D0D] font-semibold'
                        : 'text-[#0D0D0D]/65 hover:text-[#0D0D0D] hover:bg-white/70 font-medium'
                    }`}
                  >
                    {isActive && (
                      <span className="hidden lg:block absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#224F10]" />
                    )}
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#224F10]' : ''
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>

                    {item.badge !== undefined && item.badge !== null && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none shrink-0 ${
                          item.badgeVariant === 'dark'
                            ? 'bg-[#224F10] text-[#EAFFD0]'
                            : 'bg-[#B0E454] text-[#0D0D0D]'
                        }`}
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

          {/* GENERAL Section */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0D0D0D]/40 px-3 pb-1.5">
              GENERAL
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
              {generalSections.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSection(item.id)}
                    className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#EAFFD0]/90 text-[#0D0D0D] font-semibold'
                        : 'text-[#0D0D0D]/65 hover:text-[#0D0D0D] hover:bg-white/70 font-medium'
                    }`}
                  >
                    {isActive && (
                      <span className="hidden lg:block absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#224F10]" />
                    )}
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#224F10]' : ''
                        }`}
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

        {/* Bottom Promo Card */}
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

      {/* =====================================================================
          RIGHT MAIN DYNAMIC WORKSPACE
         ===================================================================== */}
      <div className="flex-1 p-5 sm:p-7 space-y-6 min-w-0">
        {/* Top Search & Profile Utility Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 bg-white border border-[#224F10]/12 rounded-2xl px-3.5 py-2 w-full sm:max-w-xs shadow-2xs">
            <Search className="w-4 h-4 text-[#0D0D0D]/45 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchPlaceholders[activeSection] || searchPlaceholders.overview
              }
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

        {/* Dynamic Subcategory Body (zero reload) */}
        {activeSection === 'overview' && (
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
        )}

        {activeSection === 'auctions' && (
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
        )}

        {activeSection === 'bids' && (
          <DashboardBidsTab
            key={`bids-${sectionSeed}`}
            currentUser={currentUser}
            users={users}
            auctions={auctions}
            bids={bids}
            searchQuery={searchQuery}
          />
        )}

        {activeSection === 'reports' && (
          <DashboardReportsTab
            key={`reports-${sectionSeed}`}
            currentUser={currentUser}
            users={users}
            auctions={auctions}
            reports={reports}
            searchQuery={searchQuery}
            prefill={effectivePrefill}
          />
        )}

        {activeSection === 'reviews' && (
          <DashboardReviewsTab
            key={`reviews-${sectionSeed}`}
            currentUser={currentUser}
            users={users}
            auctions={auctions}
            reviews={reviews}
            searchQuery={searchQuery}
            prefill={effectivePrefill}
          />
        )}

        {activeSection === 'users' && (
          <DashboardUsersTab
            key={`users-${sectionSeed}`}
            currentUser={currentUser}
            users={users}
            searchQuery={searchQuery}
          />
        )}

        {activeSection === 'notifications' && (
          <DashboardNotificationsTab
            key={`notifications-${sectionSeed}`}
            currentUser={currentUser}
            notifications={notifications}
            searchQuery={searchQuery}
          />
        )}

        {activeSection === 'profile' && (
          <DashboardProfileTab
            key={`profile-${sectionSeed}`}
            currentUser={currentUser}
            auctions={auctions}
            bids={bids}
          />
        )}
      </div>
    </div>
  );
}
