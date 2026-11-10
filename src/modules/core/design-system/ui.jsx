import React from 'react';
import { X, AlertTriangle, CheckCircle2, Info, ChevronRight } from 'lucide-react';

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
  const baseStyles =
    'group inline-flex items-center justify-between gap-2.5 font-semibold rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';

  const variants = {
    primary:
      'bg-[#224F10] text-[#EAFFD0] hover:bg-[#0D0D0D] shadow-xs',
    secondary:
      'bg-[#B0E454] text-[#0D0D0D] hover:bg-[#224F10] hover:text-[#EAFFD0]',
    dark:
      'bg-[#0D0D0D] text-[#EAFFD0] hover:bg-[#224F10]',
    outline:
      'bg-white/85 text-[#0D0D0D] border border-[#224F10]/20 hover:border-[#224F10] hover:bg-white',
    danger:
      'bg-red-700 text-white hover:bg-red-800',
    ghost:
      'bg-transparent text-[#0D0D0D]/75 hover:text-[#224F10] hover:bg-[#224F10]/10',
  };

  const circleStyles = {
    primary: 'bg-[#EAFFD0] text-[#224F10] group-hover:bg-[#B0E454] group-hover:text-[#0D0D0D]',
    secondary: 'bg-[#0D0D0D] text-[#EAFFD0]',
    dark: 'bg-[#B0E454] text-[#0D0D0D]',
    outline: 'bg-[#224F10]/10 text-[#224F10]',
    danger: 'bg-white/20 text-white',
    ghost: 'bg-[#224F10]/10 text-[#224F10]',
  };

  const sizes = {
    sm: withArrow ? 'pl-3.5 pr-1 py-1 text-xs' : 'px-3.5 py-1.5 text-xs',
    md: withArrow ? 'pl-4 pr-1.5 py-1.5 text-xs sm:text-sm' : 'px-5 py-2.5 text-xs sm:text-sm',
    lg: withArrow ? 'pl-6 pr-1.5 py-1.5 text-sm' : 'px-7 py-3 text-sm',
  };

  const circleSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      <span className="inline-flex items-center gap-2">{children}</span>
      {withArrow && variant !== 'ghost' && (
        <span
          className={`rounded-full flex items-center justify-center shrink-0 transition-colors ${circleSizes[size] || circleSizes.md} ${circleStyles[variant] || circleStyles.primary}`}
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
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-[#0D0D0D]/80"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-2xl bg-white/90 border ${
          error ? 'border-red-600' : 'border-[#224F10]/20'
        } px-4 py-2.5 text-sm text-[#0D0D0D] placeholder-[#0D0D0D]/40 focus:border-[#224F10] focus:ring-2 focus:ring-[#B0E454]/50 focus:outline-none transition-all`}
        {...props}
      />
      {helperText && !error && (
        <span className="text-xs text-[#0D0D0D]/55">{helperText}</span>
      )}
      {error && (
        <span className="text-xs text-red-700 font-semibold">{error}</span>
      )}
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
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-[#0D0D0D]/80"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-2xl bg-white/90 border ${
          error ? 'border-red-600' : 'border-[#224F10]/20'
        } px-4 py-2.5 text-sm font-medium text-[#0D0D0D] focus:border-[#224F10] focus:ring-2 focus:ring-[#B0E454]/50 focus:outline-none transition-all`}
        {...props}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-[#EAFFD0] text-[#0D0D0D]"
          >
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-red-700 font-semibold">{error}</span>
      )}
    </div>
  );
}

export function Textarea({ label, error, className = '', id, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-[#0D0D0D]/80"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={4}
        className={`w-full rounded-2xl bg-white/90 border ${
          error ? 'border-red-600' : 'border-[#224F10]/20'
        } px-4 py-2.5 text-sm text-[#0D0D0D] placeholder-[#0D0D0D]/40 focus:border-[#224F10] focus:ring-2 focus:ring-[#B0E454]/50 focus:outline-none transition-all`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-700 font-semibold">{error}</span>
      )}
    </div>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[#224F10]/12 text-[#224F10]',
    lime: 'bg-[#B0E454] text-[#0D0D0D] font-bold',
    success: 'bg-[#224F10] text-[#EAFFD0]',
    warning: 'bg-[#B0E454] text-[#0D0D0D]',
    danger: 'bg-red-700 text-white',
    muted: 'bg-[#0D0D0D]/10 text-[#0D0D0D]/70',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${variants[variant] || variants.default} ${className}`}
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

export function Alert({ type = 'info', title, children, onClose }) {
  const styles = {
    info: 'bg-[#B0E454]/40 border-[#224F10]/30 text-[#0D0D0D]',
    success: 'bg-[#224F10] border-[#224F10] text-[#EAFFD0]',
    error: 'bg-[#0D0D0D] border-[#0D0D0D] text-[#B0E454]',
    warning: 'bg-[#B0E454] border-[#224F10]/40 text-[#0D0D0D]',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-[#224F10] shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-[#B0E454] shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-[#B0E454] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#0D0D0D] shrink-0" />,
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl border ${styles[type] || styles.info}`}
    >
      {icons[type] || icons.info}
      <div className="flex-1 text-xs sm:text-sm">
        {title && <p className="font-bold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function Spinner({ label = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-9 h-9 border-3 border-[#224F10]/20 border-t-[#224F10] rounded-full animate-spin" />
      <p className="text-xs font-medium text-[#0D0D0D]/70">{label}</p>
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl bg-[#EAFFD0] border border-[#224F10]/25 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#224F10]/15 pb-3 mb-4">
          <h3 className="text-2xl font-medium tracking-tight text-[#0D0D0D]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#0D0D0D]/70 hover:bg-[#224F10]/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-8 border-b border-[#224F10]/15">
      <div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#224F10] mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#224F10]" />
          BIDZONE PLATAFORMA
        </span>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0D0D0D]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#0D0D0D]/65 mt-1.5 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
