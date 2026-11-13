/**
 * ==============================================================================
 * ARCHIVO: src/modulos/subastas/componentes/TarjetaSubasta.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de tarjeta reutilizable que muestra el resumen visual de una subasta.
 * Se utiliza en la página de inicio (`Inicio.jsx`), en el catálogo general (`VistaListaSubastas.jsx`)
 * y en la pestaña de subastas del panel de control (`TabSubastasPanel.jsx`).
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Muestra la imagen del lote (o una de respaldo si no tiene), categoría, título y precio actual.
 * 2. Calcula en tiempo real el tiempo restante de la subasta gracias al prop `ahoraMs`.
 * 3. Muestra una insignia dinámica: "En subasta" (verde) o "Finalizada" (roja).
 * 4. Al hacer clic en cualquier parte de la tarjeta o en el botón "Pujar ahora", navega a la ficha de detalle (`/subastas/:id`).
 * 5. Si el usuario es el dueño (`esPropietario`) o es administrador (`esAdmin`), despliega una barra de herramientas
 *    inferior con acciones de gestión (Editar, Solicitar revisión disciplinaria o Eliminar).
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * Son pasadas por el contenedor que renderice la lista de tarjetas (ej: `SeccionCatalogoInicio`, `VistaListaSubastas`, `TabSubastasPanel`):
 * - `subasta`: Objeto con las propiedades del lote (`id`, `title`, `currentPrice`, `endTime`, `imageUrl`, etc.).
 * - `vendedor`: Objeto con los datos del usuario creador (opcional).
 * - `cantidadOfertas`: Conteo de pujas acumuladas (opcional, si no se pasa usa `subasta.bidCount`).
 * - `ahoraMs`: Timestamp en milisegundos provisto por el hook `useRelojSegundo`.
 * - `esPropietario`: Booleano calculado comparando `usuarioActual?.id === subasta.sellerId`.
 * - `esAdmin`: Booleano que indica si el usuario logueado es administrador.
 * - Callbacks opcionales: `alEditar`, `alSolicitarRevision`, `alEliminar`.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Detención de la propagación de eventos (`evento.stopPropagation()`):
 *   Dado que la tarjeta entera tiene un `onClick={abrirDetalle}`, cuando el usuario pulsa un botón
 *   interior (como "Editar" o "Eliminar"), usamos `stopPropagation()` para evitar que el evento "burbujee"
 *   hacia el padre y abra la página de detalle involuntariamente.
 * - Sincronización de reloj sin sobrecarga:
 *   En lugar de que cada tarjeta monte su propio `setInterval`, reciben `ahoraMs` de un solo timer padre,
 *   garantizando un consumo de CPU sumamente bajo.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, Clock, Edit3, Trash2 } from 'lucide-react';
import {
  IMAGEN_SUBASTA_POR_DEFECTO,
  calcularTiempoRestante,
  formatearMoneda,
} from '../../nucleo/utilidades/formatos';
import { Button } from '../../nucleo/diseno/ui';

export function TarjetaSubasta({
  subasta,
  vendedor = null,
  cantidadOfertas,
  ahoraMs,
  esPropietario = false,
  esAdmin = false,
  alEditar = null,
  alSolicitarRevision = null,
  alEliminar = null,
  claseExtra = '',
}) {
  /**
   * Hook `useNavigate`:
   * Permite abrir la página de detalle de la subasta programáticamente.
   */
  const navegar = useNavigate();

  /**
   * Cálculo reactivo del tiempo restante:
   * Evalúa la fecha límite (`subasta.endTime`) contra el reloj sincronizado (`ahoraMs`).
   */
  const tiempoRestante = calcularTiempoRestante(subasta.endTime, ahoraMs);

  /**
   * Estado derivado: Una subasta está "en vivo" si su estado es 'activa' y el tiempo no expiró.
   */
  const estaEnVivo = subasta.status === 'activa' && !tiempoRestante.vencida;

  /**
   * Formateo de ofertas y vendedor:
   */
  const totalOfertas =
    cantidadOfertas !== undefined ? Number(cantidadOfertas) : Number(subasta.bidCount ?? 0);
  const palabraOfertas = totalOfertas === 1 ? 'oferta' : 'ofertas';
  const nombreVendedor = esPropietario ? 'Tú' : vendedor?.name || subasta.sellerName;

  /**
   * Redirige al detalle de la subasta seleccionada.
   */
  function abrirDetalle() {
    navegar(`/subastas/${subasta.id}`);
  }

  return (
    <div
      onClick={abrirDetalle}
      className={`group relative rounded-[26px] bg-white border border-neutral-200/90 p-2 sm:p-1 pb-3.5 sm:pb-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer ${claseExtra}`}
    >
      <div>
        {/* Contenedor de la fotografía con proporción fija 4:3 y badges flotantes */}
        <div className="relative w-full aspect-[4/3] rounded-[20px] overflow-hidden bg-neutral-100">
          <img
            src={subasta.imageUrl || IMAGEN_SUBASTA_POR_DEFECTO}
            alt={subasta.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Insignias sobre la foto: Categoría y Reloj de cuenta regresiva */}
          <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-[11px] font-medium tracking-wide shadow-xs border border-white/20">
              {subasta.category}
            </span>

            <div className="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide shadow-xs border border-white/20 flex items-center gap-1.5 shrink-0">
              <Clock className="w-3 h-3 text-[#B0E454]" />
              <span className="tabular-nums">
                {estaEnVivo ? tiempoRestante.textoFormateado : 'Finalizada'}
              </span>
            </div>
          </div>
        </div>

        {/* Información textual del lote */}
        <div className="mt-3 px-1.5 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-[#0D0D0D] tracking-tight truncate group-hover:text-[#224F10] transition-colors">
              {subasta.title}
            </h3>

            {/* Badge de estado en subasta / finalizada */}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 border ${
                estaEnVivo
                  ? 'bg-[#EAFFD0] text-[#224F10] border-[#224F10]/20'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {estaEnVivo ? 'En subasta' : 'Finalizada'}
            </span>
          </div>

          <p className="text-xs text-neutral-400 font-normal truncate">
            {totalOfertas} {palabraOfertas}
            {vendedor && nombreVendedor ? ` · Vende: ${nombreVendedor}` : ''}
          </p>
        </div>
      </div>

      {/* Barra de precio actual y botón de acción directa */}
      <div className="mt-3.5 px-1 pt-1 flex items-center justify-between gap-2">
        <div className="px-3.5 py-1.5 sm:py-2 rounded-full bg-neutral-100 text-[#0D0D0D] font-bold text-sm sm:text-base tracking-tight shrink-0">
          {formatearMoneda(subasta.currentPrice)}
        </div>

        <button
          type="button"
          onClick={(evento) => {
            evento.stopPropagation(); // Evitamos duplicar la llamada al contenedor
            abrirDetalle();
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs group-hover:shadow-md"
        >
          <span>{estaEnVivo ? 'Pujar ahora' : 'Ver detalle'}</span>
          <span className="w-6 h-6 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </span>
        </button>
      </div>

      {/* Barra de herramientas para el Propietario o Administrador */}
      {(esPropietario || esAdmin) && (
        <div
          onClick={(evento) => evento.stopPropagation()}
          className="flex items-center justify-end gap-2 pt-2.5 mt-2.5 mx-1 border-t border-neutral-100"
        >
          {/* Botón de Editar para el dueño del lote */}
          {esPropietario &&
            (alEditar ? (
              <Button variant="outline" size="sm" withArrow={false} onClick={() => alEditar(subasta)}>
                <Edit3 className="w-3 h-3" />
                Editar
              </Button>
            ) : (
              <Link to={`/subastas/${subasta.id}/editar`}>
                <Button variant="outline" size="sm" withArrow={false}>
                  <Edit3 className="w-3 h-3" />
                  Editar
                </Button>
              </Link>
            ))}

          {/* Botón de moderación disciplinaria para Administradores */}
          {!esPropietario && esAdmin && alSolicitarRevision && (
            <button
              type="button"
              onClick={() => alSolicitarRevision(subasta)}
              className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3" />
              Solicitar revisión
            </button>
          )}

          {/* Botón para eliminar o cancelar subasta */}
          {alEliminar && (
            <Button
              variant="danger"
              size="sm"
              withArrow={false}
              title={esPropietario ? 'Eliminar subasta' : 'Cancelar y eliminar subasta'}
              onClick={() => alEliminar(subasta)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
