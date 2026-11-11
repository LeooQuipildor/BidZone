import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, LogOut, ShieldCheck } from 'lucide-react';

// Botón individual reutilizado dentro del menú lateral del panel
function BotonSidebar({ item, seccionActiva, alElegirSeccion }) {
  const Icono = item.icono;
  const estaActivo = seccionActiva === item.id;
  const estiloBoton = estaActivo
    ? 'bg-[#EAFFD0]/90 text-[#0D0D0D] font-semibold'
    : 'text-[#0D0D0D]/65 hover:text-[#0D0D0D] hover:bg-white/70 font-medium';
  const estiloInsignia =
    item.varianteInsignia === 'oscuro'
      ? 'bg-[#224F10] text-[#EAFFD0]'
      : 'bg-[#B0E454] text-[#0D0D0D]';
  const tieneInsignia = item.insignia !== undefined && item.insignia !== null;

  return (
    <button
      type="button"
      onClick={() => alElegirSeccion(item.id)}
      className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${estiloBoton}`}
    >
      {estaActivo && (
        <span className="hidden lg:block absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#224F10]" />
      )}
      <span className="flex items-center gap-2.5 min-w-0">
        <Icono className={`w-4 h-4 shrink-0 ${estaActivo ? 'text-[#224F10]' : ''}`} />
        <span className="truncate">{item.etiqueta}</span>
      </span>

      {tieneInsignia && (
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none shrink-0 ${estiloInsignia}`}>
          {item.insignia}
        </span>
      )}
      {item.cantidad !== undefined && item.insignia === undefined && (
        <span className="text-[10px] font-bold text-[#224F10]/70 shrink-0">{item.cantidad}</span>
      )}
    </button>
  );
}

// Barra lateral izquierda (Sidebar) del Panel de Control
export function Sidebar({
  seccionActiva,
  etiquetaRol,
  seccionesMenu,
  seccionesGenerales,
  alElegirSeccion,
  alCerrarSesion,
}) {
  return (
    <aside className="w-full lg:w-60 shrink-0 bg-[#F1F8E9] border-b lg:border-b-0 lg:border-r border-[#224F10]/10 p-5 flex flex-col justify-between gap-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#224F10] text-[#B0E454] flex items-center justify-center shadow-2xs">
              <Gavel className="w-4 h-4" />
            </span>
            <span className="text-lg font-bold tracking-tight text-[#0D0D0D]">BidZone</span>
          </Link>
          <span className="px-2 py-0.5 rounded-full bg-[#B0E454]/40 text-[#224F10] text-[10px] font-bold uppercase">
            {etiquetaRol}
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0D0D0D]/40 px-3 pb-1.5">MENU</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
            {seccionesMenu.map((item) => (
              <BotonSidebar key={item.id} item={item} seccionActiva={seccionActiva} alElegirSeccion={alElegirSeccion} />
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0D0D0D]/40 px-3 pb-1.5">GENERAL</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
            {seccionesGenerales.map((item) => (
              <BotonSidebar key={item.id} item={item} seccionActiva={seccionActiva} alElegirSeccion={alElegirSeccion} />
            ))}
            <button
              type="button"
              onClick={alCerrarSesion}
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
        <div className="relative z-10 space-y-3">
          <span className="w-7 h-7 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#EAFFD0] leading-snug">Trato Directo RN05</p>
            <p className="text-[10px] text-[#EAFFD0]/65 leading-relaxed">
              Sin comisiones ocultas. Al ganar, coordinas directamente con tu contraparte.
            </p>
          </div>
          <button
            type="button"
            onClick={() => alElegirSeccion('subastas')}
            className="w-full py-2 rounded-full bg-[#224F10] hover:bg-[#B0E454] hover:text-[#0D0D0D] text-[#EAFFD0] text-[11px] font-semibold transition-colors cursor-pointer"
          >
            Explorar Lotes
          </button>
        </div>
      </div>
    </aside>
  );
}

