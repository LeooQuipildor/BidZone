import React, { useState } from 'react';
import {
  AUCTION_CATEGORY_OPTIONS,
  DEFAULT_AUCTION_IMAGE_URL,
  toIsoFromLocalInput,
  toLocalDatetimeInputValue,
} from '../../core/utils/formatters';
import { Alert, Button, Input, Select, Textarea } from '../../core/design-system/ui';
import { Gavel, Save } from 'lucide-react';

// Calcula qué estados puede elegir el usuario al editar una subasta
function getAuctionStatusOptions(auction, hasBids, isAdmin) {
  if (!auction) return [];
  if (isAdmin) {
    return [
      { value: 'activa', label: 'Activa (En vivo)' },
      { value: 'finalizada', label: 'Finalizada' },
      { value: 'cancelada', label: 'Cancelada' },
    ];
  }
  if (auction.status === 'activa' && !hasBids) {
    return [
      { value: 'activa', label: 'Activa (En vivo)' },
      { value: 'cancelada', label: 'Cancelar subasta' },
    ];
  }
  const labels = {
    activa: 'Activa (En vivo — usa "Finalizar y Adjudicar")',
    finalizada: 'Finalizada',
    cancelada: 'Cancelada',
  };
  return [{ value: auction.status, label: labels[auction.status] || auction.status }];
}

// Formulario único reutilizado para crear o editar una subasta (Panel y vistas /new y /edit)
export function AuctionForm({
  auction = null,
  hasBids = false,
  isAdmin = false,
  onSubmitForm,
  onCloseNow = null,
  onCancel,
  submitLabel,
}) {
  const isEditing = Boolean(auction);
  const initialEndTime = toLocalDatetimeInputValue(auction?.endTime);

  const [formData, setFormData] = useState(() => ({
    title: auction?.title || '',
    description: auction?.description || '',
    category: auction?.category || 'Tecnología',
    imageUrl: auction?.imageUrl || '',
    basePrice: auction ? String(auction.basePrice ?? '') : '',
    minIncrement: auction ? String(auction.minIncrement ?? '') : '',
    status: auction?.status || 'activa',
    endTime: initialEndTime,
  }));
  const [errorMsg, setErrorMsg] = useState('');

  // RN08: si ya recibió ofertas, solo un administrador puede cambiar precios o cierre
  const lockFinancialFields = Boolean(isEditing && hasBids && !isAdmin);
  const statusOptions = getAuctionStatusOptions(auction, hasBids, isAdmin);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMsg('Por favor completa el título y la descripción del artículo.');
      return;
    }

    if (!isEditing) {
      const endTimestamp = new Date(formData.endTime).getTime();
      if (Number.isNaN(endTimestamp) || endTimestamp <= Date.now()) {
        setErrorMsg('La fecha y hora de cierre debe ser posterior al momento actual.');
        return;
      }
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      imageUrl: formData.imageUrl.trim() || DEFAULT_AUCTION_IMAGE_URL,
    };

    if (!lockFinancialFields) {
      payload.basePrice = formData.basePrice;
      payload.minIncrement = formData.minIncrement;
      if (!isEditing || (formData.endTime && formData.endTime !== initialEndTime)) {
        payload.endTime = toIsoFromLocalInput(formData.endTime);
      }
    }

    if (isEditing && formData.status !== auction.status) {
      payload.status = formData.status;
    }

    try {
      await onSubmitForm(payload);
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {lockFinancialFields && (
        <Alert type="warning" title="Regla de Negocio RN08 (Inmutabilidad por Oferta)">
          Esta subasta ya cuenta con ofertas registradas. El precio base, incremento mínimo y cierre quedan
          bloqueados para proteger a los postores.
        </Alert>
      )}

      {errorMsg && <Alert type="error" onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}

      <Input id="title" name="title" label="Título del Artículo *" placeholder="Ej: iPhone 15 Pro Max 256GB Titanio Natural" value={formData.title} onChange={handleChange} />

      <div className={`grid grid-cols-1 ${isEditing ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
        <Select id="category" name="category" label="Categoría *" value={formData.category} onChange={handleChange} options={AUCTION_CATEGORY_OPTIONS} />
        {isEditing && (
          <Select id="status" name="status" label="Estado" value={formData.status} onChange={handleChange} options={statusOptions} />
        )}
        <Input id="endTime" name="endTime" type="datetime-local" label="Fecha y Hora de Cierre *" disabled={lockFinancialFields} value={formData.endTime} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="basePrice" name="basePrice" type="number" min="1" label="Precio Base Inicial (ARS) *" placeholder="Ej: 500000" disabled={lockFinancialFields} value={formData.basePrice} onChange={handleChange} />
        <Input id="minIncrement" name="minIncrement" type="number" min="1" label="Incremento Mínimo por Puja (RN01) *" placeholder="Ej: 20000" disabled={lockFinancialFields} value={formData.minIncrement} onChange={handleChange} />
      </div>

      <Input id="imageUrl" name="imageUrl" label="URL de Imagen del Producto" placeholder="https://images.unsplash.com/..." helperText="Opcional. Si se deja vacío se asignará una imagen ilustrativa." value={formData.imageUrl} onChange={handleChange} />

      <Textarea id="description" name="description" label="Descripción y Condiciones de Entrega *" placeholder="Detalla el estado del artículo y cómo prefieres coordinar el pago y entrega..." value={formData.description} onChange={handleChange} />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
        <div>
          {isEditing && auction.status === 'activa' && onCloseNow && (
            <Button variant="secondary" onClick={onCloseNow}>
              <Gavel className="w-4 h-4" />
              Finalizar y Adjudicar Ahora
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">
            <Save className="w-4 h-4" />
            {submitLabel || (isEditing ? 'Guardar Cambios' : 'Publicar Subasta')}
          </Button>
        </div>
      </div>
    </form>
  );
}
