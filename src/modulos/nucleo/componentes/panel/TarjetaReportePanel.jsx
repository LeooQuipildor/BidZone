/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/TarjetaReportePanel.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE COMPONENTE?
 * Es la tarjeta visual que representa un Ticket de Soporte y Mediación de Conflictos,
 * dando soporte a la Regla de Negocio RN06: "Mesa de Ayuda, Disputas y Sanciones".
 *
 * ¿POR QUÉ EXISTE Y CUÁL ES SU PROPÓSITO?
 * Cuando surge un problema en el trato directo posterior al cierre (por ejemplo,
 * el ganador no se presenta a pagar o el vendedor entrega un artículo roto),
 * los usuarios abren un ticket de reporte.
 *
 * Este componente permite:
 * 1. Para el Socio (denunciante o denunciado):
 *    - Ver el estado actual de su reclamo ('en_revision', 'resuelto_sancion', 'desestimado').
 *    - Ver la evidencia adjunta y los dictámenes emitidos.
 *    - Editar el texto de su reclamo mientras el ticket permanezca en revisión abierta.
 * 2. Para el Administrador:
 *    - Revisar ambas partes y el enlace a la subasta en cuestión.
 *    - Desplegar el panel de mediación interactivo (`PanelResolucionTicket`) para
 *      emitir una sanción (apercibimiento, suspensión, cierre) o desestimar el caso.
 *    - Eliminar tickets obsoletos.
 *
 * ¿DE DÓNDE PROVIENEN LAS PROPS?
 * - `reporte`: Objeto reporte individual de `tiendaReportes.js`.
 * - `tituloSubasta`: Título del lote asociado obtenido de `subastas`.
 * - `nombreDenunciante`: Nombre del usuario que abrió el ticket.
 * - `nombreDenunciado`: Nombre del usuario reportado.
 * - `estadoDenunciado`: Estado de la cuenta del acusado ('active', 'suspended', 'closed').
 * - `puedeEditarReclamo`: Booleano (solo el autor puede editarlo si sigue 'en_revision').
 * - `esAdmin`: Booleano indicando si la sesión actual tiene permisos de moderación.
 * - `estaAtendiendo`: Booleano que indica si el panel de resolución está desplegado.
 * - `alAtenderTicket`: Función para alternar la apertura/cierre del panel de resolución.
 * - `alEditarReclamo`: Función para abrir el formulario de edición del reclamo.
 * - `alEliminar`: Función para borrar el ticket.
 * - `panelResolucion`: Nodo JSX `<PanelResolucionTicket />` inyectado por el contenedor padre.
 * ==============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ExternalLink, MessageSquareCheck, ShieldAlert, Trash2 } from 'lucide-react';
import { formatearFechaHora } from '../../utilidades/formatos';

/**
 * Función auxiliar: obtenerInsigniaTicket
 * ----------------------------------------------------------------------------
 * Retorna el texto y la combinación de colores CSS para la insignia de estado del ticket.
 *
 * @param {string} estado - Estado del ticket ('en_revision', 'resuelto_sancion', 'desestimado').
 * @returns {{ texto: string, claseColor: string }}
 */
function obtenerInsigniaTicket(estado) {
  if (estado === 'resuelto_sancion') {
    return { texto: 'Cerrado · Sancionado', claseColor: 'bg-red-50 text-red-700 border-red-200' };
  }
  if (estado === 'en_revision') {
    return {
      texto: 'Ticket Abierto',
      claseColor: 'bg-[#B0E454]/40 text-[#0D0D0D] border-[#224F10]/15',
    };
  }
  return {
    texto: 'Cerrado · Solucionado',
    claseColor: 'bg-[#EAFFD0] text-[#224F10] border-[#224F10]/15',
  };
}

/**
 * Función auxiliar: obtenerTextoBotonAdmin
 * ----------------------------------------------------------------------------
 * Determina el texto adecuado para el botón del moderador según el estado del panel.
 */
