import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Plus, Search, User } from 'lucide-react';

const ENLACES_NAVEGACION = [
  { ruta: '/', etiqueta: 'Inicio', esPublico: true },
  { ruta: '/dashboard', etiqueta: 'Panel', esPublico: false },
];

// Barra de navegación superior (desktop y subbarra móvil)
export function Navbar({ esInicio, usuarioActual, cantidadSinLeer, alCerrarSesion }) {
  const navegar = useNavigate();
  const clasePosicionBarra = esInicio ? 'fixed top-0 left-0 right-0' : 'sticky top-0';
  const enlacesVisibles = ENLACES_NAVEGACION.filter(
    (item) => item.esPublico || Boolean(usuarioActual)
  );

  return (
    <div className={`w-full z-40 px-3 sm:px-6 pt-3 sm:pt-4 ${clasePosicionBarra}`}>
      <header className="max-w-[1480px] mx-auto bg-[#0D0D0D]/95 backdrop-blur-md text-[#EAFFD0] rounded-xl px-4 sm:px-7 h-14 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4 shadow-lg border border-[#224F10]/50">
        <div className="justify-self-start min-w-0">
          <nav className="hidden lg:flex items-center gap-6">
            {enlacesVisibles.map((item) => (
              <NavLink
                key={item.ruta}
                to={item.ruta}
                className={({ isActive }) =>
                  `inline-flex items-center text-xs font-medium transition-colors ${
                    isActive ? 'text-[#B0E454]' : 'text-[#EAFFD0]/85 hover:text-[#B0E454]'
                  }`
                }
              >
                <span>{item.etiqueta}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <Link
          to="/"
          className="justify-self-center font-serif-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#EAFFD0] hover:text-[#B0E454] transition-colors select-none"
        >
          BidZone
        </Link>

        <div className="justify-self-end flex items-center gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={() => navegar('/auctions')}
            title="Explorar subastas"
            className="hidden sm:inline-flex items-center gap-2 text-xs text-[#EAFFD0]/70 hover:text-[#EAFFD0] cursor-pointer"
          >
            <span className="hidden xl:inline">¿Qué artículo estás buscando?</span>
            <Search className="w-4 h-4 text-[#EAFFD0]" />
          </button>

          {usuarioActual ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard?tab=subastas&nuevo=1"
                className="hidden sm:inline-flex items-center gap-1 bg-[#224F10] hover:bg-[#B0E454] text-[#EAFFD0] hover:text-[#0D0D0D] px-3 py-1 rounded-full text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Publicar
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs text-[#EAFFD0] hover:text-[#B0E454]"
                title={`${usuarioActual.name} (${usuarioActual.role})`}
              >
                <User className="w-4 h-4" />
                <span className="hidden xl:inline font-medium">
                  {usuarioActual.name.split(' ')[0]}
                </span>
              </Link>
              <Link
                to="/dashboard?tab=notificaciones"
                className="relative inline-flex items-center text-[#EAFFD0] hover:text-[#B0E454]"
                title="Notificaciones"
              >
                <Bell className="w-4 h-4" />
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#B0E454] text-[#0D0D0D] text-[10px] font-bold leading-tight">
                  {cantidadSinLeer}
                </span>
              </Link>
              <button
                type="button"
                onClick={alCerrarSesion}
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

      {/* Subbarra en pantallas pequeñas */}
      <div className="lg:hidden max-w-[1480px] mx-auto mt-1.5 bg-[#224F10]/95 backdrop-blur-md rounded-xl px-3 py-2 flex items-center gap-3 overflow-x-auto text-xs text-[#EAFFD0]">
        {enlacesVisibles.map((item) => (
          <NavLink
            key={item.ruta}
            to={item.ruta}
            className={({ isActive }) =>
              `px-2.5 py-0.5 rounded-full shrink-0 ${
                isActive ? 'bg-[#B0E454] text-[#0D0D0D] font-semibold' : 'text-[#EAFFD0]/85'
              }`
            }
          >
            {item.etiqueta}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

