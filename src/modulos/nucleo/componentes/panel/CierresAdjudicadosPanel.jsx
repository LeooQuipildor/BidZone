import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, CheckCircle2, Star } from 'lucide-react';
import { formatearMoneda } from '../../utilidades/formatos';
import { buscarPorId, mismoId } from '../../utilidades/ayudas';
import { DatosContactoPersona } from '../../diseno/componentesBloques';
import { EstadoVacioPanel } from './PanelCompartido';

function obtenerRolEnCierre(cierre, idUsuarioActual) {
  if (mismoId(idUsuarioActual, cierre.ganadorId)) return 'Ganaste esta subasta';
  if (mismoId(idUsuarioActual, cierre.vendedorId)) return 'Artículo vendido';
  return 'Operación finalizada';
}

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
            TRATO DIRECTO
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
            const vendedor = buscarPorId(usuarios, cierre.vendedorId);
            const ganador = buscarPorId(usuarios, cierre.ganadorId);

            // Verificamos si el usuario conectado es una de las partes legítimas
            const esVendedor = mismoId(idUsuarioActual, cierre.vendedorId);
            const esGanador = mismoId(idUsuarioActual, cierre.ganadorId);
            const participa = esVendedor || esGanador;

            // Identificamos quién es la contraparte a la que se puede calificar o reportar
            const idContraparte = esGanador ? cierre.vendedorId : cierre.ganadorId;

            // Verificamos si ya existe una calificación emitida por el usuario actual para este lote
            const yaCalificada = resenas.some(
              (item) => mismoId(item.subastaId, cierre.id) && mismoId(item.autorId, idUsuarioActual)
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
                    <h3 className="text-base font-bold text-[#0D0D0D]">{cierre.titulo}</h3>
                    <p className="text-xs text-[#0D0D0D]/60 mt-0.5">
                      Monto final:{' '}
                      <strong className="text-[#224F10]">
                        {formatearMoneda(cierre.precioActual)}
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
                    nombrePorDefecto={cierre.nombreVendedor || 'Vendedor'}
                  />
                  <DatosContactoPersona
                    titulo="Ganador"
                    persona={ganador}
                    nombrePorDefecto={cierre.nombreGanador || 'Comprador'}
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
