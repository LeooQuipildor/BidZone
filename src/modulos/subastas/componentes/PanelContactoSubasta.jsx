/**
 * ==============================================================================
 * ARCHIVO: src/modulos/subastas/componentes/PanelContactoSubasta.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de interfaz que materializa las Reglas de Negocio RN05, RN06 y RN07.
 * Se encarga de mostrar la Sala Privada de Coordinación Directa cuando una subasta concluye.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Si la subasta sigue activa (`status !== 'finalizada'`), no se renderiza (`return null`).
 * 2. Si concluyó sin ganador (sin pujas), muestra una nota informativa.
 * 3. Si concluyó con ganador:
 *    - Caso A (El usuario actual es el Vendedor, el Ganador o un Administrador):
 *      Desbloquea los datos privados de contacto (teléfono, WhatsApp, correo y ciudad) de ambas partes
 *      utilizando `DatosContactoPersona`.
 *      Habilita dos botones de acción directa:
 *      * "Calificar Operación (1 a 5 ★)" hacia `/resenas/nueva` (RN07).
 *      * "Informar Incumplimiento / Denunciar" hacia `/reportes/nuevo` con el ID de la contraparte (RN06).
 *    - Caso B (El usuario actual es un visitante o postor que no ganó):
 *      Muestra un candado de privacidad (`Lock`) explicando que por la regla RN05 los datos personales
 *      solo son accesibles para las dos partes involucradas.
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * Son pasadas por `VistaDetalleSubasta.jsx` (tras ser calculadas por `prepararDatosDetalleSubasta`):
 * - `subasta`: Objeto de la subasta finalizada.
 * - `vendedor`: Objeto del vendedor.
 * - `ganador`: Objeto del postor ganador.
 * - `puedeVerContactoDesbloqueado`: Booleano que autoriza la visualización de datos sensibles.
 * - `esVendedor`: Booleano que indica si el usuario logueado es el dueño del lote.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Deducción de Contraparte:
 *   `const idContraparte = esVendedor ? ganador?.id : vendedor?.id;`
 *   Determina automáticamente a quién se va a denunciar si ocurre un incumplimiento: si soy el vendedor
 *   denuncio al comprador, y si soy el comprador denuncio al vendedor.
 * - Renderizado Condicional de Seguridad:
 *   Protege información sensible del usuario (PII: Personally Identifiable Information) directamente
 *   en la presentación.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, Lock, ShieldCheck, Star } from 'lucide-react';
import { Button, Badge } from '../../nucleo/diseno/ui';
import { DatosContactoPersona } from '../../nucleo/diseno/componentesBloques';
import { formatearMoneda } from '../../nucleo/utilidades/formatos';

export function PanelContactoSubasta({
  subasta,
  vendedor,
  ganador,
  puedeVerContactoDesbloqueado,
  esVendedor,
}) {
  // Retorno temprano: Si la subasta sigue abierta en vivo, este panel no debe existir
  if (subasta.status !== 'finalizada') return null;

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
            Subasta adjudicada a <strong className="text-[#B0E454]">{ganador.name}</strong> por{' '}
            <strong className="text-[#B0E454]">{formatearMoneda(subasta.currentPrice)}</strong>. Por privacidad (RN05), los teléfonos y correos solo son visibles para el vendedor y el ganador.
          </div>
        </div>
      )}
    </div>
  );
}
