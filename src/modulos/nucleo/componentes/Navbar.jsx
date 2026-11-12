import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Plus, Search, User, X } from 'lucide-react';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';

const ENLACES_IZQUIERDA = [
  { ruta: '/', etiqueta: 'Inicio' },
  { ruta: '/subastas', etiqueta: 'Explorar' },
  { ruta: '/reglamentos', etiqueta: 'Reglamentos' },
  { ruta: '/preguntas-frecuentes', etiqueta: 'Preguntas Frecuentes' },
];

// Campo buscador compartido entre la barra superior y el menú móvil
function BuscadorNavbar({ valor, alCambiar, alEnviar, claseExtra = '' }) {
  return (
    <form
      onSubmit={alEnviar}
      className={`flex items-center gap-1.5 rounded-full bg-white/10 border border-[#EAFFD0]/20 focus-within:border-[#B0E454] px-3 py-1 transition-colors ${claseExtra}`}
    >
      <input
        type="text"
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
        placeholder="Buscar artículo..."
        aria-label="Buscar artículo"
        className="w-full min-w-0 bg-transparent text-xs text-[#EAFFD0] placeholder-[#EAFFD0]/55 focus:outline-none"
      />
      {valor && (
        <button
          type="button"
          onClick={() => alCambiar('')}
          title="Limpiar búsqueda"
          className="text-[#EAFFD0]/60 hover:text-[#EAFFD0] shrink-0 cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <button
        type="submit"
        title="Buscar subastas"
        className="text-[#EAFFD0]/85 hover:text-[#B0E454] shrink-0 cursor-pointer"
      >
        <Search className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}

// Barra de navegación superior (desktop y subbarra móvil)
export function Navbar({ esInicio, usuarioActual, cantidadSinLeer, alCerrarSesion }) {
  const navegar = useNavigate();
  const textoBusqueda = usarTiendaSubastas((estado) => estado.filtros.busqueda);
  const actualizarFiltros = usarTiendaSubastas((estado) => estado.actualizarFiltros);

  const clasePosicionBarra = esInicio ? 'fixed top-0 left-0 right-0' : 'sticky top-0';
  const enlacesMovil = usuarioActual
    ? [...ENLACES_IZQUIERDA, { ruta: '/panel', etiqueta: 'Panel' }]
    : ENLACES_IZQUIERDA;

  function cambiarBusqueda(nuevoTexto) {
    actualizarFiltros({ busqueda: nuevoTexto });
  }

  function manejarBusqueda(evento) {
    evento.preventDefault();
    actualizarFiltros({ busqueda: textoBusqueda.trim() });
    navegar('/subastas');
  }

  return (
    <div className={`w-full z-40 px-3 sm:px-6 pt-3 sm:pt-4 ${clasePosicionBarra}`}>
      <header className="max-w-[1480px] mx-auto bg-[#0D0D0D]/95 backdrop-blur-md text-[#EAFFD0] rounded-xl px-4 sm:px-7 h-14 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4 shadow-lg border border-[#224F10]/50">
        <div className="justify-self-start min-w-0">
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5">
            {ENLACES_IZQUIERDA.map((item) => (
              <NavLink
                key={item.ruta}
                to={item.ruta}
                end={item.ruta === '/'}
                className={({ isActive }) =>
                  `inline-flex items-center text-xs font-medium whitespace-nowrap transition-colors ${
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

        <div className="justify-self-end flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <BuscadorNavbar
            valor={textoBusqueda}
            alCambiar={cambiarBusqueda}
            alEnviar={manejarBusqueda}
            claseExtra="hidden md:flex w-36 lg:w-44 xl:w-52"
          />

          {usuarioActual ? (
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <Link
                to="/panel?tab=subastas&nuevo=1"
                className="hidden sm:inline-flex items-center gap-1 bg-[#224F10] hover:bg-[#B0E454] text-[#EAFFD0] hover:text-[#0D0D0D] px-3 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Publicar
              </Link>
              <Link
                to="/panel"
                className="inline-flex items-center gap-1.5 text-xs text-[#EAFFD0] hover:text-[#B0E454] whitespace-nowrap"
                title={`${usuarioActual.name} (${usuarioActual.role}) — Ir al Panel`}
              >
                <User className="w-4 h-4" />
                <span className="hidden xl:inline font-medium">
                  {usuarioActual.name.split(' ')[0]}
                </span>
              </Link>
              <Link
                to="/panel?tab=notificaciones"
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
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                to="/iniciar-sesion"
                title="Ingresar"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#EAFFD0] hover:text-[#B0E454]"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Ingresar</span>
              </Link>
              <Link
                to="/registro"
                className="inline-flex items-center px-3 py-1 rounded-full bg-[#B0E454] text-[#0D0D0D] text-xs font-semibold hover:bg-[#EAFFD0] transition-colors"
              >
                Registro
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Subbarra en pantallas pequeñas */}
      <div className="lg:hidden max-w-[1480px] mx-auto mt-1.5 bg-[#224F10]/95 backdrop-blur-md rounded-xl px-3 py-2 space-y-2 text-xs text-[#EAFFD0]">
        <div className="flex items-center gap-2 overflow-x-auto">
          {enlacesMovil.map((item) => (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              end={item.ruta === '/'}
              className={({ isActive }) =>
                `px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap ${
                  isActive ? 'bg-[#B0E454] text-[#0D0D0D] font-semibold' : 'text-[#EAFFD0]/85'
                }`
              }
            >
              {item.etiqueta}
            </NavLink>
          ))}
        </div>

        <BuscadorNavbar
          valor={textoBusqueda}
          alCambiar={cambiarBusqueda}
          alEnviar={manejarBusqueda}
          claseExtra="md:hidden w-full bg-[#0D0D0D]/35"
        />
      </div>
    </div>
  );
}
