import React, { useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../auth/states/authStore';
import { useNotificationStore } from '../../notifications/states/notificationStore';
import { sameId } from '../utils/formatters';
import {
  Search,
  User,
  Bell,
  LogOut,
  Plus,
  ArrowRight,
  Phone,
  ShieldCheck,
} from 'lucide-react';

// Rutas que muestran el panel ancho en pantalla
const DASHBOARD_ROUTES = [
  '/dashboard',
  '/bids',
  '/reports',
  '/reviews',
  '/users',
  '/notifications',
];

const NAV_LINKS = [
  { to: '/', label: 'Inicio', public: true },
  { to: '/dashboard', label: 'Panel', public: false },
];

const FOOTER_MODULES = ['Subastas', 'Pujas', 'Reportes', 'Reseñas', 'Usuarios'];

export function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((s) => s.currentUser);
  const checkSession = useAuthStore((s) => s.checkSession);
  const logout = useAuthStore((s) => s.logout);
  const notifications = useNotificationStore((s) => s.notifications);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);

  // Al cargar la app, validamos la sesión si existe un token en localStorage
  useEffect(() => {
    if (localStorage.getItem('bidzone_token')) {
      checkSession();
    }
  }, [checkSession]);

  // Cuando el usuario inicia sesión, traemos sus notificaciones
  useEffect(() => {
    if (currentUser?.id) {
      fetchNotifications();
    }
  }, [currentUser?.id, fetchNotifications]);

  const isHome = location.pathname === '/';
  const isDashboard = DASHBOARD_ROUTES.includes(location.pathname);

  let unreadCount = 0;
  if (currentUser) {
    unreadCount = notifications.filter(
      (n) => sameId(n.userId, currentUser.id) && !n.read
    ).length;
  }

  const visibleNavLinks = NAV_LINKS.filter(
    (item) => item.public || Boolean(currentUser)
  );

  let mainClassName = 'flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-5 pb-12';
  if (isHome) {
    mainClassName = 'flex-1 w-full';
  } else if (isDashboard) {
    mainClassName =
      'flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-6 pt-5 pb-12';
  }

  const navbarPositionClass = isHome
    ? 'fixed top-0 left-0 right-0'
    : 'sticky top-0';

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#EAFFD0] text-[#0D0D0D]">
      {/* Barra de navegación superior */}
      <div className={`w-full z-40 px-3 sm:px-6 pt-3 sm:pt-4 ${navbarPositionClass}`}>
        <header className="max-w-[1480px] mx-auto bg-[#0D0D0D]/95 backdrop-blur-md text-[#EAFFD0] rounded-xl px-4 sm:px-7 h-14 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4 shadow-lg border border-[#224F10]/50">
          {/* Enlaces de la izquierda */}
          <div className="justify-self-start min-w-0">
            <nav className="hidden lg:flex items-center gap-6">
              {visibleNavLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => {
                    const colorClass = isActive
                      ? 'text-[#B0E454]'
                      : 'text-[#EAFFD0]/85 hover:text-[#B0E454]';
                    return `inline-flex items-center text-xs font-medium transition-colors ${colorClass}`;
                  }}
                >
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Logo centrado */}
          <Link
            to="/"
            className="justify-self-center font-serif-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#EAFFD0] hover:text-[#B0E454] transition-colors select-none"
          >
            BidZone
          </Link>

          {/* Buscador y acciones de usuario a la derecha */}
          <div className="justify-self-end flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={() => navigate('/auctions')}
              title="Explorar subastas"
              className="hidden sm:inline-flex items-center gap-2 text-xs text-[#EAFFD0]/70 hover:text-[#EAFFD0] cursor-pointer"
            >
              <span className="hidden xl:inline">¿Qué artículo estás buscando?</span>
              <Search className="w-4 h-4 text-[#EAFFD0]" />
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard?tab=auctions&new=1"
                  className="hidden sm:inline-flex items-center gap-1 bg-[#224F10] hover:bg-[#B0E454] text-[#EAFFD0] hover:text-[#0D0D0D] px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Publicar
                </Link>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs text-[#EAFFD0] hover:text-[#B0E454]"
                  title={`${currentUser.name} (${currentUser.role})`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden xl:inline font-medium">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </Link>

                <Link
                  to="/dashboard?tab=notifications"
                  className="relative inline-flex items-center text-[#EAFFD0] hover:text-[#B0E454]"
                  title="Notificaciones"
                >
                  <Bell className="w-4 h-4" />
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#B0E454] text-[#0D0D0D] text-[10px] font-bold leading-tight">
                    {unreadCount}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-[#EAFFD0]/70 hover:text-[#B0E454] cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Link
                  to="/login"
                  title="Ingresar"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#EAFFD0] hover:text-[#B0E454]"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Ingresar</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-3 py-1 rounded-full bg-[#B0E454] text-[#0D0D0D] text-xs font-semibold hover:bg-[#EAFFD0] transition-colors"
                >
                  Registro
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Subbarra de navegación para pantallas pequeñas */}
        <div className="lg:hidden max-w-[1480px] mx-auto mt-1.5 bg-[#224F10]/95 backdrop-blur-md rounded-xl px-3 py-2 flex items-center gap-3 overflow-x-auto text-xs text-[#EAFFD0]">
          {visibleNavLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => {
                const pillStyle = isActive
                  ? 'bg-[#B0E454] text-[#0D0D0D] font-semibold'
                  : 'text-[#EAFFD0]/85';
                return `px-2.5 py-0.5 rounded-full shrink-0 ${pillStyle}`;
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Contenido de cada página */}
      <main className={mainClassName}>{children}</main>

      {/* Pie de página */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pb-6">
        <footer className="rounded-[28px] bg-[#224F10] text-[#EAFFD0] p-7 sm:p-10 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 border-b border-[#EAFFD0]/15">
            <div className="lg:col-span-5 space-y-5">
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#EAFFD0] leading-snug max-w-sm">
                Participa en subastas con trato directo seguro
              </h3>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate('/auctions')}
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] text-[#0D0D0D] pl-5 pr-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Explorar lotes</span>
                  <span className="w-6 h-6 rounded-full bg-[#224F10] text-[#EAFFD0] flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>

                <span className="inline-flex items-center gap-2 text-xs text-[#EAFFD0]/85 font-medium">
                  <span className="w-7 h-7 rounded-full border border-[#EAFFD0]/25 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-[#B0E454]" />
                  </span>
                  +54 9 381 555-0199
                </span>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
              <div className="space-y-2.5">
                <p className="text-[11px] uppercase tracking-wider text-[#B0E454] font-semibold">
                  Plataforma
                </p>
                <ul className="space-y-2 text-[#EAFFD0]/80">
                  <li>
                    <Link to="/auctions" className="hover:text-[#B0E454]">
                      Catálogo de Lotes
                    </Link>
                  </li>
                  <li>
                    <Link to="/bids" className="hover:text-[#B0E454]">
                      Historial de Pujas
                    </Link>
                  </li>
                  <li>
                    <Link to="/reviews" className="hover:text-[#B0E454]">
                      Reseñas 1 a 5 ★
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports" className="hover:text-[#B0E454]">
                      Centro de Reportes
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5">
                <p className="text-[11px] uppercase tracking-wider text-[#B0E454] font-semibold">
                  Reglas de Negocio
                </p>
                <ul className="space-y-2 text-[#EAFFD0]/80">
                  <li>RN01 · Puja superadora</li>
                  <li>RN02 · Prohibición propia</li>
                  <li>RN05 · Liberación de datos</li>
                  <li>RN06 · Sanción de cuenta</li>
                </ul>
              </div>

              <div className="space-y-2.5 col-span-2 sm:col-span-1">
                <p className="text-[11px] uppercase tracking-wider text-[#B0E454] font-semibold">
                  Grupo 8 · Prog 4
                </p>
                <ul className="space-y-2 text-[#EAFFD0]/80">
                  <li>Mario Matías Moussa</li>
                  <li>Luciano Medina</li>
                  <li>Leandro Agustín Quipildor</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="py-5 border-b border-[#EAFFD0]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#EAFFD0]/10 border border-[#EAFFD0]/20 flex items-center justify-center text-[#B0E454]">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-[#EAFFD0]">
                  Sistema BidZone · Sin pasarelas ni billeteras virtuales
                </p>
                <p className="text-[11px] text-[#EAFFD0]/65">
                  Coordinación directa entre comprador y vendedor al cierre de
                  la subasta
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {FOOTER_MODULES.map((mod) => (
                <span
                  key={mod}
                  className="px-3.5 py-1 rounded-full border border-[#EAFFD0]/25 text-[11px] font-medium text-[#EAFFD0]/90"
                >
                  {mod}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#EAFFD0]/60">
            <span>
              © 2026 BidZone · Todos los derechos reservados · Programación 4
            </span>
            <span>Paleta Oficial: #B0E454 · #224F10 · #EAFFD0 · #0D0D0D</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
