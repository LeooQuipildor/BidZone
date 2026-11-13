/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/TarjetasResumenPanel.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Contiene tarjetas especializadas para la pestaña de Resumen (`TabResumenPanel`):
 * 1. `TarjetaProximoCierre`: Muestra en tiempo real el lote más próximo a concluir con su cuenta regresiva.
 * 2. `TarjetaSubastasRecientes`: Lista compacta con las subastas más recientes (personales o globales).
 *
 * ¿QUÉ HACEN ESTOS COMPONENTES?
 * - `TarjetaProximoCierre`: Crea sentido de urgencia en el usuario mostrando la subasta activa con menor
 *   tiempo restante y permitiéndole entrar a la sala con un solo clic.
 * - `TarjetaSubastasRecientes`: Permite una inspección rápida de los lotes recientes sin cambiar de pestaña.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Degradados Estilísticos en Tailwind (`bg-gradient-to-br from-... via-... to-...`):
 *   Genera un fondo visualmente inmersivo en verde oscuro y negro que destaca esta tarjeta del resto de la interfaz.
 * - Tabular Nums para Relojes (`tabular-nums`):
 *   Garantiza que todos los números tengan el mismo ancho tipográfico para que el texto no "baile" o tiemble
 *   al cambiar los dígitos cada segundo.
 */

import React from 'react';
import { Clock, Gavel, Tag } from 'lucide-react';
import { formatearMoneda } from '../../utilidades/formatos';

/**
 * Tarjeta destacada con el próximo cierre de subasta en vivo.
 *
 * @param {Object} props
 * @param {Object|null} props.subasta - Objeto de la subasta más próxima a vencer.
 * @param {string} props.cuentaRegresiva - Texto formateado con el tiempo restante.
 * @param {Function} props.alAccionar - Callback al hacer clic en el botón de la tarjeta.
 */
export function TarjetaProximoCierre({ subasta, cuentaRegresiva, alAccionar }) {
  return (
    <div className="lg:col-span-6 rounded-2xl bg-gradient-to-br from-[#0D0D0D] via-[#132B08] to-[#224F10] text-[#EAFFD0] p-5 flex flex-col justify-between shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-white">Próximo Cierre en Vivo</h2>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0D0D0D] bg-[#B0E454] px-2.5 py-0.5 rounded-full">
          EN VIVO
        </span>
      </div>

      {subasta ? (
        <div className="my-4 space-y-2">
          <p className="text-lg font-bold text-white leading-snug line-clamp-2">{subasta.title}</p>
          <p className="text-xl font-bold tracking-wider tabular-nums text-[#B0E454] flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{cuentaRegresiva}</span>
          </p>
          <p className="text-xs text-[#EAFFD0]/80">
            Oferta líder:{' '}
            <strong className="text-white">{formatearMoneda(subasta.currentPrice)}</strong>
          </p>
        </div>
      ) : (
        <div className="my-4">
          <p className="text-sm font-semibold text-white">No hay subastas activas pendientes</p>
          <p className="text-xs text-[#EAFFD0]/70 mt-1">
            Publica un artículo para iniciar una nueva sala en vivo.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={alAccionar}
        className="w-full py-2.5 px-4 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] text-[#0D0D0D] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Gavel className="w-3.5 h-3.5" />
        <span>{subasta ? 'Entrar a la Sala' : 'Publicar Subasta'}</span>
      </button>
    </div>
  );
}

/**
 * Listado compacto de subastas recientes para el panel.
 *
 * @param {Object} props
 * @param {string} props.titulo - Título del bloque.
 * @param {Array} props.subastas - Subastas a listar.
 * @param {Function} props.alAbrirSubasta - Callback al hacer clic en un lote.
 */
export function TarjetaSubastasRecientes({ titulo, subastas, alAbrirSubasta }) {
  return (
    <div className="lg:col-span-6 rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
      <div className="flex items-center justify-between gap-2 pb-3">
        <h2 className="text-sm font-bold text-[#0D0D0D]">{titulo}</h2>
        <span className="text-[11px] font-medium text-[#0D0D0D]/50">{subastas.length} recientes</span>
      </div>

      <div className="space-y-2 flex-1">
        {subastas.length === 0 ? (
          <p className="text-xs text-[#0D0D0D]/55 py-8 text-center">
            No hay subastas para mostrar con este filtro.
          </p>
        ) : (
          subastas.map((subasta) => {
            const estadoTexto = subasta.status === 'activa' ? 'En subasta' : 'Finalizada';
            return (
              <button
                key={subasta.id}
                type="button"
                onClick={() => alAbrirSubasta(subasta.id)}
                className="w-full flex items-center gap-2.5 text-left hover:bg-[#F7FBF3] p-2 rounded-xl transition-colors cursor-pointer"
              >
                <span className="w-7 h-7 rounded-lg bg-[#EAFFD0] text-[#224F10] flex items-center justify-center shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#0D0D0D] truncate">{subasta.title}</p>
                  <p className="text-[10px] text-[#0D0D0D]/55 truncate">
                    {formatearMoneda(subasta.currentPrice)} · {estadoTexto}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
