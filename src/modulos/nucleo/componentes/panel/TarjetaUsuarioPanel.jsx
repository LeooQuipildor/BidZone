/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/TarjetaUsuarioPanel.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE COMPONENTE?
 * Es el componente de presentación de la tarjeta de un usuario dentro del directorio
 * de cuentas de la pestaña "Usuarios" del Panel de Administración.
 *
 * ¿POR QUÉ EXISTE Y CUÁL ES SU PROPÓSITO?
 * Permite a los administradores de la plataforma supervisar las cuentas registradas,
 * su reputación acumulada, su estado disciplinario según las sanciones de la Regla RN06
 * ('active', 'suspended', 'closed') y ejecutar acciones administrativas como editar
 * los datos o dar de baja una cuenta.
 *
 * Además, respeta la Regla RN05: si un usuario tiene la privacidad de contacto activa
 * (`contactLocked: true`), su teléfono y correo se muestran como reservados hasta que
 * participe en una subasta adjudicada con trato directo.
 *
 * ¿DE DÓNDE PROVIENEN LAS PROPS?
 * - `usuario`: Objeto usuario ({ id, name, email, phone, city, role, status, reputation, contactLocked }).
 * - `indiceColor`: Número entero secuencial para rotar cíclicamente la paleta de colores del avatar.
 * - `puedeEditar`: Booleano que habilita el botón de edición.
 * - `puedeEliminar`: Booleano que habilita el botón de eliminación (se deshabilita si es la cuenta propia del admin).
 * - `alEditar`: Callback para abrir el formulario de edición de este usuario.
 * - `alEliminar`: Callback para ejecutar la baja del usuario previa confirmación.
 * ==============================================================================
 */

import React from 'react';
import { Edit3, MapPin, Phone, Shield, Star, Trash2 } from 'lucide-react';
import { formatearEstadoCuenta, obtenerIniciales } from '../../utilidades/formatos';

/** Paleta de estilos rotativos para los avatares circulares */
const COLORES_AVATAR = [
  'bg-[#EAFFD0] text-[#224F10]',
  'bg-[#B0E454] text-[#0D0D0D]',
  'bg-[#224F10] text-[#EAFFD0]',
  'bg-[#0D0D0D] text-[#B0E454]',
];

/**
 * Función auxiliar: obtenerClaseEstadoCuenta
 * ----------------------------------------------------------------------------
 * Retorna las clases de Tailwind CSS para colorear la insignia según si la
 * cuenta está activa o ha sido suspendida/cerrada por mediación RN06.
 */
function obtenerClaseEstadoCuenta(estado) {
  if (estado === 'active') return 'bg-[#F7FBF3] text-[#224F10] border-[#224F10]/15';
  return 'bg-red-50 text-red-700 border-red-200';
}

/**
 * Componente: TarjetaUsuarioPanel
 * ----------------------------------------------------------------------------
 * Renderiza la ficha de usuario con su avatar, rol, estado de cuenta,
 * teléfono/ciudad y botones de administración.
 */
export function TarjetaUsuarioPanel({
  usuario,
  indiceColor,
  puedeEditar,
  puedeEliminar,
  alEditar,
  alEliminar,
}) {
  const etiquetaEstado = formatearEstadoCuenta(usuario.status);
  const claseEstado = obtenerClaseEstadoCuenta(usuario.status);

  // Determinación de visibilidad del teléfono según la regla de contacto RN05
  let telefonoVisible = 'Sin teléfono';
  if (usuario.phone) telefonoVisible = usuario.phone;
  else if (usuario.contactLocked) telefonoVisible = 'Privado (RN05)';

  // Selección rotativa de color para el avatar usando el operador módulo (%)
  const claseAvatar = COLORES_AVATAR[indiceColor % COLORES_AVATAR.length];

  return (
    <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between gap-4 shadow-2xs">
      <div className="space-y-3">
        {/* Cabecera: Avatar, Nombre, Correo e Insignias de Rol/Estado */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar con iniciales del nombre */}
            <span
              className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${claseAvatar}`}
            >
              {obtenerIniciales(usuario.name)}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#0D0D0D] truncate">{usuario.name}</h3>
              <p className="text-[11px] text-[#0D0D0D]/55 truncate">
                {usuario.email || 'Privado hasta el cierre (RN05)'}
              </p>
            </div>
          </div>

          {/* Insignia de Rol (Admin o Socio) e Insignia de Estado de cuenta */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                usuario.role === 'admin'
                  ? 'bg-[#B0E454] text-[#0D0D0D]'
                  : 'bg-[#EAFFD0] text-[#224F10]'
              }`}
            >
              <Shield className="w-2.5 h-2.5" />
              {usuario.role.toUpperCase()}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${claseEstado}`}
            >
              {etiquetaEstado}
            </span>
          </div>
        </div>

        {/* Bloque con datos de contacto, ubicación y reputación en estrellas */}
        <div className="bg-[#F7FBF3] rounded-xl border border-[#224F10]/10 p-3.5 space-y-1.5 text-xs text-[#0D0D0D]/75">
          <p className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#224F10] shrink-0" />
            <span className="truncate">{telefonoVisible}</span>
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#224F10] shrink-0" />
            <span className="truncate">{usuario.city || 'Sin ciudad'}</span>
          </p>
          <p className="flex items-center gap-2 font-semibold text-[#0D0D0D]">
            <Star className="w-3.5 h-3.5 text-[#224F10] fill-[#B0E454] shrink-0" />
            <span>Reputación: {usuario.reputation || '5.0'} / 5.0</span>
          </p>
        </div>
      </div>

      {/* Pie con botones de acción para moderar la cuenta */}
      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#224F10]/8">
        {puedeEditar && (
          <button
            type="button"
            onClick={alEditar}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            Editar
          </button>
        )}
        {puedeEliminar && (
          <button
            type="button"
            onClick={alEliminar}
            className="w-7 h-7 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

