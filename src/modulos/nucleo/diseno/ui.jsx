import React from 'react';
import { ChevronRight } from 'lucide-react';

// ============================================================================
// Componentes UI básicos reutilizados en toda la aplicación BidZone
// ============================================================================

const CLASES_VARIANTE_BOTON = {
  primary: 'bg-[#224F10] text-[#EAFFD0] hover:bg-[#0D0D0D] shadow-xs',
  secondary: 'bg-[#B0E454] text-[#0D0D0D] hover:bg-[#224F10] hover:text-[#EAFFD0]',
  dark: 'bg-[#0D0D0D] text-[#EAFFD0] hover:bg-[#224F10]',
  outline: 'bg-white/85 text-[#0D0D0D] border border-[#224F10]/20 hover:border-[#224F10] hover:bg-white',
  danger: 'bg-red-700 text-white hover:bg-red-800',
  ghost: 'bg-transparent text-[#0D0D0D]/75 hover:text-[#224F10] hover:bg-[#224F10]/10',
};

const CLASES_CIRCULO_BOTON = {
  primary: 'bg-[#EAFFD0] text-[#224F10] group-hover:bg-[#B0E454] group-hover:text-[#0D0D0D]',
  secondary: 'bg-[#0D0D0D] text-[#EAFFD0]',
  dark: 'bg-[#B0E454] text-[#0D0D0D]',
  outline: 'bg-[#224F10]/10 text-[#224F10]',
  danger: 'bg-white/20 text-white',
  ghost: 'bg-[#224F10]/10 text-[#224F10]',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  withArrow = true,
  onClick,
  ...props
}) {
  const estilosBase =
    'group inline-flex items-center justify-between gap-2.5 font-semibold rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';

  let claseTamano = 'pl-4 pr-1.5 py-1.5 text-xs sm:text-sm';
  let claseCirculo = 'w-6 h-6';

  if (size === 'sm') {
    claseTamano = withArrow ? 'pl-3.5 pr-1 py-1 text-xs' : 'px-3.5 py-1.5 text-xs';
    claseCirculo = 'w-5 h-5';
  } else if (size === 'lg') {
    claseTamano = withArrow ? 'pl-6 pr-1.5 py-1.5 text-sm' : 'px-7 py-3 text-sm';
    claseCirculo = 'w-7 h-7';
  } else if (!withArrow) {
    claseTamano = 'px-5 py-2.5 text-xs sm:text-sm';
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${estilosBase} ${CLASES_VARIANTE_BOTON[variant] || CLASES_VARIANTE_BOTON.primary} ${claseTamano} ${className}`}
      {...props}
    >
      <span className="inline-flex items-center gap-2">{children}</span>
      {withArrow && variant !== 'ghost' && (
        <span
          className={`rounded-full flex items-center justify-center shrink-0 transition-colors ${claseCirculo} ${CLASES_CIRCULO_BOTON[variant] || CLASES_CIRCULO_BOTON.primary}`}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      )}
    </button>
  );
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) {
  const claseBorde = error ? 'border-red-600' : 'border-[#224F10]/20';
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-[#0D0D0D]/80">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-2xl bg-white/90 border ${claseBorde} px-4 py-2.5 text-sm text-[#0D0D0D] placeholder-[#0D0D0D]/40 focus:border-[#224F10] focus:ring-2 focus:ring-[#B0E454]/50 focus:outline-none transition-all`}
        {...props}
      />
      {helperText && !error && <span className="text-xs text-[#0D0D0D]/55">{helperText}</span>}
      {error && <span className="text-xs text-red-700 font-semibold">{error}</span>}
    </div>
  );
}

export function Select({
  label,
  error,
  options = [],
  className = '',
  id,
  ...props
}) {
  const claseBorde = error ? 'border-red-600' : 'border-[#224F10]/20';
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-[#0D0D0D]/80">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-2xl bg-white/90 border ${claseBorde} px-4 py-2.5 text-sm font-medium text-[#0D0D0D] focus:border-[#224F10] focus:ring-2 focus:ring-[#B0E454]/50 focus:outline-none transition-all`}
        {...props}
      >
        {options.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor} className="bg-[#EAFFD0] text-[#0D0D0D]">
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-700 font-semibold">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, className = '', id, ...props }) {
  const claseBorde = error ? 'border-red-600' : 'border-[#224F10]/20';
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-[#0D0D0D]/80">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={4}
        className={`w-full rounded-2xl bg-white/90 border ${claseBorde} px-4 py-2.5 text-sm text-[#0D0D0D] placeholder-[#0D0D0D]/40 focus:border-[#224F10] focus:ring-2 focus:ring-[#B0E454]/50 focus:outline-none transition-all`}
        {...props}
      />
      {error && <span className="text-xs text-red-700 font-semibold">{error}</span>}
    </div>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const estilos = {
    default: 'bg-[#224F10]/12 text-[#224F10]',
    lime: 'bg-[#B0E454] text-[#0D0D0D] font-bold',
    success: 'bg-[#224F10] text-[#EAFFD0]',
    warning: 'bg-[#B0E454] text-[#0D0D0D]',
    danger: 'bg-red-700 text-white',
    soft: 'bg-[#0D0D0D]/10 text-[#0D0D0D]/70',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${estilos[variant] || estilos.default} ${className}`}
    >
      {children}
    </span>
  );
}

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-3xl bg-white/80 text-[#0D0D0D] border border-[#224F10]/12 p-6 shadow-2xs ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

