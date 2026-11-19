import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, Clock, Lock, ShieldCheck, Star } from 'lucide-react';
import { Button, Badge } from '../../nucleo/diseno/ui';
import { DatosContactoPersona } from '../../nucleo/diseno/componentesBloques';
import { formatearMoneda } from '../../nucleo/utilidades/formatos';

export function PanelContactoSubasta({
  subasta,
  vendedor,
  ganador,
  puedeVerContactoDesbloqueado,
  esVendedor,
  esFinalizada = false,
}) {
  const finalizada = subasta.estado === 'finalizada' || esFinalizada;
  if (!finalizada) return null;

  // Identificador de la contraparte para prellenar la denuncia si hubiera problemas (RN06)
  const idContraparte = esVendedor ? ganador?.id : vendedor?.id;

  return (
    <div className="rounded-3xl bg-[#0D0D0D] text-[#EAFFD0] p-6 sm:p-8 shadow-lg space-y-5">
      {/* Cabecera del panel con escudo de seguridad */}
      <div className="flex items-center justify-between border-b border-[#EAFFD0]/15 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#B0E454]" />
          <h2 className="font-serif-display text-2xl sm:text-3xl text-[#EAFFD0]">
            Coordinación directa liberada (RN05 / RN06)
          </h2>
        </div>
        <Badge variant="lime">{ganador ? 'Adjudicada' : 'Cerrada'}</Badge>
      </div>

      {/* Escenario 1: Cerrada sin ofertas */}
      {!ganador ? (
        <p className="text-sm text-[#EAFFD0]/80">Esta subasta finalizó sin recibir ofertas.</p>
      ) : puedeVerContactoDesbloqueado ? (
        /* Escenario 2: Usuario autorizado (Ganador, Vendedor o Admin) */
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-[#EAFFD0]/85 leading-relaxed">
            ¡Felicitaciones! Como parte involucrada en la adjudicación,{' '}
            <strong className="text-[#B0E454]">
              BidZone ha liberado los datos de contacto oficiales
            </strong>{' '}
            para coordinar el pago y la entrega por tu cuenta. Ante cualquier incumplimiento puedes radicar un reporte para sancionar o cerrar la cuenta infractora.
          </p>

          {/* Advertencia obligatoria de 48 hs para contactar */}
          <div className="p-4 rounded-2xl bg-[#EAFFD0] text-[#0D0D0D] border-2 border-[#B0E454] shadow-sm flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#224F10] shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs sm:text-sm">
              <strong className="text-[#224F10] font-bold block text-sm">
                Plazo obligatorio de contacto (48 hs):
              </strong>
              <p className="text-[#0D0D0D]/90 font-medium leading-relaxed">
                Tienes 48 hs para contactarte con el postor de lo contrario podríamos suspender tu cuenta por incumplimientos de normas.
              </p>
            </div>
          </div>

          {/* Bloque con las fichas de contacto privadas de ambas partes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#224F10]/35 p-5 rounded-2xl border border-[#B0E454]/30 text-xs">
            <DatosContactoPersona
              titulo="Datos del Dueño del Artículo"
              persona={vendedor}
              modoOscuro
            />
            <DatosContactoPersona
              titulo="Datos del Postor Ganador"
              persona={ganador}
              modoOscuro
              conSeparador
            />
          </div>

          {/* Botones de acción post-subasta: Calificar (RN07) o Denunciar (RN06) */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to={`/resenas/nueva?subasta=${subasta.id}`}>
              <Button size="sm">
                <Star className="w-4 h-4" />
                Calificar Operación (1 a 5 ★)
              </Button>
            </Link>
            <Link
              to={`/reportes/nuevo?subasta=${subasta.id}${idContraparte ? `&reportado=${idContraparte}` : ''}`}
            >
              <Button variant="secondary" size="sm">
                <AlertOctagon className="w-4 h-4" />
                Informar Incumplimiento / Denunciar
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Escenario 3: Tercero no autorizado (Público general) */
        <div className="flex items-center gap-3 bg-[#224F10]/30 p-4 rounded-2xl border border-[#B0E454]/30 text-xs text-[#EAFFD0]">
          <Lock className="w-5 h-5 text-[#B0E454] shrink-0" />
          <div>
            Subasta adjudicada a <strong className="text-[#B0E454]">{ganador.nombre}</strong> por{' '}
            <strong className="text-[#B0E454]">{formatearMoneda(subasta.precioActual)}</strong>. Por privacidad (RN05), los teléfonos y correos solo son visibles para el vendedor y el ganador.
          </div>
        </div>
      )}
    </div>
  );
}
