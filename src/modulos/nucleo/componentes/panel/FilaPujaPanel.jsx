/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/FilaPujaPanel.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE COMPONENTE?
 * Es el componente de presentación encargado de renderizar una fila individual
 * en la lista de ofertas del usuario ("Mis Pujas") dentro del Panel de Control.
 *
 * ¿POR QUÉ EXISTE Y CUÁL ES SU PROPÓSITO?
 * Cumple con la Regla de Negocio RN04: "Ofertas Vinculantes e Irrevocables".
 * En una subasta en línea, cuando un postor realiza una oferta, asume un compromiso
 * formal de compra. Por lo tanto:
 * 1. El monto ofertado (`puja.amount`) NO puede cancelarse ni reducirse unilateralmente.
 * 2. Lo único que el postor puede actualizar es la "nota de coordinación" (`puja.note`),
 *    utilizada para indicar detalles de disponibilidad horaria o retiro al vendedor.
 * 3. Permite identificar visualmente de un vistazo si la puja es la "Oferta Líder"
 *    actual (la más alta que actualmente va ganando el lote).
 *
 * ¿DE DÓNDE PROVIENEN LAS PROPS?
 * - `puja`: Objeto puja individual ({ id, auctionId, bidderId, amount, note, createdAt })
 *   proveniente del store `tiendaPujas.js`.
 * - `tituloSubasta`: Nombre de la subasta vinculada, resuelto mediante `buscarPorId` en `subastas`.
 * - `nombrePostor`: Nombre del usuario logueado para generar sus iniciales gráficas.
 * - `esOfertaLider`: Booleano calculado comparando `Number(subasta.currentPrice) === Number(puja.amount)`.
 * - `alEditar`: Función callback que abre el formulario para editar la nota de coordinación.
 * ==============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Edit3, ExternalLink, Gavel } from 'lucide-react';
import { formatearFechaHora, formatearMoneda, obtenerIniciales } from '../../utilidades/formatos';

/**
 * Componente: FilaPujaPanel
 * ----------------------------------------------------------------------------
 * Renderiza la fila con formato responsivo (columna en móviles, fila horizontal en pantallas medianas).
 */
export function FilaPujaPanel({
  puja,
  tituloSubasta,
  nombrePostor,
  esOfertaLider,
  alEditar,
}) {
  return (
    <div className="p-4 sm:p-5 hover:bg-[#F7FBF3]/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Columna izquierda: Avatar de iniciales, Insignias y Datos de la puja */}
      <div className="flex items-start gap-3 min-w-0">
        {/* Avatar circular con color destacado si es la oferta que lidera la subasta */}
        <span
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
            esOfertaLider ? 'bg-[#224F10] text-[#B0E454]' : 'bg-[#EAFFD0] text-[#224F10]'
          }`}
        >
          {obtenerIniciales(nombrePostor, 'PU')}
        </span>

        <div className="min-w-0 space-y-1">
          {/* Fila de Insignia de estado y Título con enlace a la subasta */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                esOfertaLider ? 'bg-[#B0E454] text-[#0D0D0D]' : 'bg-[#F1F8E9] text-[#224F10]'
              }`}
            >
              {esOfertaLider ? 'Oferta Líder' : `Puja #${puja.id}`}
            </span>
            <Link
              to={`/subastas/${puja.auctionId}`}
              className="text-sm font-bold text-[#0D0D0D] hover:text-[#224F10] inline-flex items-center gap-1 truncate"
            >
              <Gavel className="w-3.5 h-3.5 text-[#224F10] shrink-0" />
              <span className="truncate">{tituloSubasta}</span>
              <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
            </Link>
          </div>

          {/* Nota de coordinación ingresada por el postor */}
          <p className="text-xs text-[#0D0D0D]/70">
            Nota: &ldquo;{puja.note || 'Sin nota adicional'}&rdquo;
          </p>

          {/* Fecha y recordatorio de compromiso legal RN04 */}
          <p className="text-[11px] text-[#0D0D0D]/50">
            {formatearFechaHora(puja.createdAt)} · Compromiso RN04 aceptado
          </p>
        </div>
      </div>

      {/* Columna derecha: Monto ofertado y botón para editar nota */}
      <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#224F10]/10 shrink-0">
        <div className="text-left sm:text-right">
          <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/45 block">
            Ofertado
          </span>
          <span className="text-xl font-bold text-[#224F10] tabular-nums">
            {formatearMoneda(puja.amount)}
          </span>
        </div>

        {/* Botón que dispara la edición de la nota (el monto no se edita por RN04) */}
        <button
          type="button"
          onClick={alEditar}
          title="Editar nota de coordinación"
          className="w-8 h-8 rounded-full border border-[#224F10]/15 hover:bg-[#EAFFD0] text-[#0D0D0D]/75 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

