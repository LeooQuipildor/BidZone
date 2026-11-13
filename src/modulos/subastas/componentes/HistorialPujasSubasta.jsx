/**
 * ==============================================================================
 * ARCHIVO: src/modulos/subastas/componentes/HistorialPujasSubasta.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de presentación que muestra el historial público y auditable de pujas
 * recibidas por una subasta específica, ordenadas de mayor a menor.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Si no hay pujas, muestra un mensaje amigable invitando a ser el primer postor.
 * 2. Si hay pujas, renderiza una lista desplazable (`max-h-80 overflow-y-auto`) con cada oferta.
 * 3. Identifica a la puja líder actual (`indice === 0`) y la resalta visualmente con un fondo
 *    negro, texto verde flúor y una insignia "Líder".
 * 4. Resuelve el nombre del postor a partir del campo `bidderName` o cruzando el ID con la lista de `usuarios`.
 * 5. Muestra la nota del postor, la fecha/hora exacta de emisión y el importe formateado en moneda.
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * Son enviadas por el contenedor `VistaDetalleSubasta.jsx`:
 * - `pujas`: Arreglo de pujas asociadas a la subasta actual (filtradas de `tiendaPujas`).
 * - `usuarios`: Arreglo con todos los usuarios registrados (de `tiendaAutenticacion`) para resolver nombres.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Detección de elemento líder por índice:
 *   Al venir el arreglo previamente ordenado de forma descendente por monto, la posición `indice === 0`
 *   corresponde siempre a la oferta ganadora o líder actual.
 * - Enlace contextual a sección privada:
 *   `<Link to="/pujas">Mis pujas →</Link>` ofrece un atajo al panel personal del usuario.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card } from '../../nucleo/diseno/ui';
import { buscarPorId } from '../../nucleo/utilidades/ayudas';
import { formatearFechaHora, formatearMoneda } from '../../nucleo/utilidades/formatos';

export function HistorialPujasSubasta({ pujas, usuarios }) {
  return (
    <Card className="space-y-4">
      {/* Encabezado con contador total de ofertas */}
      <div className="flex items-center justify-between border-b border-[#224F10]/15 pb-2">
        <h3 className="font-serif-display text-2xl text-[#0D0D0D]">
          Historial auditable ({pujas.length})
        </h3>
        <Link to="/pujas" className="text-xs font-semibold text-[#224F10] hover:underline">
          Mis pujas →
        </Link>
      </div>

      {/* Caso vacío: No hay ofertas aún */}
      {pujas.length === 0 ? (
        <p className="text-xs text-[#0D0D0D]/60 py-4 text-center">
          Aún no hay ofertas registradas. ¡Sé el primero en pujar!
        </p>
      ) : (
        /* Lista scrollable de ofertas */
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {pujas.map((puja, indice) => {
            // Resolución del nombre del usuario que emitió la puja
            const usuarioPostor = buscarPorId(usuarios, puja.bidderId);
            const nombrePostor =
              puja.bidderName || usuarioPostor?.name || `Usuario #${puja.bidderId}`;
            const esOfertaLider = indice === 0;

            return (
              <div
                key={puja.id}
                className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
                  esOfertaLider
                    ? 'bg-[#0D0D0D] text-[#EAFFD0] border-[#0D0D0D]'
                    : 'bg-white/80 text-[#0D0D0D] border-[#224F10]/15'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{nombrePostor}</span>
                    {esOfertaLider && (
                      <Badge variant="lime" className="text-[10px]">
                        Líder
                      </Badge>
                    )}
                  </div>
                  {/* Nota o comentario opcional del postor */}
                  <p className="text-[11px] opacity-75 mt-0.5">{puja.note}</p>
                  <span className="text-[10px] opacity-60">
                    {formatearFechaHora(puja.createdAt)}
                  </span>
                </div>

                {/* Importe económico de la oferta */}
                <span
                  className={`font-serif-display text-2xl font-semibold ${
                    esOfertaLider ? 'text-[#B0E454]' : 'text-[#224F10]'
                  }`}
                >
                  {formatearMoneda(puja.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

