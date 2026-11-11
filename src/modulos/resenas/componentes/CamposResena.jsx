import React from 'react';
import { Star } from 'lucide-react';
import { mismoId } from '../../nucleo/utilidades/ayudas';
import { Select } from '../../nucleo/diseno/ui';

const PUNTUACIONES = ['5', '4', '3', '2', '1'];
const OPCIONES_ROL_RESENA = [
  { valor: 'comprador_a_vendedor', etiqueta: 'Comprador → Vendedor' },
  { valor: 'vendedor_a_comprador', etiqueta: 'Vendedor → Comprador' },
];

// Botonera de 1 a 5 estrellas para calificar la operación
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

// Selectores iniciales al emitir una reseña nueva (subasta finalizada, contraparte y rol)
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
  const opcionesSubastas = subastasElegibles.map((subasta) => {
    const yaCalificada = resenas.some(
      (item) => mismoId(item.auctionId, subasta.id) && mismoId(item.reviewerId, idUsuarioActual)
    );
    return {
      valor: String(subasta.id),
      etiqueta: `#${subasta.id} — ${subasta.title}${yaCalificada ? ' (Ya calificada)' : ''}`,
    };
  });

  const opcionesContraparte =
    otrosUsuarios.length > 0
      ? otrosUsuarios.map((usuario) => ({
          valor: String(usuario.id),
          etiqueta: usuario.email ? `${usuario.name} (${usuario.email})` : usuario.name,
        }))
      : [{ valor: '', etiqueta: 'Sin contraparte disponible' }];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Select
        id="idSubasta"
        name="idSubasta"
        label="Subasta Finalizada *"
        value={idSubastaEfectiva}
        onChange={alCambiar}
        options={opcionesSubastas}
      />
      <Select
        id="idUsuarioCalificado"
        name="idUsuarioCalificado"
        label="Usuario a Calificar *"
        disabled={bloquearContraparte}
        value={idCalificadoEfectivo}
        onChange={alCambiar}
        options={opcionesContraparte}
      />
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

