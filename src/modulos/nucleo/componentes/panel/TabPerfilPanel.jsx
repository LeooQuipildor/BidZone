import React, { useState } from 'react';
import { Mail, MapPin, Phone, ShieldCheck, Star } from 'lucide-react';
import { usarTiendaAutenticacion } from '../../../autenticacion/estado/tiendaAutenticacion';
import { FormularioUsuario } from '../../../autenticacion/componentes/FormularioUsuario';
import { mismoId } from '../../utilidades/ayudas';
import { formatearRolUsuario, obtenerIniciales } from '../../utilidades/formatos';
import { AvisoPanel, CabeceraSeccionPanel } from './PanelCompartido';

export function TabPerfilPanel({ usuarioActual, subastas, pujas }) {
  const actualizarUsuario = usarTiendaAutenticacion((estado) => estado.actualizarUsuario);
  const [aviso, setAviso] = useState(null);

  const misSubastas = subastas.filter((item) =>
    mismoId(item.sellerId, usuarioActual?.id)
  ).length;
  const misPujas = pujas.filter((item) =>
    mismoId(item.bidderId, usuarioActual?.id)
  ).length;
  const etiquetaRol = formatearRolUsuario(usuarioActual?.role);

  return (
    <div className="space-y-6">
      <CabeceraSeccionPanel
        titulo="Mi Perfil"
        subtitulo="Mantén actualizados tu teléfono y ciudad para la liberación automática de datos al cierre (RN05)."
      />

      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-[#224F10] to-[#122B08] text-[#EAFFD0] p-6 flex flex-col justify-between gap-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#B0E454] text-[#0D0D0D] font-bold text-lg flex items-center justify-center shrink-0">
                {obtenerIniciales(usuarioActual?.name)}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white truncate">
                  {usuarioActual?.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B0E454]/20 text-[#B0E454] text-[10px] font-bold uppercase mt-1">
                  <ShieldCheck className="w-3 h-3" />
                  {etiquetaRol}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#EAFFD0]/85 pt-2 border-t border-[#EAFFD0]/15">
              <p className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-[#B0E454] shrink-0" />
                {usuarioActual?.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#B0E454] shrink-0" />
                {usuarioActual?.phone || 'Sin teléfono cargado'}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#B0E454] shrink-0" />
                {usuarioActual?.city || 'Argentina'}
              </p>
              <p className="flex items-center gap-2 font-semibold text-white">
                <Star className="w-3.5 h-3.5 text-[#B0E454] fill-[#B0E454] shrink-0" />
                Reputación: {usuarioActual?.reputation || '5.0'} / 5.0
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#EAFFD0]/15">
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="text-2xl font-bold text-white">{misSubastas}</p>
              <p className="text-[10px] text-[#EAFFD0]/75">Subastas creadas</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="text-2xl font-bold text-white">{misPujas}</p>
              <p className="text-[10px] text-[#EAFFD0]/75">Pujas emitidas</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 rounded-2xl bg-white border border-[#224F10]/10 p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-[#0D0D0D] pb-4 border-b border-[#224F10]/10">
            Datos de Contacto y Coordinación
          </h2>

          <FormularioUsuario
            key={usuarioActual?.id || 'anon'}
            usuario={usuarioActual}
            esAdmin={false}
            alActualizarUsuario={actualizarUsuario}
            alGuardar={() =>
              setAviso({
                tipo: 'exito',
                texto: 'Tus datos de coordinación directa RN05 se actualizaron correctamente.',
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
