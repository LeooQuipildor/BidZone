import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Button } from './ui';

// Cartel de avisos informativos, de éxito, advertencia o error
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
    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${styles[type] || styles.info}`}>
      {icons[type] || icons.info}
      <div className="flex-1 text-xs sm:text-sm">
        {title && <p className="font-bold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-current opacity-70 hover:opacity-100 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Indicador de carga giratorio
export function Spinner({ label = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-9 h-9 border-3 border-[#224F10]/20 border-t-[#224F10] rounded-full animate-spin" />
      <p className="text-xs font-medium text-[#0D0D0D]/70">{label}</p>
    </div>
  );
}

// Ventana emergente reutilizable (se cierra con Escape o al tocar el fondo)
export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event) {
      if (event.key === 'Escape' && onClose) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[#EAFFD0] border border-[#224F10]/25 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#224F10]/15 pb-3 mb-4">
          <h3 className="text-2xl font-medium tracking-tight text-[#0D0D0D]">{title}</h3>
          <button
            type="button"
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

// Encabezado estándar para las vistas independientes del sistema
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-8 border-b border-[#224F10]/15">
      <div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#224F10] mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#224F10]" />
          BIDZONE PLATAFORMA
        </span>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0D0D0D]">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#0D0D0D]/65 mt-1.5 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// Tarjeta para mostrar errores de carga o permisos con botón de regreso
export function ErrorStateCard({ title, message, buttonLabel, onBack }) {
  return (
    <div className="max-w-xl mx-auto my-12">
      <Alert type="error" title={title}>{message}</Alert>
      {buttonLabel && onBack && (
        <Button variant="secondary" className="mt-4" onClick={onBack}>
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}

