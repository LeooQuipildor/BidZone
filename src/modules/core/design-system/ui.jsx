import React from 'react';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#B0E454]/50';

  const variants = {
    primary:
      'bg-[#B0E454] text-[#0D0D0D] hover:bg-[#c1f06c] active:scale-[0.98] shadow-md shadow-[#B0E454]/10',
    secondary:
      'bg-[#224F10] text-[#EAFFD0] hover:bg-[#2c6615] border border-[#B0E454]/30',
    outline:
      'bg-transparent text-[#EAFFD0] border border-[#224F10] hover:border-[#B0E454] hover:text-[#B0E454]',
    danger:
      'bg-red-500/15 text-red-300 border border-red-500/40 hover:bg-red-500/25',
    ghost:
      'bg-transparent text-[#EAFFD0]/80 hover:text-[#B0E454] hover:bg-[#224F10]/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
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
          className="text-xs font-semibold uppercase tracking-wider text-[#EAFFD0]/80"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-xl bg-[#0D0D0D] border ${
          error ? 'border-red-500' : 'border-[#224F10]'
        } px-3.5 py-2.5 text-sm text-[#EAFFD0] placeholder-[#EAFFD0]/35 focus:border-[#B0E454] focus:outline-none focus:ring-1 focus:ring-[#B0E454] transition-colors`}
        {...props}
      />
      {helperText && !error && (
        <span className="text-xs text-[#EAFFD0]/50">{helperText}</span>
      )}
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
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
          className="text-xs font-semibold uppercase tracking-wider text-[#EAFFD0]/80"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-xl bg-[#0D0D0D] border ${
          error ? 'border-red-500' : 'border-[#224F10]'
        } px-3.5 py-2.5 text-sm text-[#EAFFD0] focus:border-[#B0E454] focus:outline-none focus:ring-1 focus:ring-[#B0E454] transition-colors`}
        {...props}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-[#0D0D0D] text-[#EAFFD0]"
          >
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, className = '', id, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wider text-[#EAFFD0]/80"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={4}
        className={`w-full rounded-xl bg-[#0D0D0D] border ${
          error ? 'border-red-500' : 'border-[#224F10]'
        } px-3.5 py-2.5 text-sm text-[#EAFFD0] placeholder-[#EAFFD0]/35 focus:border-[#B0E454] focus:outline-none focus:ring-1 focus:ring-[#B0E454] transition-colors`}
        {...props}
      />
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[#224F10]/60 text-[#EAFFD0] border border-[#B0E454]/30',
    lime: 'bg-[#B0E454] text-[#0D0D0D] font-bold',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    danger: 'bg-red-500/20 text-red-300 border border-red-500/40',
    muted: 'bg-white/5 text-[#EAFFD0]/60 border border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl bg-[#141A12] border border-[#224F10]/70 p-5 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Alert({ type = 'info', title, children, onClose }) {
  const styles = {
    info: 'bg-[#224F10]/30 border-[#B0E454]/40 text-[#EAFFD0]',
    success: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200',
    error: 'bg-red-950/60 border-red-500/50 text-red-200',
    warning: 'bg-amber-950/60 border-amber-500/50 text-amber-200',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-[#B0E454] shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${styles[type] || styles.info}`}
    >
      {icons[type] || icons.info}
      <div className="flex-1 text-sm">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-60 hover:opacity-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function Spinner({ label = 'Cargando datos...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-9 h-9 border-3 border-[#224F10] border-t-[#B0E454] rounded-full animate-spin" />
      <p className="text-sm text-[#EAFFD0]/70">{label}</p>
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#141A12] border border-[#224F10] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#224F10]/60 pb-3 mb-4">
          <h3 className="text-lg font-bold text-[#EAFFD0]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#EAFFD0]/60 hover:text-[#B0E454] hover:bg-[#224F10]/30 cursor-pointer"
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#224F10]/60">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#EAFFD0] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[#EAFFD0]/65 mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

