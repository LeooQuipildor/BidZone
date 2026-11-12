import React from 'react';
import { CheckCircle2, Gavel } from 'lucide-react';
import { Button } from '../../nucleo/diseno/ui';
import { Modal } from '../../nucleo/diseno/uiFeedback';
import { formatearMoneda } from '../../nucleo/utilidades/formatos';

// Modal compartido para confirmar una puja antes de enviarla al servidor (RN04)
// Se usa en el detalle de la subasta, en la pantalla de nueva puja y en el panel
export function ModalConfirmarPuja({
  estaAbierto,
  alCerrar,
  alConfirmar,
  enviando,
  subasta,
  montoPuja,
  notaPuja,
}) {
  const diferenciaVsActual = subasta
    ? Number(montoPuja) - Number(subasta.currentPrice)
    : 0;

  return (
    <Modal
      isOpen={estaAbierto}
      onClose={() => {
        if (!enviando) alCerrar();
      }}
      title="Confirmar oferta"
    >
      <div className="space-y-5">
        <div className="p-3.5 bg-[#B0E454]/30 rounded-2xl border border-[#224F10]/20 text-xs text-[#0D0D0D]">
          <p className="font-bold text-sm mb-1 text-[#224F10] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#224F10]" />
            Confirmar oferta
          </p>
          <p className="text-[#0D0D0D]/80">
            ¿Estás seguro de que deseas enviar esta puja? Por favor revisa el monto antes de confirmar, ya que las ofertas son vinculantes (RN04).
          </p>
        </div>

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

          {/* Recuadro destacado con el monto que va a ofertar la persona */}
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

          {notaPuja && (
            <div className="text-xs text-[#0D0D0D]/80 pt-1">
              <span className="font-semibold block text-[#0D0D0D]">Nota de coordinación:</span>
              <p className="italic bg-[#F5FFEB] p-2.5 rounded-xl border border-[#224F10]/10 mt-1">
                &ldquo;{notaPuja}&rdquo;
              </p>
            </div>
          )}
        </div>

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
