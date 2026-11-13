/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/TabNotificacionesPanel.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE COMPONENTE?
 * Es la pestaña "Mis Notificaciones" del Panel de Control de BidZone.
 *
 * ¿POR QUÉ EXISTE Y CUÁL ES SU PROPÓSITO?
 * Actúa como la bandeja de entrada de alertas personales del usuario conectado:
 * - Le notifica cuando una de sus subastas finaliza y se adjudica (RN05).
 * - Le avisa cuando es superado en una puja (outbid) en una subasta activa (RN04).
 * - Le informa cuando un ticket de mediación o reporte recibe una resolución (RN06).
 * - Le avisa cuando recibe una nueva calificación y comentario de reputación (RN07).
 *
 * Características clave:
 * 1. Privacidad estricta: Solo muestra avisos dirigidos al `id` del usuario conectado.
 * 2. Estado de lectura: Diferencia visualmente entre notificaciones leídas y no leídas
 *    (insignia "Nueva" y fondo contrastado).
 * 3. Acciones rápidas:
 *    - "Marcar leída": actualiza individualmente el flag `read: true`.
 *    - "Marcar todas como leídas": actualiza en lote todas las notificaciones pendientes.
 *    - "Eliminar": borra permanentemente la notificación del registro.
 * 4. Navegación directa: Si el aviso está vinculado a una subasta (`item.auctionId`),
 *    proporciona un enlace directo para abrir el detalle del lote.
 *
 * ¿DE DÓNDE PROVIENEN LAS PROPS?
 * - `usuarioActual`: Sesión activa de `tiendaAutenticacion.js`.
 * - `notificaciones`: Lista global de avisos de `tiendaNotificaciones.js`.
 * - `textoBusqueda`: Filtro textual de la barra de búsqueda del Header.
 * ==============================================================================
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, ExternalLink, Trash2 } from 'lucide-react';
import { usarTiendaNotificaciones } from '../../../notificaciones/estado/tiendaNotificaciones';
import { formatearFechaHora } from '../../utilidades/formatos';
import { coincideConBusqueda, mismoId } from '../../utilidades/ayudas';
import {
  AvisoPanel,
  BotonPanel,
  CabeceraSeccionPanel,
  EstadoVacioPanel,
} from './PanelCompartido';

/**
 * Subcomponente: FilaNotificacion
 * ----------------------------------------------------------------------------
 * Renderiza una fila individual con icono de campana, título, mensaje, fecha,
 * enlace opcional al lote y botones para marcar como leída o eliminar.
 */
function FilaNotificacion({ item, alMarcarLeida, alEliminar }) {
  const sinLeer = !item.read;

  return (
    <div
      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        sinLeer ? 'bg-[#F7FBF3]/80' : 'bg-white'
      }`}
    >
      {/* Columna izquierda: Icono, Título, Mensaje y Metadatos */}
      <div className="flex items-start gap-3.5 min-w-0">
        <span
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
            sinLeer ? 'bg-[#224F10] text-[#B0E454]' : 'bg-[#F1F8E9] text-[#224F10]/60'
          }`}
        >
          <Bell className="w-4 h-4" />
        </span>

        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-[#0D0D0D]">{item.title}</h3>
            {sinLeer && (
              <span className="px-2 py-0.5 rounded-full bg-[#B0E454] text-[#0D0D0D] text-[10px] font-bold">
                Nueva
              </span>
            )}
          </div>
          <p className="text-xs text-[#0D0D0D]/75">{item.message}</p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#0D0D0D]/45">
            <span>{formatearFechaHora(item.createdAt)}</span>
            {item.auctionId && (
              <Link
                to={`/subastas/${item.auctionId}`}
                className="inline-flex items-center gap-1 font-semibold text-[#224F10] hover:underline"
              >
                <span>Ver subasta #{item.auctionId}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Columna derecha: Botón para marcar leída y botón de eliminación */}
      <div className="flex items-center justify-end gap-2 shrink-0">
        {sinLeer && (
          <button
            type="button"
            onClick={alMarcarLeida}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#224F10] text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            Marcar leída
          </button>
        )}
        <button
          type="button"
          onClick={alEliminar}
          title="Eliminar notificación"
          className="w-8 h-8 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Componente principal: TabNotificacionesPanel
 * ----------------------------------------------------------------------------
 * Renderiza la bandeja de notificaciones personales del usuario conectado.
 */
export function TabNotificacionesPanel({ usuarioActual, notificaciones, textoBusqueda }) {
  // Acciones asíncronas del store de Zustand `tiendaNotificaciones.js`
  const marcarComoLeida = usarTiendaNotificaciones((estado) => estado.marcarComoLeida);
  const marcarTodasComoLeidas = usarTiendaNotificaciones((estado) => estado.marcarTodasComoLeidas);
  const eliminarNotificacion = usarTiendaNotificaciones((estado) => estado.eliminarNotificacion);

  const [mensajeError, setMensajeError] = useState('');

  // Filtrado estricto por usuario y por texto de búsqueda
  const misNotificaciones = notificaciones.filter((item) =>
    mismoId(item.userId, usuarioActual?.id)
  );
  const filtradas = misNotificaciones.filter((item) =>
    coincideConBusqueda([item.title, item.message], textoBusqueda)
  );
  const cantidadSinLeer = misNotificaciones.filter((item) => !item.read).length;

  /** Ejecuta una acción asíncrona de notificación capturando posibles errores */
  async function ejecutarAccion(accion) {
    setMensajeError('');
    try {
      await accion();
    } catch (error) {
      setMensajeError(error.message);
    }
  }

  return (
    <div className="space-y-5">
      {/* Cabecera con conteo de no leídas y botón masivo para marcar todas */}
      <CabeceraSeccionPanel
        titulo="Mis Notificaciones"
        subtitulo={`Solo tus avisos personales · ${cantidadSinLeer} pendientes sin leer de ${misNotificaciones.length}.`}
        botonPrincipal={
          usuarioActual &&
          cantidadSinLeer > 0 && (
            <BotonPanel
              icono={<CheckCheck className="w-3.5 h-3.5" />}
              alHacerClic={() => ejecutarAccion(() => marcarTodasComoLeidas())}
            >
              Marcar todas como leídas
            </BotonPanel>
          )
        }
      />

      {/* Banner de error en caso de falla en la operación */}
      <AvisoPanel
        aviso={mensajeError ? { tipo: 'error', texto: mensajeError } : null}
        alCerrar={() => setMensajeError('')}
      />

      {/* Listado de notificaciones o estado vacío */}
      {filtradas.length === 0 ? (
        <EstadoVacioPanel mensaje="No tienes notificaciones personales para mostrar." />
      ) : (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 divide-y divide-[#224F10]/8 shadow-2xs overflow-hidden">
          {filtradas.map((item) => (
            <FilaNotificacion
              key={item.id}
              item={item}
              alMarcarLeida={() => ejecutarAccion(() => marcarComoLeida(item.id))}
              alEliminar={() => ejecutarAccion(() => eliminarNotificacion(item.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
