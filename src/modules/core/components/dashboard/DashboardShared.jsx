import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

// Cartel reutilizable para mostrar mensajes de éxito o error dentro de las pestañas del panel
export function DashboardFeedback({ feedback, onClose }) {
  if (!feedback) {
    return null;
  }

  const isError = feedback.type === 'error';
  const colorClasses = isError
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-[#EAFFD0] border-[#224F10]/20 text-[#224F10]';

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs font-medium border ${colorClasses}`}
    >
      <div className="flex items-center gap-2">
        {isError ? (
          <AlertCircle className="w-4 h-4 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        )}
        <span>{feedback.text}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 hover:opacity-70 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// Tarjeta de métrica (KPI) compartida entre todas las pestañas del Dashboard
export function DashboardStatCard({
  title,
  value,
  subtitle,
  highlight = false,
  icon = null,
  topAction = null,
  footer = null,
  subtitleClassName = '',
  valueClassName = '',
}) {
  const valueClass = valueClassName
    ? `font-bold tracking-tight my-2 ${valueClassName}`
    : 'text-4xl font-bold tracking-tight my-2';
  const highlightSubtitleClass = subtitleClassName
    ? `text-[11px] ${subtitleClassName}`
    : 'text-[11px] text-[#EAFFD0]/75';
  const lightSubtitleClass = subtitleClassName
    ? `text-[11px] ${subtitleClassName}`
    : 'text-[11px] text-[#0D0D0D]/55';
  const lightValueClass = valueClassName
    ? `font-bold tracking-tight my-2 ${valueClassName}`
    : 'text-4xl font-bold tracking-tight text-[#0D0D0D] my-2';

  if (highlight) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-[#224F10] to-[#122B08] text-[#EAFFD0] p-5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#EAFFD0]/90">
            {title}
          </span>
          {topAction ? (
            topAction
          ) : icon ? (
            <span className="w-7 h-7 rounded-full bg-[#EAFFD0]/15 text-[#B0E454] flex items-center justify-center">
              {icon}
            </span>
          ) : null}
        </div>

        <p className={valueClass}>{value}</p>

        {footer ? (
          footer
        ) : (
          <span className={highlightSubtitleClass}>{subtitle}</span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#0D0D0D]/80">{title}</span>
        {topAction}
      </div>

      <p className={lightValueClass}>{value}</p>

      {footer ? (
        footer
      ) : (
        <span className={lightSubtitleClass}>{subtitle}</span>
      )}
    </div>
  );
}
