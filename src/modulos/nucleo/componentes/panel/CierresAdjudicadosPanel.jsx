/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/CierresAdjudicadosPanel.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE COMPONENTE?
 * Es el panel que presenta las subastas finalizadas que han sido adjudicadas
 * a un ganador, implementando en la interfaz la Regla de Negocio RN05:
 * "Trato Directo y Liberación de Contacto Post-Cierre".
 *
 * ¿POR QUÉ EXISTE Y CUÁL ES SU PROPÓSITO?
 * En BidZone la plataforma no actúa como pasarela de pago ni custodia fondos (no escrow).
 * El modelo de negocio se basa en que, una vez que la subasta finaliza y se determina
 * un ganador legítimo (la oferta más alta al expirar el tiempo):
 * 1. Los datos de contacto privados (nombre completo, teléfono, correo electrónico)
 *    de ambas partes (vendedor y comprador adjudicado) se liberan mutuamente.
 * 2. Ambas partes pueden comunicarse directamente para coordinar el pago en mano o
 *    transferencia y el retiro o envío del artículo.
 * 3. Ambas partes tienen acceso rápido para emitir una calificación de reputación (RN07)
 *    o iniciar un ticket de reporte ante un incumplimiento (RN06).
 *
 * ¿DE DÓNDE PROVIENEN LOS DATOS?
 * - `cierres`: Array de subastas adjudicadas (`status === 'closed'` con ganador). Proviene
 *   del filtrado de la tienda de subastas (`tiendaSubastas.js`).
 * - `usuarios`: Lista de usuarios en memoria cargada desde `tiendaAutenticacion.js`.
 *   Se usa para buscar la ficha completa de contacto del vendedor y del ganador.
 * - `resenas`: Lista de calificaciones de `tiendaResenas.js` para comprobar si el usuario
 *   actual ya calificó a su contraparte en esta operación (`yaCalificada`).
 * - `idUsuarioActual`: Identificador del usuario logueado, obtenido desde `tiendaAutenticacion.js`.
 * - `alElegirSeccion`: Callback suministrado por `VistaPanelControl.jsx` para cambiar
 *   de pestaña activa (por ejemplo, saltar a "resenas" o "reportes" abriendo el formulario precompletado).
 * ==============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, CheckCircle2, Star } from 'lucide-react';
import { formatearMoneda } from '../../utilidades/formatos';
import { buscarPorId, mismoId } from '../../utilidades/ayudas';
import { DatosContactoPersona } from '../../diseno/componentesBloques';
import { EstadoVacioPanel } from './PanelCompartido';

/**
 * Función auxiliar: obtenerRolEnCierre
 * ----------------------------------------------------------------------------
 * Determina una etiqueta textual clara para indicar qué papel tuvo el usuario
 * conectado en esta transacción finalizada.
 *
 * @param {Object} cierre - Objeto subasta finalizada.
 * @param {string|number} idUsuarioActual - ID de la sesión activa.
 * @returns {string} Mensaje representativo ('Ganaste esta subasta', 'Artículo vendido' u 'Operación finalizada').
 */
function obtenerRolEnCierre(cierre, idUsuarioActual) {
  if (mismoId(idUsuarioActual, cierre.winnerId)) return 'Ganaste esta subasta';
  if (mismoId(idUsuarioActual, cierre.sellerId)) return 'Artículo vendido';
  return 'Operación finalizada';
}

/**
 * Componente principal: CierresAdjudicadosPanel
 * ----------------------------------------------------------------------------
 * Renderiza la grilla de operaciones finalizadas con tarjetas detalladas que exhiben:
 * - Rol del usuario en la operación.
 * - Título y precio final alcanzado.
 * - Bloque de datos de contacto liberados (vendedor y comprador).
 * - Botones de acción post-cierre: Calificar (RN07) o Reportar Incumplimiento (RN06).
 */
