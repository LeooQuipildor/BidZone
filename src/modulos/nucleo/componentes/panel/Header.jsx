/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/Header.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de cabecera superior del Panel de Control (`VistaPanelControl.jsx`).
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Muestra una barra de búsqueda transversal contextual que adapta su placeholder
 *    según la pestaña actualmente activa (definido en el diccionario `TEXTOS_BUSCADOR`).
 * 2. Si hay texto escrito en el buscador, expone un botón "X" para limpiarlo con un solo clic.
 * 3. En el extremo derecho, renderiza un chip con la identidad del usuario en sesión:
 *    - Avatar circular con sus iniciales generado por `obtenerIniciales`.
 *    - Nombre de pila, rol formateado (`ADMINISTRADOR` o `USUARIO`) y su calificación en estrellas (RN07).
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * Son pasadas por `VistaPanelControl.jsx`:
 * - `seccionActiva`: Identificador de la pestaña activa ('resumen', 'subastas', etc.).
 * - `textoBusqueda`: String con el texto tipeado por el usuario.
 * - `alCambiarBusqueda`: Callback que actualiza el estado en el padre y reinicia la paginación a la página 1.
 * - `usuarioActual`: Objeto de la sesión activa en `usarTiendaAutenticacion`.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Placeholders Contextuales Dinámicos:
 *   `placeholder={TEXTOS_BUSCADOR[seccionActiva] || TEXTOS_BUSCADOR.resumen}`
 *   Ofrece pistas claras al usuario sobre qué puede buscar en esa pantalla específica.
 */

import React from 'react';
import { Search, X } from 'lucide-react';
import { formatearRolUsuario, obtenerIniciales } from '../../utilidades/formatos';

/**
 * Textos orientativos de búsqueda según la pestaña activa.
 */
const TEXTOS_BUSCADOR = {
  resumen: 'Buscar en mi resumen o cierres...',
  subastas: 'Buscar subasta por título o categoría...',
  pujas: 'Buscar en mis pujas...',
  reportes: 'Buscar ticket, #id o motivo...',
  resenas: 'Buscar en mis reseñas...',
  usuarios: 'Buscar usuario por nombre, correo o ciudad...',
  notificaciones: 'Buscar en mis notificaciones...',
  perfil: 'Buscar en tu panel...',
};

export function Header({ seccionActiva, textoBusqueda, alCambiarBusqueda, usuarioActual }) {
  // Formateo en español del rol ('Administrador' o 'Usuario')
  const rolTexto = formatearRolUsuario(usuarioActual?.role);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
      {/* 1. Barra de Búsqueda Contextual */}
      <div className="flex items-center gap-2 bg-white border border-[#224F10]/12 rounded-2xl px-3.5 py-2 w-full sm:max-w-sm shadow-2xs">
        <Search className="w-4 h-4 text-[#0D0D0D]/45 shrink-0" />
        <input
          type="text"
          value={textoBusqueda}
          onChange={(evento) => alCambiarBusqueda(evento.target.value)}
          placeholder={TEXTOS_BUSCADOR[seccionActiva] || TEXTOS_BUSCADOR.resumen}
          className="w-full bg-transparent text-xs text-[#0D0D0D] placeholder-[#0D0D0D]/40 focus:outline-none"
        />
        {/* Botón para borrar el texto de búsqueda rápidamente */}
        {textoBusqueda && (
          <button
            type="button"
            onClick={() => alCambiarBusqueda('')}
            title="Limpiar búsqueda"
            className="text-[#0D0D0D]/45 hover:text-[#0D0D0D] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Chip de Identidad del Usuario Logueado */}
      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        <div className="w-8 h-8 rounded-full bg-[#224F10] text-[#B0E454] font-bold text-xs flex items-center justify-center shrink-0">
          {obtenerIniciales(usuarioActual?.name)}
        </div>
        <div className="text-left leading-tight">
          <p className="text-xs font-bold text-[#0D0D0D]">{usuarioActual?.name}</p>
          <p className="text-[11px] text-[#0D0D0D]/55">
            {rolTexto} · {usuarioActual?.reputation || '5.0'} ★
          </p>
        </div>
      </div>
    </div>
  );
}
