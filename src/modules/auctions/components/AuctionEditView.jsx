import React, { useEffect, useState } from 'react';
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
  Spinner,
} from '../../core/design-system/ui';
import {
  DEFAULT_AUCTION_IMAGE_URL,
  toIsoFromLocalInput,
  toLocalDatetimeInputValue,
} from '../../core/utils/formatters';
import { Save, ArrowLeft } from 'lucide-react';

function AuctionEditForm({ auction, hasBids, isAdmin, updateAuction, navigate }) {
  const initialEndTime = toLocalDatetimeInputValue(auction.endTime);

  const [formData, setFormData] = useState({
    title: auction.title || '',
    description: auction.description || '',
    category: auction.category || 'Tecnología',
    imageUrl: auction.imageUrl || '',
    basePrice: String(auction.basePrice ?? ''),
    minIncrement: String(auction.minIncrement ?? ''),
    status: auction.status || 'activa',
    endTime: initialEndTime,
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      imageUrl: formData.imageUrl.trim() || DEFAULT_AUCTION_IMAGE_URL,
    };

    if (!hasBids || isAdmin) {
      payload.basePrice = formData.basePrice;
      payload.minIncrement = formData.minIncrement;
      if (formData.endTime && formData.endTime !== initialEndTime) {
        payload.endTime = toIsoFromLocalInput(formData.endTime);
      }
    }

    if (formData.status !== auction.status) {
      payload.status = formData.status;
    }

    try {
      await updateAuction(auction.id, payload);
      navigate(`/auctions/${auction.id}`);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const statusOptions = isAdmin
    ? [
        { value: 'activa', label: 'Activa (En vivo)' },
        { value: 'finalizada', label: 'Finalizada' },
        { value: 'cancelada', label: 'Cancelada' },
      ]
    : auction.status === 'activa' && !hasBids
      ? [
          { value: 'activa', label: 'Activa (En vivo)' },
          { value: 'cancelada', label: 'Cancelar subasta' },
        ]
      : [
          {
            value: auction.status,
            label:
              auction.status === 'activa'
                ? 'Activa (En vivo — usa "Finalizar y Adjudicar" en el detalle)'
                : auction.status === 'finalizada'
                  ? 'Finalizada'
                  : 'Cancelada',
          },
        ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={`Editar Subasta #${auction.id}`}
        subtitle="Actualiza la información del artículo o las condiciones de la publicación."
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
          Esta subasta ya cuenta con ofertas registradas. El precio base, incremento mínimo y cierre quedan bloqueados para proteger la transparencia hacia los postores.
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              options={statusOptions}
            />
            <Input
              id="endTime"
              name="endTime"
              type="datetime-local"
              label="Fecha de Cierre"
              disabled={hasBids && !isAdmin}
              value={formData.endTime}
              onChange={handleChange}
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
              disabled={hasBids && !isAdmin}
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

export function AuctionEditView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const auctions = useAuctionStore((s) => s.auctions);
  const currentAuctionDetail = useAuctionStore((s) => s.currentAuctionDetail);
  const detailLoading = useAuctionStore((s) => s.detailLoading);
  const fetchAuctionById = useAuctionStore((s) => s.fetchAuctionById);
  const updateAuction = useAuctionStore((s) => s.updateAuction);
  const bids = useBidStore((s) => s.bids);
  const fetchBids = useBidStore((s) => s.fetchBids);
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    fetchAuctionById(id);
    fetchBids();
  }, [id, fetchAuctionById, fetchBids]);

  const auction =
    (currentAuctionDetail && Number(currentAuctionDetail.id) === Number(id)
      ? currentAuctionDetail
      : null) || auctions.find((a) => Number(a.id) === Number(id));

  if (detailLoading && !auction) {
    return <Spinner label="Cargando subasta..." />;
  }

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

  const isAdmin = currentUser?.role === 'admin';
  const isOwner = Number(currentUser?.id) === Number(auction.sellerId);

  if (!isAdmin && !isOwner) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Alert type="error" title="Sin permisos de edición">
          Solo el vendedor propietario o un administrador puede editar esta subasta.
        </Alert>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate(`/auctions/${auction.id}`)}
        >
          Volver al detalle
        </Button>
      </div>
    );
  }

  const hasBids =
    Number(auction.bidCount ?? 0) > 0 ||
    (Array.isArray(auction.bids) && auction.bids.length > 0) ||
    bids.some((b) => Number(b.auctionId) === Number(id));

  return (
    <AuctionEditForm
      key={`${auction.id}-${auction.updatedAt || auction.endTime}`}
      auction={auction}
      hasBids={hasBids}
      isAdmin={isAdmin}
      updateAuction={updateAuction}
      navigate={navigate}
    />
  );
}