function obtenerTextoBotonAdmin(estaAtendiendo, estado) {
  if (estaAtendiendo) return 'Cerrar panel';
  return estado === 'en_revision' ? 'Atender Ticket' : 'Cambiar resolución';
}

/**
 * Componente principal: TarjetaReportePanel
 * ----------------------------------------------------------------------------
 * Muestra el ticket completo con resumen de partes, motivo, descripción,
 * enlace de evidencia y las acciones disponibles según el rol.
 */
export function TarjetaReportePanel({
  reporte,
  tituloSubasta,
  nombreDenunciante,
  nombreDenunciado,
  estadoDenunciado,
  puedeEditarReclamo,
  esAdmin,
  estaAtendiendo = false,
  alAtenderTicket,
  alEditarReclamo,
  alEliminar,
  panelResolucion = null,
}) {
  const insignia = obtenerInsigniaTicket(reporte.status);
  const textoBotonAdmin = obtenerTextoBotonAdmin(estaAtendiendo, reporte.status);

  return (
    <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 space-y-4 shadow-2xs">
      {/* Cabecera del ticket: Insignia de estado, Número de ticket, Fecha y Botones de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#224F10]/8 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${insignia.claseColor}`}
          >
            <AlertOctagon className="w-3 h-3" />
            {insignia.texto}
          </span>
          <span className="text-[11px] font-semibold text-[#0D0D0D]/70">
            Ticket #{reporte.id}
          </span>
          <span className="text-[11px] text-[#0D0D0D]/50">
            · {formatearFechaHora(reporte.createdAt)}
          </span>
        </div>

        {/* Acciones de gestión */}
        <div className="flex items-center gap-1.5">
          {/* Botón para que el administrador atienda o modifique la resolución del ticket */}
          {esAdmin && (
            <button
              type="button"
              onClick={alAtenderTicket}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <MessageSquareCheck className="w-3.5 h-3.5" />
              {textoBotonAdmin}
            </button>
          )}

          {/* Botón para que el usuario que reportó edite los detalles si sigue abierto */}
          {!esAdmin && puedeEditarReclamo && (
            <button
              type="button"
              onClick={alEditarReclamo}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Editar reclamo
            </button>
          )}

          {/* Botón para eliminar el ticket (solo administradores) */}
          {esAdmin && (
            <button
              type="button"
              onClick={alEliminar}
              title="Eliminar ticket"
              className="w-7 h-7 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Cuerpo del ticket: Motivo principal y Descripción detallada */}
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-[#0D0D0D]">{reporte.reason}</h3>
        <p className="text-xs text-[#0D0D0D]/75 leading-relaxed">{reporte.description}</p>
        {reporte.evidenceUrl && (
          <a
            href={reporte.evidenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#224F10] hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Ver evidencia adjunta
          </a>
        )}
      </div>

      {/* Ficha técnica: Subasta vinculada, partes involucradas y dictamen administrativo actual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F7FBF3] p-3.5 rounded-xl border border-[#224F10]/10 text-xs">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/50 block">
            Subasta Involucrada
          </span>
          <Link
            to={`/subastas/${reporte.auctionId}`}
            className="font-semibold text-[#224F10] hover:underline"
          >
            {tituloSubasta}
          </Link>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/50 block">
            Reportó → Reportado
          </span>
          <strong className="text-[#0D0D0D]">
            {nombreDenunciante} →{' '}
            <span className="text-red-700">
              {nombreDenunciado}
              {estadoDenunciado ? ` (${estadoDenunciado})` : ''}
            </span>
          </strong>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/50 block">
            Dictamen Actual
          </span>
          <strong className="text-[#224F10] inline-flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{reporte.sanctionApplied}</span>
          </strong>
        </div>
      </div>

      {/* Renderizado condicional del panel de mediación interactivo para administradores */}
      {estaAtendiendo && panelResolucion}
    </div>
  );
}

