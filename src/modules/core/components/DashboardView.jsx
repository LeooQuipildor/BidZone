import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../auth/states/authStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useBidStore } from '../../bids/states/bidStore';
import { useReportStore } from '../../reports/states/reportStore';
import { useReviewStore } from '../../reviews/states/reviewStore';
import { useNotificationStore } from '../../notifications/states/notificationStore';
import { sameId } from '../utils/formatters';
import { DashboardSidebar } from './dashboard/DashboardSidebar';
import { DashboardHeader } from './dashboard/DashboardHeader';
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

  // Al entrar al panel cargamos todos los módulos necesarios
  useEffect(() => {
    fetchUsers();
    fetchAuctions();
    fetchBids();
    fetchReports();
    fetchReviews();
    fetchNotifications();
  }, [fetchUsers, fetchAuctions, fetchBids, fetchReports, fetchReviews, fetchNotifications]);

  // Reloj de 1 segundo para actualizar los contadores en vivo
  useEffect(() => {
    if (trackerPaused) return;
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [trackerPaused]);

  const tabFromUrl = searchParams.get('tab');
  const openNewFromUrl = searchParams.get('new') === '1';
  const activeSection = tabFromUrl || initialSection || 'overview';
  const effectivePrefill = sectionPrefill || (openNewFromUrl ? { openCreate: true } : null);

  function handleSelectSection(nextSection, prefillData = null) {
    setSearchQuery('');
    setSectionPrefill(prefillData);
    setSectionSeed((prev) => prev + 1);

    if (location.pathname !== '/dashboard') {
      navigate(nextSection === 'overview' ? '/dashboard' : `/dashboard?tab=${nextSection}`, { replace: true });
      return;
    }
    setSearchParams(nextSection === 'overview' ? {} : { tab: nextSection }, { replace: true });
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  const openReportsCount = reports.filter((r) => r.status === 'en_revision').length;
  const unreadNotifications = notifications.filter((n) => sameId(n.userId, currentUser?.id) && !n.read);

  const menuSections = [
    { id: 'overview', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'auctions', label: 'Subastas', icon: Gavel, badge: auctions.length, badgeVariant: 'dark' },
    { id: 'bids', label: 'Pujas', icon: TrendingUp, count: bids.length },
    { id: 'reports', label: 'Reportes', icon: AlertOctagon, badge: openReportsCount || null },
    { id: 'reviews', label: 'Reseñas', icon: Star, count: reviews.length },
    { id: 'users', label: 'Usuarios', icon: Users, count: users.length },
  ];

  const generalSections = [
    { id: 'notifications', label: 'Notificaciones', icon: Bell, badge: unreadNotifications.length || null },
    { id: 'profile', label: 'Mi Perfil', icon: UserIcon },
  ];

  const shared = { currentUser, users, auctions, searchQuery };

  function renderActiveSection() {
    switch (activeSection) {
      case 'overview':
        return (
          <DashboardOverviewTab
            {...shared}
            bids={bids}
            reports={reports}
            nowMs={nowMs}
            trackerPaused={trackerPaused}
            onTogglePause={() => setTrackerPaused((p) => !p)}
            onSelectSection={handleSelectSection}
          />
        );
      case 'auctions':
        return <DashboardAuctionsTab key={`auctions-${sectionSeed}-${openNewFromUrl ? 'new' : 'list'}`} {...shared} bids={bids} nowMs={nowMs} prefill={effectivePrefill} />;
      case 'bids':
        return <DashboardBidsTab key={`bids-${sectionSeed}`} {...shared} bids={bids} />;
      case 'reports':
        return <DashboardReportsTab key={`reports-${sectionSeed}`} {...shared} reports={reports} prefill={effectivePrefill} />;
      case 'reviews':
        return <DashboardReviewsTab key={`reviews-${sectionSeed}`} {...shared} reviews={reviews} prefill={effectivePrefill} />;
      case 'users':
        return <DashboardUsersTab key={`users-${sectionSeed}`} {...shared} />;
      case 'notifications':
        return <DashboardNotificationsTab key={`notifications-${sectionSeed}`} currentUser={currentUser} notifications={notifications} searchQuery={searchQuery} />;
      case 'profile':
        return <DashboardProfileTab key={`profile-${sectionSeed}`} currentUser={currentUser} auctions={auctions} bids={bids} />;
      default:
        return null;
    }
  }

  return (
    <div className="rounded-[28px] bg-[#F7FBF3] border border-[#224F10]/12 shadow-sm overflow-hidden flex flex-col lg:flex-row">
      <DashboardSidebar
        activeSection={activeSection}
        roleLabel={currentUser?.role === 'admin' ? 'Admin' : 'Socio'}
        menuSections={menuSections}
        generalSections={generalSections}
        onSelectSection={handleSelectSection}
        onLogout={handleLogout}
      />

      <div className="flex-1 p-5 sm:p-7 space-y-6 min-w-0">
        <DashboardHeader
          activeSection={activeSection}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          unreadCount={unreadNotifications.length}
          currentUser={currentUser}
          onSelectSection={handleSelectSection}
        />

        {renderActiveSection()}
      </div>
    </div>
  );
}
