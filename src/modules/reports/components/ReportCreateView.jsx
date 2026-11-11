import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReportStore } from '../states/reportStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
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
import { AlertOctagon, ArrowLeft } from 'lucide-react';

export function ReportCreateView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAuctionId = searchParams.get('auctionId') || '';
  const preselectedReportedUserId = searchParams.get('reportedUserId') || '';

  const createReport = useReportStore((s) => s.createReport);
  const auctions = useAuctionStore((s) => s.auctions);
  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);
  const users = useAuthStore((s) => s.users);
  const fetchUsers = useAuthStore((s) => s.fetchUsers);
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    fetchAuctions();
    fetchUsers();
  }, [fetchAuctions, fetchUsers]);

  const otherUsers = useMemo(
    () => users.filter((u) => Number(u.id) !== Number(currentUser?.id)),
    [users, currentUser?.id]
  );

  const [formData, setFormData] = useState({
    auctionId: preselectedAuctionId,
    reportedUserId: preselectedReportedUserId,
    reason: 'Incumplimiento de pago en plazo acordado',
    description: '',
    evidenceUrl: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const effectiveAuctionId = auctions.some(
    (a) => String(a.id) === String(formData.auctionId)
  )
    ? String(formData.auctionId)
    : auctions[0]
      ? String(auctions[0].id)
      : '';

  const effectiveReportedUserId = otherUsers.some(
    (u) => String(u.id) === String(formData.reportedUserId)
  )
    ? String(formData.reportedUserId)
    : otherUsers[0]
      ? String(otherUsers[0].id)
      : '';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!effectiveAuctionId || !effectiveReportedUserId) {
      setErrorMsg('Debes seleccionar una subasta y el usuario denunciado.');
      return;
    }

    if (!formData.description.trim()) {
      setErrorMsg('Por favor describe detalladamente los hechos del incumplimiento.');
      return;
    }

    try {
      await createReport({
        ...formData,
        auctionId: effectiveAuctionId,
        reportedUserId: effectiveReportedUserId,
      });
      navigate('/reports');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Informar Incumplimiento de Operación"
        subtitle="Si liberados los datos de contacto la contraparte no abona el artículo o no lo entrega, radica la denuncia para que se evalúe la infracción o cierre de cuenta."
        action={
          <Button variant="outline" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="auctionId"
              name="auctionId"
              label="Subasta Involucrada *"
              value={effectiveAuctionId}
              onChange={handleChange}
              options={
                auctions.length > 0
                  ? auctions.map((a) => ({
                      value: String(a.id),
                      label: `#${a.id} — ${a.title}`,
                    }))
                  : [{ value: '', label: 'Sin subastas registradas' }]
              }
            />
            <Select
              id="reportedUserId"
              name="reportedUserId"
              label="Usuario Denunciado *"
              value={effectiveReportedUserId}
              onChange={handleChange}
              options={
                otherUsers.length > 0
                  ? otherUsers.map((u) => ({
                      value: String(u.id),
                      label: u.email
                        ? `${u.name} (${u.email})`
                        : `${u.name} (${u.city || 'Socio BidZone'})`,
                    }))
                  : [{ value: '', label: 'Sin usuarios disponibles' }]
              }
            />
          </div>

          <Select
            id="reason"
            name="reason"
            label="Motivo Principal del Reclamo *"
            value={formData.reason}
            onChange={handleChange}
            options={[
              {
                value: 'Incumplimiento de pago en plazo acordado',
                label: 'El ganador no realizó el pago acordado',
              },
              {
                value: 'Negativa del vendedor a entregar el artículo',
                label: 'El dueño del artículo se niega a entregarlo',
              },
              {
                value: 'Falta de respuesta tras liberación de datos',
                label: 'No responde teléfono ni correo tras ganar',
              },
              {
                value: 'Artículo distinto a la descripción publicada',
                label: 'El producto no coincide con lo publicado',
              },
            ]}
          />

          <Input
            id="evidenceUrl"
            name="evidenceUrl"
            label="Enlace a Evidencia / Captura de Conversación"
            placeholder="https://evidencia.bidzone.com/captura-whatsapp..."
            value={formData.evidenceUrl}
            onChange={handleChange}
          />

          <Textarea
            id="description"
            name="description"
            label="Descripción Detallada de los Hechos *"
            placeholder="Explica cuándo intentaste comunicarte con la contraparte y qué ocurrió durante la coordinación..."
            value={formData.description}
            onChange={handleChange}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => navigate('/reports')}>
              Cancelar
            </Button>
            <Button type="submit">
              <AlertOctagon className="w-4 h-4" />
              Enviar Reporte a Moderación
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

