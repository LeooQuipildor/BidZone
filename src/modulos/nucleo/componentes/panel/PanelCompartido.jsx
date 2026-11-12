import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

// Encabezado común para todas las pestañas del panel (título, descripción y botón principal)
export function CabeceraSeccionPanel({ titulo, subtitulo, botonPrincipal = null }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">{titulo}</h1>
        <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">{subtitulo}</p>
      </div>
      {botonPrincipal}
    </div>
  );
}

// Botón redondeado estándar usado en las cabeceras de cada pestaña del panel
export function BotonPanel({ variante = 'primario', icono = null, alHacerClic, children }) {
  const claseColor =
    variante === 'secundario'
      ? 'bg-white hover:bg-[#EAFFD0] border border-[#224F10]/20 text-[#0D0D0D]'
      : 'bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] shadow-xs';

  return (
    <button
      type="button"
      onClick={alHacerClic}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors cursor-pointer self-start md:self-auto ${claseColor}`}
    >
      {icono}
      <span>{children}</span>
    </button>
  );
}

// Cartel para mostrar mensajes de éxito o error dentro de las pestañas del panel
export function AvisoPanel({ aviso, alCerrar }) {
  if (!aviso) return null;

  const esError = aviso.tipo === 'error';
  const clasesColor = esError
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-[#EAFFD0] border-[#224F10]/20 text-[#224F10]';

  return (
    <div className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs font-medium border ${clasesColor}`}>
      <div className="flex items-center gap-2">
        {esError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
        <span>{aviso.texto}</span>
      </div>
      <button type="button" onClick={alCerrar} className="p-1 hover:opacity-70 cursor-pointer">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// Mensaje centrado reutilizable cuando una lista del panel no tiene resultados
export function EstadoVacioPanel({ mensaje }) {
  return (
    <div className="rounded-2xl bg-white border border-[#224F10]/10 p-10 text-center text-xs text-[#0D0D0D]/60">
      {mensaje}
    </div>
  );
}

// Tarjeta de métrica (KPI) para el resumen del panel
function TarjetaEstadisticaPanel({ titulo, valor, subtitulo, destacada = false, accionSuperior = null }) {
  const claseCaja = destacada
    ? 'bg-gradient-to-br from-[#224F10] to-[#122B08] text-[#EAFFD0] shadow-sm'
    : 'bg-white border border-[#224F10]/10 shadow-2xs';
  const claseTitulo = destacada ? 'font-medium text-[#EAFFD0]/90' : 'font-semibold text-[#0D0D0D]/80';
  const claseValor = destacada ? 'text-4xl' : 'text-4xl text-[#0D0D0D]';
  const claseSub = destacada ? 'text-[#EAFFD0]/75' : 'text-[#0D0D0D]/55';

  return (
    <div className={`rounded-2xl p-5 flex flex-col justify-between ${claseCaja}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs ${claseTitulo}`}>{titulo}</span>
        {accionSuperior}
      </div>
      <p className={`font-bold tracking-tight my-2 ${claseValor}`}>{valor}</p>
      <span className={`text-[11px] ${claseSub}`}>{subtitulo}</span>
    </div>
  );
}

// Grilla uniforme de 4 tarjetas KPI en el resumen del panel
export function GridEstadisticasPanel({ tarjetas }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {tarjetas.map((tarjeta) => (
        <TarjetaEstadisticaPanel key={tarjeta.titulo} {...tarjeta} />
      ))}
    </div>
  );
}

// Contenedor desplegable compartido para mostrar el formulario crear/editar dentro del panel
export function ContenedorFormularioPanel({ titulo, alCerrar, children }) {
  return (
    <div className="rounded-2xl bg-white border border-[#224F10]/20 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-[#224F10]/10 pb-3">
        <h2 className="text-base font-bold text-[#0D0D0D]">{titulo}</h2>
        <button
          type="button"
          onClick={alCerrar}
          className="w-8 h-8 rounded-full bg-[#F7FBF3] hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  );
}
