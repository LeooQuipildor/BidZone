/**
 * ==============================================================================
 * ARCHIVO: src/modulos/subastas/componentes/CamposSubasta.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de presentación que agrupa los campos de entrada de datos (inputs, selects, textarea)
 * para publicar o modificar una subasta.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Renderiza los controles de formulario para título, categoría, estado, fecha de cierre, precio base,
 *    incremento mínimo de puja (RN01), URL de imagen y descripción detallada.
 * 2. Aplica la regla de integridad de subastas: Si `bloquearCamposFinancieros` es `true` (porque la subasta
 *    ya recibió ofertas del público), desactiva (`disabled`) los campos de precio inicial, incremento mínimo
 *    y fecha de finalización para impedir fraudes o cambios retroactivos.
 * 3. En modo edición (`estaEditando`), expone el selector de estado informativo de la sala.
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * Son pasadas por el componente contenedor `FormularioSubasta.jsx`:
 * - `datosFormulario`: Objeto con los valores actuales de cada campo.
 * - `estaEditando`: Booleano que indica si se está modificando un lote existente.
 * - `subasta`: Objeto original de la subasta (si existe).
 * - `bloquearCamposFinancieros`: Booleano derivado de si ya tiene pujas registradas.
 * - `alCambiar`: Función manejadora de eventos `onChange` que actualiza el estado en el padre.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Fragmentos de React (`<> ... </>`):
 *   Permite devolver una lista de elementos contiguos sin agregar un `<div>` extra e innecesario al DOM.
 * - Inmutabilidad y Bloqueo de Campos (`disabled`):
 *   La integridad en sistemas de subastas exige que una vez que un comprador ofertó, el vendedor no pueda
 *   modificar el precio ni acortar la fecha arbitrariamente.
 */

import React from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { OPCIONES_CATEGORIAS_SUBASTA } from '../../nucleo/utilidades/formatos';
import { Input, Select, Textarea } from '../../nucleo/diseno/ui';

/**
 * Diccionario de equivalencias para mostrar etiquetas amigables del estado del lote.
 */