export function CierresAdjudicadosPanel({
  cierres,
  usuarios,
  resenas = [],
  idUsuarioActual,
  alElegirSeccion,
}) {
  return (
    <section className="space-y-4 pt-2">
      {/* Encabezado de la sección con referencia explícita a la regla RN05 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#224F10]">
            TRATO DIRECTO RN05
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-[#0D0D0D] mt-0.5">
            Cierres adjudicados y contactos liberados
          </h2>
        </div>
        <span className="text-xs text-[#0D0D0D]/55">{cierres.length} operaciones</span>
      </div>

      {/* Renderizado condicional: si no hay subastas adjudicadas se muestra estado vacío */}
      {cierres.length === 0 ? (
        <EstadoVacioPanel mensaje="Todavía no tienes subastas finalizadas con contacto liberado." />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {cierres.map((cierre) => {
            // Buscamos las entidades de usuario completas para extraer teléfono y ciudad
            const vendedor = buscarPorId(usuarios, cierre.sellerId);
            const ganador = buscarPorId(usuarios, cierre.winnerId);

            // Verificamos si el usuario conectado es una de las partes legítimas
            const esVendedor = mismoId(idUsuarioActual, cierre.sellerId);
            const esGanador = mismoId(idUsuarioActual, cierre.winnerId);
            const participa = esVendedor || esGanador;

            // Identificamos quién es la contraparte a la que se puede calificar o reportar
            const idContraparte = esGanador ? cierre.sellerId : cierre.winnerId;

            // Verificamos si ya existe una calificación emitida por el usuario actual para este lote
            const yaCalificada = resenas.some(
              (item) => mismoId(item.auctionId, cierre.id) && mismoId(item.reviewerId, idUsuarioActual)
            );

            return (
              <div
                key={cierre.id}
                className="rounded-2xl bg-white border border-[#224F10]/12 p-5 space-y-4 shadow-2xs"
              >
                {/* Cabecera de la tarjeta: Rol, Título del producto y Monto final */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EAFFD0] text-[#224F10] border border-[#224F10]/15 text-[10px] font-bold mb-1.5">
                      {obtenerRolEnCierre(cierre, idUsuarioActual)}
                    </span>
                    <h3 className="text-base font-bold text-[#0D0D0D]">{cierre.title}</h3>
                    <p className="text-xs text-[#0D0D0D]/60 mt-0.5">
                      Monto final:{' '}
                      <strong className="text-[#224F10]">
                        {formatearMoneda(cierre.currentPrice)}
                      </strong>
                    </p>
                  </div>

                  {/* Enlace para revisar el detalle de la subasta */}
                  <Link
                    to={`/subastas/${cierre.id}`}
                    className="px-3.5 py-1.5 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] text-[11px] font-semibold transition-colors shrink-0"
                  >
                    Ver lote
                  </Link>
                </div>

                {/* Bloque RN05: Fichas de contacto liberadas (Vendedor y Ganador) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F7FBF3] p-3.5 rounded-xl border border-[#224F10]/10">
                  <DatosContactoPersona
                    titulo="Vendedor"
                    persona={vendedor}
                    nombrePorDefecto={cierre.sellerName || 'Vendedor'}
                  />
                  <DatosContactoPersona
                    titulo="Ganador"
                    persona={ganador}
                    nombrePorDefecto={cierre.winnerName || 'Comprador'}
                    conSeparador
                  />
                </div>

                {/* Acciones post-cierre: Solo disponibles para las partes involucradas */}
                {participa && (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {/* Botón de Calificación (RN07) o indicador si ya fue calificada */}
                    {yaCalificada ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#EAFFD0] text-[#224F10] text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ya calificada
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          alElegirSeccion('resenas', {
                            abrirFormulario: true,
                            idSubasta: String(cierre.id),
                            idUsuarioCalificado: String(idContraparte || ''),
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Star className="w-3 h-3" />
                        Calificar
                      </button>
                    )}

                    {/* Botón para iniciar reclamo o denuncia (RN06) */}
                    <button
                      type="button"
                      onClick={() =>
                        alElegirSeccion('reportes', {
                          abrirFormulario: true,
                          idSubasta: String(cierre.id),
                          idUsuarioReportado: String(idContraparte || ''),
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#B0E454] hover:bg-[#EAFFD0] text-[#0D0D0D] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      <AlertOctagon className="w-3 h-3" />
                      Reportar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
