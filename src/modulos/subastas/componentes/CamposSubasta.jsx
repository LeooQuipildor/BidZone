import React from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { OPCIONES_CATEGORIAS_SUBASTA } from '../../nucleo/utilidades/formatos';
import { Input, Select, Textarea } from '../../nucleo/diseno/ui';

const ETIQUETAS_ESTADO_BLOQUEADO = {
  activa: 'Activa (En vivo)',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

// Mantiene el estado informativo del lote (el cierre automático aplica por fecha de fin RN03)
function obtenerOpcionesEstadoSubasta(subasta) {
  if (!subasta) return [];
  return [{ valor: subasta.status, etiqueta: ETIQUETAS_ESTADO_BLOQUEADO[subasta.status] || subasta.status }];
}

// Conjunto de campos visuales del formulario para publicar o editar una subasta
export function CamposSubasta({
  datosFormulario,
  estaEditando,
  subasta,
  bloquearCamposFinancieros,
  alCambiar,
}) {
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
      <Input
        id="titulo"
        name="titulo"
        label="Título del Artículo *"
        placeholder="Ej: iPhone 15 Pro Max 256GB Titanio Natural"
        value={datosFormulario.titulo}
        onChange={alCambiar}
      />

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

      {/* Gestión de hasta 4 imágenes reales del artículo */}
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

