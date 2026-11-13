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
  return [{ valor: subasta.status, etiqueta: ETIQUETAS_ESTADO_BLOQUEADO[subasta.status] || subasta.status }];
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
          label="Fecha y Hora de Cierre *"
          disabled={bloquearCamposFinancieros}
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

      {/* 4. Fotografía del Producto (URL) */}
      <Input
        id="urlImagen"
        name="urlImagen"
        label="URL de Imagen del Producto"
        placeholder="https://images.unsplash.com/..."
        helperText="Opcional. Si se deja vacío se asignará una imagen ilustrativa."
        value={datosFormulario.urlImagen}
        onChange={alCambiar}
      />

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

