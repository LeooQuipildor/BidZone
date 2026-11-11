import React from 'react';
import { ExternalLink, Pause, Play } from 'lucide-react';
import { formatearMoneda } from '../../utilidades/formatos';
import { mismoId } from '../../utilidades/ayudas';
import { obtenerIniciales } from './ayudasPanel';

const COLORES_AVATAR = [
  'bg-[#EAFFD0] text-[#224F10]',
  'bg-[#B0E454] text-[#0D0D0D]',
  'bg-[#224F10] text-[#EAFFD0]',
  'bg-[#0D0D0D] text-[#B0E454]',
];

function obtenerEtiquetaComunidad(usuario) {
  if (usuario.status === 'suspended' || usuario.status === 'closed') {
    return { texto: 'Sancionado', claseColor: 'bg-red-50 text-red-700 border-red-200' };
  }
  if (usuario.role === 'admin') {
    return {
      texto: 'Moderador',
      claseColor: 'bg-[#B0E454]/40 text-[#0D0D0D] border-[#224F10]/15',
    };
  }
  return {
    texto: 'Verificado',
    claseColor: 'bg-[#EAFFD0] text-[#224F10] border-[#224F10]/15',
  };
}

// Fila del resumen: comunidad, barra de progreso simple y reloj en vivo
export function FilaProgresoResumen({
  usuarios,
  pujas,
  cantidadAdjudicadas,
  cantidadActivas,
  totalSubastas,
  subastaProximaACerrar,
  cuentaRegresiva,
  relojPausado,
  alAlternarPausa,
  alAbrirSala,
  alVerUsuarios,
}) {
  const totalSeguro = Math.max(totalSubastas, 1);
  const porcentajeAdjudicadas = Math.round((cantidadAdjudicadas / totalSeguro) * 100);
  const porcentajeActivas = Math.round((cantidadActivas / totalSeguro) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-5 rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-2 pb-4">
          <h2 className="text-sm font-bold text-[#0D0D0D]">Participación y Comunidad</h2>
          <button
            type="button"
            onClick={alVerUsuarios}
            className="px-3 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[11px] font-semibold text-[#0D0D0D] transition-colors cursor-pointer"
          >
            + Ver Usuarios
          </button>
        </div>

        <div className="space-y-3">
          {usuarios.map((usuario, indice) => {
            const ultimaPujaUsuario = pujas.find((puja) => mismoId(puja.bidderId, usuario.id));
            const colorAvatar = COLORES_AVATAR[indice % COLORES_AVATAR.length];
            const etiqueta = obtenerEtiquetaComunidad(usuario);

            return (
              <div key={usuario.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${colorAvatar}`}
                  >
                    {obtenerIniciales(usuario.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0D0D0D] truncate">{usuario.name}</p>
                    <p className="text-[11px] text-[#0D0D0D]/55 truncate">
                      {ultimaPujaUsuario
                        ? `Última puja: ${formatearMoneda(ultimaPujaUsuario.amount)}`
                        : `${usuario.city || 'Argentina'} · ${usuario.reputation || '5.0'} ★`}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 border ${etiqueta.claseColor}`}
                >
                  {etiqueta.texto}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progreso general de subastas */}
      <div className="lg:col-span-4 rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
        <h2 className="text-sm font-bold text-[#0D0D0D]">Progreso de Subastas</h2>

        <div className="my-4 space-y-4">
          <div className="text-center">
            <span className="text-4xl font-bold tracking-tight text-[#0D0D0D]">
              {porcentajeAdjudicadas}%
            </span>
            <p className="text-xs font-medium text-[#224F10] mt-1">Subastas Adjudicadas</p>
          </div>
          <div className="w-full h-4 rounded-full bg-[#F1F8E9] border border-[#224F10]/15 overflow-hidden flex">
            <div
              style={{ width: `${porcentajeAdjudicadas}%` }}
              className="bg-[#224F10] h-full transition-all"
            />
            <div
              style={{ width: `${porcentajeActivas}%` }}
              className="bg-[#B0E454] h-full transition-all"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2 text-[11px] font-medium text-[#0D0D0D]/70">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#224F10]" />
            Adjudicadas ({cantidadAdjudicadas})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B0E454]" />
            En Vivo ({cantidadActivas})
          </span>
        </div>
      </div>

      {/* Cronómetro en vivo */}
      <div className="lg:col-span-3 rounded-2xl bg-gradient-to-br from-[#0D0D0D] via-[#132B08] to-[#224F10] text-[#EAFFD0] p-5 flex flex-col justify-between min-h-[210px] shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#EAFFD0]/85">Cronómetro de Cierre</span>
          <span className="px-2 py-0.5 rounded-full bg-[#B0E454]/20 text-[#B0E454] text-[10px] font-bold">
            {relojPausado ? 'PAUSA' : 'EN VIVO'}
          </span>
        </div>

        <div className="my-3 text-center">
          <p className="text-3xl sm:text-4xl font-bold tracking-wider tabular-nums text-white">
            {cuentaRegresiva}
          </p>
          <p className="text-[11px] text-[#EAFFD0]/65 mt-1 truncate">
            {subastaProximaACerrar ? subastaProximaACerrar.title : 'Sin lotes corriendo'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={alAlternarPausa}
            title={relojPausado ? 'Reanudar reloj' : 'Pausar reloj'}
            className="w-10 h-10 rounded-full bg-white hover:bg-[#B0E454] text-[#0D0D0D] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            {relojPausado ? (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            ) : (
              <Pause className="w-4 h-4 fill-current" />
            )}
          </button>
          <button
            type="button"
            onClick={alAbrirSala}
            title="Ir a la sala de subasta"
            className="w-10 h-10 rounded-full bg-[#B0E454] hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

