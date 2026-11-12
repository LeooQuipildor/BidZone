import React from 'react';
import { ShieldCheck } from 'lucide-react';

// Botón individual del menú lateral del panel
function BotonSidebar({ item, seccionActiva, alElegirSeccion }) {
  const Icono = item.icono;
  const estaActivo = seccionActiva === item.id;
  const estiloBoton = estaActivo
    ? 'bg-[#EAFFD0]/90 text-[#0D0D0D] font-semibold'
    : 'text-[#0D0D0D]/65 hover:text-[#0D0D0D] hover:bg-white/70 font-medium';
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
        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none shrink-0 bg-[#B0E454] text-[#0D0D0D]">
          {item.insignia}
        </span>
      )}
      {item.cantidad !== undefined && !tieneInsignia && (
        <span className="text-[10px] font-bold text-[#224F10]/70 shrink-0">{item.cantidad}</span>
      )}
    </button>
  );
}

// Barra lateral izquierda simplificada del Panel de Control
export function Sidebar({
  seccionActiva,
  etiquetaRol,
  seccionesMenu,
  seccionesCuenta,
  alElegirSeccion,
}) {
  return (
    <aside className="w-full lg:w-60 shrink-0 bg-[#F1F8E9] border-b lg:border-b-0 lg:border-r border-[#224F10]/10 p-5 space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#224F10]" />
          <span className="text-sm font-bold text-[#0D0D0D]">Mi Panel</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#B0E454]/50 text-[#224F10] text-[10px] font-bold uppercase">
          {etiquetaRol}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#0D0D0D]/40 px-3 pb-1">
          ACTIVIDAD
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
          {seccionesMenu.map((item) => (
            <BotonSidebar
              key={item.id}
              item={item}
              seccionActiva={seccionActiva}
              alElegirSeccion={alElegirSeccion}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#0D0D0D]/40 px-3 pb-1">
          CUENTA
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
          {seccionesCuenta.map((item) => (
            <BotonSidebar
              key={item.id}
              item={item}
              seccionActiva={seccionActiva}
              alElegirSeccion={alElegirSeccion}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
