import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/states/authStore';
import { useNotificationStore } from '../../notifications/states/notificationStore';
import { Button, Badge } from '../design-system/ui';
import {
  Gavel,
  LayoutDashboard,
  TrendingUp,
  AlertOctagon,
  Star,
  Users,
  Bell,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';

export function Layout({ children }) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const notifications = useNotificationStore((s) => s.notifications);

  const unreadCount = currentUser
    ? notifications.filter(
        (n) => Number(n.userId) === Number(currentUser.id) && !n.read
      ).length
    : 0;

  const navItems = [
    { to: '/auctions', label: 'Subastas', icon: Gavel, public: true },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/bids', label: 'Pujas', icon: TrendingUp },
    { to: '/reports', label: 'Reportes', icon: AlertOctagon },
    { to: '/reviews', label: 'Calificaciones', icon: Star },
    { to: '/users', label: 'Usuarios', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D0D] text-[#EAFFD0]">
      <header className="sticky top-0 z-40 border-b border-[#224F10]/80 bg-[#0D0D0D]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#B0E454] text-[#0D0D0D] flex items-center justify-center font-black shadow-md shadow-[#B0E454]/20 group-hover:scale-105 transition-transform">
                <Gavel className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-[#EAFFD0] leading-none">
                  Bid<span className="text-[#B0E454]">Zone</span>
                </span>
                <span className="text-[10px] text-[#EAFFD0]/55 uppercase tracking-widest">
                  Subastas en Vivo
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems
                .filter((item) => item.public || currentUser)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-[#B0E454] text-[#0D0D0D]'
                            : 'text-[#EAFFD0]/75 hover:text-[#B0E454] hover:bg-[#224F10]/30'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-xl bg-[#141A12] border border-[#224F10] hover:border-[#B0E454] text-[#EAFFD0] transition-colors"
                  title="Centro de Notificaciones"
                >
                  <Bell className="w-4 h-4 text-[#B0E454]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#B0E454] text-[#0D0D0D] text-[10px] font-black flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-[#224F10]">
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#EAFFD0] leading-tight">
                      {currentUser.name}
                    </p>
                    <Badge
                      variant={
                        currentUser.role === 'admin' ? 'lime' : 'default'
                      }
                      className="text-[10px] px-2 py-0"
                    >
                      {currentUser.role === 'admin' ? 'ADMIN' : 'USUARIO'}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    <LogIn className="w-4 h-4" />
                    Ingresar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    <UserPlus className="w-4 h-4" />
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile navigation bar */}
        {currentUser && (
          <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-[#224F10]/50 bg-[#141A12]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                      isActive
                        ? 'bg-[#B0E454] text-[#0D0D0D]'
                        : 'text-[#EAFFD0]/75 hover:text-[#B0E454]'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-[#224F10]/60 bg-[#0D0D0D] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#EAFFD0]/60">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#B0E454]">BidZone</span>
            <span>— Plataforma de Subastas Online en Tiempo Real</span>
          </div>
          <div>
            Grupo 8 · Moussa, Medina, Quipildor · Programación 4 (2026)
          </div>
        </div>
      </footer>
    </div>
  );
}

