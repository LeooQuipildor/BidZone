import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuctionStore } from '../states/auctionStore';
import { useBidStore } from '../../bids/states/bidStore';
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
import { Save, ArrowLeft } from 'lucide-react';

export function AuctionEditView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const auctions = useAuctionStore((s) => s.auctions);
  const updateAuction = useAuctionStore((s) => s.updateAuction);
  const bids = useBidStore((s) => s.bids);
  const currentUser = useAuthStore((s) => s.currentUser);

  const auction = auctions.find((a) => Number(a.id) === Number(id));
  const hasBids = bids.some((b) => Number(b.auctionId) === Number(id));
  const isAdmin = currentUser?.role === 'admin';

  const [formData, setFormData] = useState(() => ({
    title: auction?.title || '',
    description: auction?.description || '',
    category: auction?.category || 'Tecnología',
    imageUrl: auction?.imageUrl || '',
    basePrice: auction?.basePrice || '',
    minIncrement: auction?.minIncrement || '',
    status: auction?.status || 'activa',
  }));
  const [errorMsg, setErrorMsg] = useState('');

  if (!auction) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Alert type="error" title="Subasta no encontrada">
          La subasta que intentas editar no existe.
        </Alert>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/auctions')}
        >
          Volver al catálogo
        </Button>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await updateAuction(auction.id, formData, isAdmin);
      navigate(`/auctions/${auction.id}`);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={`Editar Subasta #${auction.id}`}
        subtitle="Actualiza la información del artículo o el estado de la publicación."
        action={
          <Button
            variant="outline"
            onClick={() => navigate(`/auctions/${auction.id}`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al detalle
          </Button>
        }
      />

      {hasBids && !isAdmin && (
        <Alert type="warning" title="Regla de Negocio RN08 (Inmutabilidad por Oferta)">
          Esta subasta ya cuenta con ofertas registradas. El precio base inicial está bloqueado para proteger la transparencia hacia los postores.
        </Alert>
      )}

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
            value={formData.title}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="category"
              name="category"
              label="Categoría"
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
            <Select
              id="status"
              name="status"
              label="Estado de la Subasta"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'activa', label: 'Activa (En vivo)' },
                { value: 'finalizada', label: 'Finalizada' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="basePrice"
              name="basePrice"
              type="number"
              label="Precio Base (ARS)"
              disabled={hasBids && !isAdmin}
              value={formData.basePrice}
              onChange={handleChange}
            />
            <Input
              id="minIncrement"
              name="minIncrement"
              type="number"
              label="Incremento Mínimo (ARS)"
              value={formData.minIncrement}
              onChange={handleChange}
            />
          </div>

          <Input
            id="imageUrl"
            name="imageUrl"
            label="URL de Imagen"
            value={formData.imageUrl}
            onChange={handleChange}
          />

          <Textarea
            id="description"
            name="description"
            label="Descripción del Artículo"
            value={formData.description}
            onChange={handleChange}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/auctions/${auction.id}`)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