const ETIQUETAS_ESTADO_BLOQUEADO = {
  activa: 'Activa (En vivo)',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

/**
 * Función auxiliar para generar la opción de estado actual del lote.
 *
 * @param {Object|null} subasta - Objeto original de la subasta.
 * @returns {Array<{valor: string, etiqueta: string}>}
 */
function obtenerOpcionesEstadoSubasta(subasta) {
  if (!subasta) return [];
  return [{ valor: subasta.estado, etiqueta: ETIQUETAS_ESTADO_BLOQUEADO[subasta.estado] || subasta.estado }];
}

export function CamposSubasta({
  datosFormulario,
  estaEditando,
  subasta,
  bloquearCamposFinancieros,
  alCambiar,
}) {
  // Opciones de estado calculadas para el selector en modo edición
  const opcionesEstado = obtenerOpcionesEstadoSubasta(subasta);

  // Parsear URLs actuales (soporta una o varias separadas por coma)
  const listaUrls = (datosFormulario.urlImagen || '')
    .split(/[\n,]+/)
    .map((u) => u.trim());
  const urlsActuales = listaUrls.length > 0 && listaUrls[0] !== '' ? listaUrls : [''];

  function manejarCambioUrl(indice, nuevoValor) {
    const copia = [...urlsActuales];
    copia[indice] = nuevoValor;
    alCambiar({
      target: {
        name: 'urlImagen',
        value: copia.join(', '),
      },
    });
  }

  function agregarCampoFoto() {
    if (urlsActuales.length < 4) {
      const copia = [...urlsActuales, ''];
      alCambiar({
        target: {
          name: 'urlImagen',
          value: copia.join(', '),
        },
      });
    }
  }

  function quitarCampoFoto(indice) {
    const copia = urlsActuales.filter((_, i) => i !== indice);
    alCambiar({
      target: {
        name: 'urlImagen',
        value: copia.join(', '),
      },
    });
  }

  return (
    <>
      {/* 1. Título del Artículo */}
      <Input
        id="titulo"
        name="titulo"
        label="Título del Artículo *"
        placeholder="Ej: iPhone 15 Pro Max 256GB Titanio Natural"
        value={datosFormulario.titulo}
        onChange={alCambiar}
      />

      {/* 2. Categoría, Estado (si edita) y Fecha/Hora de Cierre */}
      <div className={`grid grid-cols-1 ${estaEditando ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
        <Select
          id="categoria"
          name="categoria"
          label="Categoría *"
          value={datosFormulario.categoria}
          onChange={alCambiar}
          options={OPCIONES_CATEGORIAS_SUBASTA}
        />
        {estaEditando && (
          <Select
            id="estado"
            name="estado"
            label="Estado"
            value={datosFormulario.estado}
            onChange={alCambiar}
            options={opcionesEstado}
          />
        )}
        <Input
          id="fechaFin"
          name="fechaFin"
          type="datetime-local"
          label={estaEditando ? 'Fecha y Hora de Cierre (Fijada)' : 'Fecha y Hora de Cierre *'}
          disabled={estaEditando || bloquearCamposFinancieros}
          helperText={
            estaEditando
              ? 'El tiempo de finalización no se puede modificar una vez creada la subasta.'
              : undefined
          }
          value={datosFormulario.fechaFin}
          onChange={alCambiar}
        />
      </div>

      {/* 3. Condiciones Financieras: Precio Base e Incremento Mínimo (RN01) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="precioInicial"
          name="precioInicial"
          type="number"
          min="1"
          label="Precio Base Inicial (ARS) *"
          placeholder="Ej: 500000"
          disabled={bloquearCamposFinancieros}
          value={datosFormulario.precioInicial}
          onChange={alCambiar}
        />
        <Input
          id="incrementoMinimo"
          name="incrementoMinimo"
          type="number"
          min="1"
          label="Incremento Mínimo por Puja (RN01) *"
          placeholder="Ej: 20000"
          disabled={bloquearCamposFinancieros}
          value={datosFormulario.incrementoMinimo}
          onChange={alCambiar}
        />
      </div>

      {/* 4. Gestión de hasta 4 imágenes reales del artículo */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/70 border border-[#224F10]/15">
        <div className="flex items-center justify-between gap-2">
          <div>
            <label className="text-xs font-semibold text-[#0D0D0D]/80 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#224F10]" />
              Fotos del Producto ({urlsActuales.filter(Boolean).length}/4)
            </label>
            <p className="text-[11px] text-[#0D0D0D]/55">
              Solo se mostrarán las fotos que agregues aquí (sin imágenes inventadas).
            </p>
          </div>
          {urlsActuales.length < 4 && (
            <button
              type="button"
              onClick={agregarCampoFoto}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#224F10] hover:text-[#0D0D0D] bg-[#B0E454]/30 hover:bg-[#B0E454] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar otra foto</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {urlsActuales.map((url, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  id={`urlImagen_${idx}`}
                  name={`urlImagen_${idx}`}
                  type="url"
                  placeholder={
                    idx === 0
                      ? 'https://ejemplo.com/foto-principal.jpg'
                      : `https://ejemplo.com/foto-adicional-${idx + 1}.jpg`
                  }
                  label={idx === 0 ? 'Foto principal' : `Foto adicional ${idx + 1}`}
                  value={url}
                  onChange={(e) => manejarCambioUrl(idx, e.target.value)}
                />
              </div>

              {url.trim() && (
                <div className="w-12 h-12 rounded-xl border border-[#224F10]/20 bg-white overflow-hidden shrink-0 mt-5 flex items-center justify-center p-0.5 shadow-2xs">
                  <img
                    src={url}
                    alt={`Vista previa ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => quitarCampoFoto(idx)}
                  title="Quitar foto"
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0 mt-5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Descripción y Términos de Entrega */}
      <Textarea
        id="descripcion"
        name="descripcion"
        label="Descripción y Condiciones de Entrega *"
        placeholder="Detalla el estado del artículo y cómo prefieres coordinar el pago y entrega..."
        value={datosFormulario.descripcion}
        onChange={alCambiar}
      />
    </>
  );
}

