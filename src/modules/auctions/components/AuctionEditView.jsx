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
  ErrorStateCard,
} from '../../core/design-system/ui';
import {
  AUCTION_CATEGORY_OPTIONS,
  DEFAULT_AUCTION_IMAGE_URL,
  findById,
  sameId,
  toIsoFromLocalInput,
  toLocalDatetimeInputValue,
} from '../../core/utils/formatters';
import { Save, ArrowLeft } from 'lucide-react';

// Calcula qué estados puede seleccionar el usuario al editar esta subasta
function getAuctionStatusOptions(auction, hasBids, isAdmin) {
  if (isAdmin) {
    return [
      { value: 'activa', label: 'Activa (En vivo)' },
      { value: 'finalizada', label: 'Finalizada' },
      { value: 'cancelada', label: 'Cancelada' },
    ];
  }

  // Un vendedor solo puede cancelar su subasta si todavía no recibió ofertas
  if (auction.status === 'activa' && !hasBids) {
    return [
      { value: 'activa', label: 'Activa (En vivo)' },
      { value: 'cancelada', label: 'Cancelar subasta' },
    ];
  }

  let currentLabel = 'Cancelada';
  if (auction.status === 'activa') {
    currentLabel =
      'Activa (En vivo — usa "Finalizar y Adjudicar" en el detalle)';
  } else if (auction.status === 'finalizada') {
    currentLabel = 'Finalizada';
  }

  return [{ value: auction.status, label: currentLabel }];
}

function AuctionEditForm({
  auction,
  hasBids,
  isAdmin,
  updateAuction,
  navigate,
}) {
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

  const lockFinancialFields = hasBids && !isAdmin;
  const statusOptions = getAuctionStatusOptions(auction, hasBids, isAdmin);

  function handleChange(e) {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    setFormData((prev) => ({ ...prev, [fieldName]: fieldValue }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      imageUrl: formData.imageUrl.trim() || DEFAULT_AUCTION_IMAGE_URL,
    };

    // RN08: si ya hay pujas, solo el administrador puede cambiar precios o fecha de cierre
    if (!lockFinancialFields) {
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
  }

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

      {lockFinancialFields && (
        <Alert
          type="warning"
          title="Regla de Negocio RN08 (Inmutabilidad por Oferta)"
        >
          Esta subasta ya cuenta con ofertas registradas. El precio base,
          incremento mínimo y cierre quedan bloqueados para proteger la
          transparencia hacia los postores.
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
              options={AUCTION_CATEGORY_OPTIONS}
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
              disabled={lockFinancialFields}
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
              disabled={lockFinancialFields}
              value={formData.basePrice}
              onChange={handleChange}
            />
            <Input
              id="minIncrement"
              name="minIncrement"
              type="number"
              label="Incremento Mínimo (ARS)"
              disabled={lockFinancialFields}
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

  let auction = null;
  if (currentAuctionDetail && sameId(currentAuctionDetail.id, id)) {
    auction = currentAuctionDetail;
  } else {
    auction = findById(auctions, id);
  }

  if (detailLoading && !auction) {
    return <Spinner label="Cargando subasta..." />;
  }

  if (!auction) {
    return (
      <ErrorStateCard
        title="Subasta no encontrada"
        message="La subasta que intentas editar no existe."
        buttonLabel="Volver al catálogo"
        onBack={() => navigate('/auctions')}
      />
    );
  }

  const isAdmin = currentUser?.role === 'admin';
  const isOwner = sameId(currentUser?.id, auction.sellerId);

  if (!isAdmin && !isOwner) {
    return (
      <ErrorStateCard
        title="Sin permisos de edición"
        message="Solo el vendedor propietario o un administrador puede editar esta subasta."
        buttonLabel="Volver al detalle"
        onBack={() => navigate(`/auctions/${auction.id}`)}
      />
    );
  }

  const hasBids =
    Number(auction.bidCount || 0) > 0 ||
    (Array.isArray(auction.bids) && auction.bids.length > 0) ||
    bids.some((b) => sameId(b.auctionId, id));

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
