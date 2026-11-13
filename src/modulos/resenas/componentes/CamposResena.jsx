/**
 * ==============================================================================
 * ARCHIVO: src/modulos/resenas/componentes/CamposResena.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Contiene componentes de presentación para el sistema de reputación y reseñas (RN07):
 * 1. `SelectorEstrellas`: Botonera de puntuación visual con 5 estrellas interactivas.
 * 2. `CamposSeleccionResena`: Fila de selectores para asociar la subasta finalizada, la contraparte y el rol.
 *
 * ¿QUÉ HACEN ESTOS COMPONENTES?
 * - `SelectorEstrellas`: Permite al usuario calificar la transacción entre 1 y 5 estrellas,
 *   resaltando la opción seleccionada con colores distintivos.
 * - `CamposSeleccionResena`: Muestra las subastas en las que el usuario participó (añadiendo la leyenda
 *   "(Ya calificada)" si corresponde) y permite identificar al comprador o vendedor que recibe la opinión.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Botones tipo Radio Visual (Visual Radio Buttons):
 *   Aunque lógicamente se comporta como un grupo de radio buttons, se renderiza con `<button type="button">`
 *   y estilos redondeados tipo píldora para una experiencia de usuario más moderna y táctil.
 * - Inhabilitación Selectiva de Contraparte:
 *   Si el usuario ingresó desde el botón "Calificar Operación" del detalle de subasta, el sistema ya sabe
 *   quién es la contraparte y bloquea el selector con `disabled={bloquearContraparte}` para evitar errores.
 */

import React from 'react';
import { Star } from 'lucide-react';
import { mismoId } from '../../nucleo/utilidades/ayudas';
import { Select } from '../../nucleo/diseno/ui';

/**
 * Puntuaciones numéricas permitidas por la regla RN07 (de 1 a 5 estrellas).
 */
const PUNTUACIONES = ['5', '4', '3', '2', '1'];

/**
 * Roles recíprocos de calificación en la plataforma.
 */
const OPCIONES_ROL_RESENA = [
  { valor: 'comprador_a_vendedor', etiqueta: 'Comprador → Vendedor' },
  { valor: 'vendedor_a_comprador', etiqueta: 'Vendedor → Comprador' },
];

/**
 * Componente `SelectorEstrellas`:
 *
 * @param {Object} props
 * @param {string} props.valorActual - Puntuación elegida actualmente ('1'..'5').
 * @param {Function} props.alElegir - Callback que recibe el valor string seleccionado.
 */
export function SelectorEstrellas({ valorActual, alElegir }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#0D0D0D]/80 block">
        Puntuación (1 a 5 Estrellas) *
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {PUNTUACIONES.map((valor) => {
          const seleccionada = valorActual === valor;
          return (
            <button
              key={valor}
              type="button"
              onClick={() => alElegir(valor)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                seleccionada
                  ? 'bg-[#224F10] text-[#EAFFD0] border-[#224F10]'
                  : 'bg-white text-[#0D0D0D]/75 border-[#224F10]/20 hover:bg-[#EAFFD0]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 fill-[#B0E454] ${seleccionada ? 'text-[#B0E454]' : 'text-[#224F10]'}`} />
              <span>{valor} ★</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Componente `CamposSeleccionResena`:
 *
 * @param {Object} props
 * @param {Array} props.subastasElegibles - Subastas finalizadas donde participó el usuario.
 * @param {Array} props.otrosUsuarios - Posibles usuarios contraparte.
 * @param {Array} props.resenas - Historial de reseñas para verificar si ya fue calificada.
 * @param {string|number} props.idUsuarioActual - ID del usuario en sesión.
 * @param {string} props.idSubastaEfectiva - ID de la subasta seleccionada.
 * @param {string} props.idCalificadoEfectivo - ID del usuario a calificar.
 * @param {string} props.rolEfectivo - Rol de la reseña ('comprador_a_vendedor', etc.).
 * @param {boolean} props.bloquearContraparte - Si es true, inhabilita cambiar la contraparte.
 * @param {Function} props.alCambiar - Callback de cambio de campos.
 */
export function CamposSeleccionResena({
  subastasElegibles,
  otrosUsuarios,
  resenas,
  idUsuarioActual,
  idSubastaEfectiva,
  idCalificadoEfectivo,
  rolEfectivo,
  bloquearContraparte,
  alCambiar,
}) {
  // Mapeo de subastas con indicación de si ya fue calificada por este usuario
  const opcionesSubastas = subastasElegibles.map((subasta) => {
    const yaCalificada = resenas.some(
      (item) => mismoId(item.auctionId, subasta.id) && mismoId(item.reviewerId, idUsuarioActual)
    );
    return {
      valor: String(subasta.id),
      etiqueta: `#${subasta.id} — ${subasta.title}${yaCalificada ? ' (Ya calificada)' : ''}`,
    };
  });

  // Mapeo de usuarios contraparte
  const opcionesContraparte =
    otrosUsuarios.length > 0
      ? otrosUsuarios.map((usuario) => ({
          valor: String(usuario.id),
          etiqueta: usuario.email ? `${usuario.name} (${usuario.email})` : usuario.name,
        }))
      : [{ valor: '', etiqueta: 'Sin contraparte disponible' }];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Selector de Subasta Finalizada */}
      <Select
        id="idSubasta"
        name="idSubasta"
        label="Subasta Finalizada *"
        value={idSubastaEfectiva}
        onChange={alCambiar}
        options={opcionesSubastas}
      />

      {/* 2. Selector de Usuario Contraparte */}
      <Select
        id="idUsuarioCalificado"
        name="idUsuarioCalificado"
        label="Usuario a Calificar *"
        disabled={bloquearContraparte}
        value={idCalificadoEfectivo}
        onChange={alCambiar}
        options={opcionesContraparte}
      />

      {/* 3. Selector de Rol en la Operación */}
      <Select
        id="contextoRol"
        name="contextoRol"
        label="Rol en la Operación"
        disabled={bloquearContraparte}
        value={rolEfectivo}
        onChange={alCambiar}
        options={OPCIONES_ROL_RESENA}
      />
    </div>
  );
}

