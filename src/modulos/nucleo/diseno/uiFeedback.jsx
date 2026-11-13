// ============================================================================
// ARCHIVO: src/modulos/nucleo/diseno/uiFeedback.jsx
// RESPONSABILIDAD: Componentes de retroalimentación visual al usuario (Feedback UI).
// ============================================================================
//
// ¿QUÉ ENCONTRAMOS AQUÍ?
// Elementos interactivos para comunicar estados del sistema:
// 1. 'Alert': Avisos informativos, confirmaciones de éxito, advertencias y errores.
// 2. 'Loading': Spinner animado durante peticiones asíncronas.
// 3. 'Modal': Diálogo emergente accesible (cierre con tecla Escape y clic en fondo oscuro).
// 4. 'ErrorCard': Tarjeta de bloqueo por error con botón de retorno.
// ============================================================================

import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { Button } from './ui';

/**
 * Componente: Alert
 * Muestra un banner visual con ícono y texto para alertar al usuario.
 * 
 * PROPS:
 * - 'type': Variante ('info', 'success', 'error', 'warning').
 * - 'title': Título opcional en negrita.
 * - 'children': Mensaje o contenido detallado del aviso.
 * - 'onClose': Callback opcional para mostrar una 'X' y permitir cerrarlo.
 */
export function Alert({ type = 'info', title, children, onClose }) {
  const estilos = {
    info: 'bg-[#B0E454]/40 border-[#224F10]/30 text-[#0D0D0D]',
    success: 'bg-[#224F10] border-[#224F10] text-[#EAFFD0]',
    error: 'bg-[#0D0D0D] border-[#0D0D0D] text-[#B0E454]',
    warning: 'bg-[#B0E454] border-[#224F10]/40 text-[#0D0D0D]',
  };

  const iconos = {
    info: <Info className="w-5 h-5 text-[#224F10] shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-[#B0E454] shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-[#B0E454] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#0D0D0D] shrink-0" />,
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${estilos[type] || estilos.info}`}>
      {iconos[type] || iconos.info}
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

/**
 * Componente: Loading
 * Rueda animada de carga con CSS 'animate-spin' para llamadas asíncronas.
 */
export function Loading({ text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-9 h-9 border-3 border-[#224F10]/20 border-t-[#224F10] rounded-full animate-spin" />
      <p className="text-xs font-medium text-[#0D0D0D]/70">{text}</p>
    </div>
  );
}

/**
 * Componente: Modal
 * Ventana emergente accesible (Overlay / Dialog).
 * 
 * CONCEPTOS CLAVE DE EVENTOS EN REACT Y JAVASCRIPT:
 * 1. 'Escape Key': Escucha el evento global 'keydown'. Si la persona presiona Escape, se llama a 'onClose()'.
 * 2. 'Limpieza del Event Listener': En el return del 'useEffect', se ejecuta 'removeEventListener'
 *    para no acumular escuchadores en el objeto 'window'.
 * 3. 'Propagación de Eventos (Event Bubbling)': El fondo oscuro ('backdrop') tiene un 'onClick={onClose}'.
 *    Para que al hacer clic DENTRO de la tarjeta blanca no se cierre el modal accidentalmente,
 *    se coloca 'evento.stopPropagation()' en el contenedor interno.
 */
export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    function manejarTecla(evento) {
      if (evento.key === 'Escape' && onClose) onClose();
    }
    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[#EAFFD0] border border-[#224F10]/25 p-6 shadow-2xl"
        onClick={(evento) => evento.stopPropagation()}
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

/**
 * Componente: ErrorCard
 * Tarjeta centrada para estados de error de carga de página con botón de regreso.
 */
export function ErrorCard({ title, message, backLabel, onBack }) {
  return (
    <div className="max-w-xl mx-auto my-12">
      <Alert type="error" title={title}>{message}</Alert>
      {backLabel && onBack && (
        <Button variant="secondary" className="mt-4" onClick={onBack}>
          {backLabel}
        </Button>
      )}
    </div>
  );
}

