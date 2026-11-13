/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/Sidebar.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de barra lateral (Sidebar) de navegación dentro del Panel de Control.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Muestra la cabecera del panel con el logo de seguridad y la insignia del rol del usuario.
 * 2. Agrupa la navegación en dos secciones semánticas: "ACTIVIDAD" y "CUENTA".
 * 3. Renderiza cada enlace con su icono correspondiente, indicando visualmente cuál está activo.
 * 4. Muestra insignias dinámicas con contadores (ej: cantidad de subastas o notificaciones sin leer).
 * 5. Se adapta en pantallas móviles como una barra superior cuadrangular responsiva.
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * Son enviadas por `VistaPanelControl.jsx`:
 * - `seccionActiva`: Identificador de la pestaña activa ('resumen', 'subastas', etc.).
 * - `etiquetaRol`: Texto descriptivo del rol del usuario ('ADMINISTRADOR' o 'USUARIO').
 * - `seccionesMenu`, `seccionesCuenta`: Arreglos generados por `construirMenuPanel`.
 * - `alElegirSeccion`: Función callback para cambiar de pestaña.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Subcomponentes Locales de Presentación:
 *   `BotonSidebar` se define en este mismo archivo porque su diseño solo es relevante dentro del sidebar,
 *   evitando crear archivos diminutos innecesarios.
 * - Barra Lateral Responsiva:
 *   En desktop (`lg:`), se ubica a la izquierda con ancho fijo `w-60` y disposición vertical `flex-col`.
 *   En móviles, se expande horizontalmente en una cuadrícula de 2 columnas (`grid grid-cols-2`).
 */

import React from "react";
import { ShieldCheck } from "lucide-react";

/**
 * Componente interno `BotonSidebar`:
 * Renderiza un botón individual dentro de la lista de navegación.
 */
function BotonSidebar({ item, seccionActiva, alElegirSeccion }) {
  const Icono = item.icono;
  const estaActivo = seccionActiva === item.id;
  const estiloBoton = estaActivo
    ? "bg-[#EAFFD0]/90 text-[#0D0D0D] font-semibold"
    : "text-[#0D0D0D]/65 hover:text-[#0D0D0D] hover:bg-white/70 font-medium";
  const tieneInsignia = item.insignia !== undefined && item.insignia !== null;

  return (
    <button
      type="button"
      onClick={() => alElegirSeccion(item.id)}
      className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${estiloBoton}`}
    >
      {/* Indicador visual de línea vertical izquierda para la pestaña activa en pantallas grandes */}
      {estaActivo && (
        <span className="hidden lg:block absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#224F10]" />
      )}
      <span className="flex items-center gap-2.5 min-w-0">
        <Icono
          className={`w-4 h-4 shrink-0 ${estaActivo ? "text-[#224F10]" : ""}`}
        />
        <span className="truncate">{item.etiqueta}</span>
      </span>

      {/* Insignia destacada para alertas urgentes (ej: reportes o notificaciones pendientes) */}
      {tieneInsignia && (
        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none shrink-0 bg-[#B0E454] text-[#0D0D0D]">
          {item.insignia}
        </span>
      )}
      {/* Contador numérico de elementos si no hay una insignia urgente */}
      {item.cantidad !== undefined && !tieneInsignia && (
        <span className="text-[10px] font-bold text-[#224F10]/70 shrink-0">
          {item.cantidad}
        </span>
      )}
    </button>
  );
}

export function Sidebar({
  seccionActiva,
  etiquetaRol,
  seccionesMenu,
  seccionesCuenta,
  alElegirSeccion,
}) {
  return (
    <aside className="w-full lg:w-60 shrink-0 bg-[#F1F8E9] border-b lg:border-b-0 lg:border-r border-[#224F10]/10 p-5 space-y-6">
      {/* Cabecera del Sidebar con rol del usuario */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#224F10]" />
          <span className="text-sm font-bold text-[#0D0D0D]">Mi Panel</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#B0E454]/50 text-[#224F10] text-[10px] font-bold uppercase">
          {etiquetaRol}
        </span>
      </div>

      {/* Bloque 1: ACTIVIDAD OPERATIVA */}
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

      {/* Bloque 2: CUENTA Y PERFIL */}
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
