/**
 * ==============================================================================
 * ARCHIVO: src/modulos/pujas/componentes/ModalConfirmarPuja.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el modal de confirmación en dos pasos para el envío de ofertas en BidZone.
 * Da cumplimiento directo a la Regla de Negocio RN04 (Inmutabilidad y Compromiso Vinculante).
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Se abre como una ventana emergente (`<Modal>`) antes de que la puja sea registrada en el servidor.
 * 2. Presenta un resumen inequívoco de la operación:
 *    - Título del lote.
 *    - Precio líder actual e incremento mínimo fijado por el vendedor.
 *    - Monto exacto en ARS que la persona está a punto de comprometer.
 *    - Diferencia económica calculada respecto a la oferta líder actual (`+ $X vs actual`).
 *    - Nota opcional de coordinación si la hubiera.
 * 3. Previene cancelaciones accidentales bloqueando el botón mientras la petición está en curso (`enviando`).
 * 4. Al presionar "Confirmar oferta", dispara la acción `alConfirmar`.
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * Son pasadas por `PanelPujasSubasta.jsx` o por `FormularioPuja.jsx`:
 * - `estaAbierto`: Booleano que controla la visibilidad de la ventana.
 * - `alCerrar`: Función para cancelar y cerrar el modal.
 * - `alConfirmar`: Función que dispara la llamada a la API.
 * - `enviando`: Booleano que desactiva botones mientras se procesa la solicitud HTTP.
 * - `subasta`: Objeto con las propiedades del lote.
 * - `montoPuja`: Importe numérico de la oferta ingresada.
 * - `notaPuja`: Texto de aclaración opcional.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Patrón de Doble Confirmación (Two-step verification):
 *   Es una buena práctica fundamental en aplicaciones financieras o de comercio electrónico.
 *   Evita errores tipográficos (por ejemplo, ofertar $500.000 en vez de $50.000) antes de sellar
 *   un contrato vinculante que no se puede revocar.
 */

import React from 'react';
import { CheckCircle2, Gavel } from 'lucide-react';
import { Button } from '../../nucleo/diseno/ui';
import { Modal } from '../../nucleo/diseno/uiFeedback';
import { formatearMoneda } from '../../nucleo/utilidades/formatos';

export function ModalConfirmarPuja({
  estaAbierto,
  alCerrar,
  alConfirmar,
  enviando,
  subasta,
  montoPuja,
  notaPuja,
}) {
  // Cálculo de cuánto dinero extra sobre el precio actual representa esta oferta
  const diferenciaVsActual = subasta
    ? Number(montoPuja) - Number(subasta.currentPrice)
    : 0;

  return (
    <Modal
      isOpen={estaAbierto}
      onClose={() => {
        // Si está en curso la petición, no permitimos cerrar para evitar inconsistencias
        if (!enviando) alCerrar();
      }}
      title="Confirmar oferta"
    >
      <div className="space-y-5">
        {/* Alerta de recordatorio legal RN04 */}
        <div className="p-3.5 bg-[#B0E454]/30 rounded-2xl border border-[#224F10]/20 text-xs text-[#0D0D0D]">
          <p className="font-bold text-sm mb-1 text-[#224F10] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#224F10]" />
            Confirmar oferta
          </p>
          <p className="text-[#0D0D0D]/80">
            ¿Estás seguro de que deseas enviar esta puja? Por favor revisa el monto antes de confirmar, ya que las ofertas son vinculantes (RN04).
          </p>
        </div>

        {/* Ficha resumen con los datos de la subasta */}
        <div className="bg-white/90 rounded-2xl p-4 sm:p-5 border border-[#224F10]/15 space-y-4">
          {subasta && (
            <>
              <div className="flex flex-col gap-1 pb-3 border-b border-[#224F10]/10">
                <span className="text-[10px] font-bold text-[#0D0D0D]/55 uppercase tracking-wider">
                  Artículo / Subasta
                </span>
                <span className="text-sm font-semibold text-[#0D0D0D] line-clamp-2">
                  {subasta.title}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#224F10]/10 text-xs">
                <div>
                  <span className="text-[11px] text-[#0D0D0D]/55 block">Oferta líder actual</span>
                  <strong className="text-sm font-semibold text-[#0D0D0D]">
                    {formatearMoneda(subasta.currentPrice)}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-[#0D0D0D]/55 block">Incremento mínimo</span>
                  <strong className="text-sm font-semibold text-[#224F10]">
                    +{formatearMoneda(subasta.minIncrement)}
                  </strong>
                </div>
              </div>
            </>
          )}

          {/* Recuadro destacado con el monto final de la puja */}
          <div className="bg-[#EAFFD0] p-4 rounded-2xl border-2 border-[#224F10]/30 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#224F10] block mb-1">
              Monto que estás ofertando:
            </span>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-serif-display text-3xl sm:text-4xl font-extrabold text-[#224F10]">
                {formatearMoneda(montoPuja)}
              </span>
              {subasta && (
                <span className="text-[11px] font-medium text-[#224F10]/80">
                  +{formatearMoneda(diferenciaVsActual)} vs actual
                </span>
              )}
            </div>
          </div>

          {/* Nota opcional de coordinación si el postor escribió una */}
          {notaPuja && (
            <div className="text-xs text-[#0D0D0D]/80 pt-1">
              <span className="font-semibold block text-[#0D0D0D]">Nota de coordinación:</span>
              <p className="italic bg-[#F5FFEB] p-2.5 rounded-xl border border-[#224F10]/10 mt-1">
                &ldquo;{notaPuja}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Botones de Cancelar y Confirmar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-1">
          <Button
            variant="outline"
            size="md"
            disabled={enviando}
            onClick={alCerrar}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={enviando}
            onClick={alConfirmar}
            className="w-full sm:w-auto"
          >
            <Gavel className="w-4 h-4" />
            {enviando ? 'Enviando...' : 'Confirmar oferta'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
