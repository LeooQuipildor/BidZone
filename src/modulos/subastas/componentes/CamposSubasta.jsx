import React from 'react';
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
          label="Fecha y Hora de Cierre *"
          disabled={bloquearCamposFinancieros}
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

      <Input
        id="urlImagen"
        name="urlImagen"
        label="URL de Imagen del Producto"
        placeholder="https://images.unsplash.com/..."
        helperText="Opcional. Si se deja vacío se asignará una imagen ilustrativa."
        value={datosFormulario.urlImagen}
        onChange={alCambiar}
      />

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

