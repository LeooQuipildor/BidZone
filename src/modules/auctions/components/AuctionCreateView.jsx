import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuctionStore } from '../states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import {
  Card,
  Input,
  Select,
  Textarea,
  Button,
  PageHeader,
  Alert,
} from '../../core/design-system/ui';
import { PlusCircle, ArrowLeft } from 'lucide-react';

export function AuctionCreateView() {
  const navigate = useNavigate();
  const createAuction = useAuctionStore((s) => s.createAuction);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [formData, setFormData] = useState(() => ({
    title: '',
    description: '',
    category: 'Tecnología',
    imageUrl: '',
    basePrice: '',
    minIncrement: '',
    endTime: new Date(Date.now() + 24 * 3600 * 1000)
      .toISOString()
      .slice(0, 16),
  }));
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMsg('Por favor completa el título y la descripción del artículo.');
      return;
    }

    if (new Date(formData.endTime).getTime() <= Date.now()) {
      setErrorMsg('La fecha y hora de cierre debe ser posterior al momento actual.');
      return;
    }

    try {
      const created = await createAuction({
        ...formData,
        sellerId: currentUser.id,
      });
      navigate(`/auctions/${created.id}`);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Publicar Nueva Subasta"
        subtitle="Define las condiciones de subasta. Al finalizar con ganador, se liberarán mutuamente los datos de contacto."
        action={
          <Button variant="outline" onClick={() => navigate('/auctions')}>
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </Button>
        }
      />

      <Card className="p-6">
        {errorMsg && (
          <div className="mb-4">
            <Alert type="error" onClose={() => setErrorMsg('')}>
              {errorMsg}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="title"
            name="title"
            label="Título del Artículo *"
            placeholder="Ej: iPhone 15 Pro Max 256GB Titanio Natural"
            value={formData.title}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="category"
              name="category"
              label="Categoría *"
              value={formData.category}
              onChange={handleChange}
              options={[
                { value: 'Tecnología', label: 'Tecnología' },
                { value: 'Gaming', label: 'Gaming' },
                { value: 'Hogar y Oficina', label: 'Hogar y Oficina' },
                { value: 'Deportes', label: 'Deportes' },
                { value: 'Fotografía', label: 'Fotografía' },
                { value: 'Vehículos', label: 'Vehículos' },
              ]}
            />
            <Input
              id="endTime"
              name="endTime"
              type="datetime-local"
              label="Fecha y Hora de Cierre *"
              value={formData.endTime}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="basePrice"
              name="basePrice"
              type="number"
              min="1"
              label="Precio Base Inicial (ARS) *"
              placeholder="Ej: 500000"
              value={formData.basePrice}
              onChange={handleChange}
            />
            <Input
              id="minIncrement"
              name="minIncrement"
              type="number"
              min="1"
              label="Incremento Mínimo por Puja (RN01) *"
              placeholder="Ej: 20000"
              value={formData.minIncrement}
              onChange={handleChange}
            />
          </div>

          <Input
            id="imageUrl"
            name="imageUrl"
            label="URL de Imagen del Producto"
            placeholder="https://images.unsplash.com/..."
            helperText="Opcional. Si se deja vacío se asignará una imagen ilustrativa."
            value={formData.imageUrl}
            onChange={handleChange}
          />

          <Textarea
            id="description"
            name="description"
            label="Descripción y Condiciones de Entrega *"
            placeholder="Detalla el estado del artículo, accesorios incluidos y cómo prefieres coordinar el pago/entrega con el ganador..."
            value={formData.description}
            onChange={handleChange}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => navigate('/auctions')}>
              Cancelar
            </Button>
            <Button type="submit">
              <PlusCircle className="w-4 h-4" />
              Publicar Subasta
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

