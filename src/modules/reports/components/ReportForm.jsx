import React, { useState } from 'react';
import { pickValidId } from '../../core/utils/formatters';
import { Alert, Button, Input, Select, Textarea } from '../../core/design-system/ui';
import { AlertOctagon, Save, ShieldAlert } from 'lucide-react';

const REPORT_REASON_OPTIONS = [
  { value: 'Incumplimiento de pago en plazo acordado', label: 'El ganador no realizó el pago acordado' },
  { value: 'Negativa del vendedor a entregar el artículo', label: 'El dueño del artículo se niega a entregarlo' },
  { value: 'Falta de respuesta tras liberación de datos', label: 'No responde teléfono ni correo tras ganar' },
  { value: 'Artículo distinto a la descripción publicada', label: 'El producto no coincide con lo publicado' },
];

const STATUS_OPTIONS = [
  { value: 'en_revision', label: 'En revisión / Mediación' },
  { value: 'resuelto_sancion', label: 'Resuelto con Sanción al Infractor' },
  { value: 'desestimado', label: 'Solucionado entre las partes' },
];

const ACCOUNT_ACTION_OPTIONS = [
  { value: 'none', label: 'Mantener estado actual' },
  { value: 'suspend', label: 'Infraccionar y Suspender Cuenta' },
  { value: 'close', label: 'Cerrar Cuenta Definitivamente' },
  { value: 'activate', label: 'Rehabilitar Cuenta' },
];

// Formulario único reutilizado para denunciar incumplimientos o resolver expedientes RN06
export function ReportForm({
  report = null,
  auctions = [],
  otherUsers = [],
  isAdmin = false,
  initialAuctionId = '',
  initialReportedUserId = '',
  onCreateReport,
  onUpdateReport,
  onSaved,
  onCancel,
}) {
  const isEditing = Boolean(report);
  const isLockedForReporter = Boolean(isEditing && !isAdmin && report.status !== 'en_revision');

  const [formData, setFormData] = useState(() => ({
    auctionId: report ? String(report.auctionId) : initialAuctionId,
    reportedUserId: report ? String(report.reportedUserId) : initialReportedUserId,
    reason: report ? report.reason || '' : 'Incumplimiento de pago en plazo acordado',
    description: report?.description || '',
    evidenceUrl: report?.evidenceUrl || '',
    status: report?.status || 'en_revision',
    sanctionApplied: report?.sanctionApplied || '',
    accountAction: 'none',
  }));
  const [errorMsg, setErrorMsg] = useState('');

  const effectiveAuctionId = isEditing
    ? formData.auctionId
    : pickValidId(auctions, formData.auctionId, initialAuctionId);
  const effectiveReportedUserId = isEditing
    ? formData.reportedUserId
    : pickValidId(otherUsers, formData.reportedUserId, initialReportedUserId);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.reason.trim() || !formData.description.trim()) {
      setErrorMsg('El motivo y la descripción detallada del caso son obligatorios.');
      return;
    }

    try {
      if (isEditing) {
        const payload = isAdmin
          ? formData
          : {
              reason: formData.reason.trim(),
              description: formData.description.trim(),
              evidenceUrl: formData.evidenceUrl.trim(),
            };
        const updated = await onUpdateReport(report.id, payload);
        onSaved?.(updated);
      } else {
        if (!effectiveAuctionId || !effectiveReportedUserId) {
          setErrorMsg('Debes seleccionar una subasta y el usuario denunciado.');
          return;
        }
        const created = await onCreateReport({
          auctionId: effectiveAuctionId,
          reportedUserId: effectiveReportedUserId,
          reason: formData.reason.trim(),
          description: formData.description.trim(),
          evidenceUrl: formData.evidenceUrl.trim(),
        });
        onSaved?.(created);
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  const auctionOptions = auctions.length > 0
    ? auctions.map((a) => ({ value: String(a.id), label: `#${a.id} — ${a.title}` }))
    : [{ value: '', label: 'Sin subastas registradas' }];

  const userOptions = otherUsers.length > 0
    ? otherUsers.map((u) => ({
        value: String(u.id),
        label: u.email ? `${u.name} (${u.email})` : `${u.name} (${u.city || 'Socio BidZone'})`,
      }))
    : [{ value: '', label: 'Sin usuarios disponibles' }];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isLockedForReporter && (
        <Alert type="warning" title="Expediente cerrado para edición">
          Este expediente ya fue resuelto por moderación y no admite cambios del denunciante.
        </Alert>
      )}
      {errorMsg && <Alert type="error" onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}

      {!isEditing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select id="auctionId" name="auctionId" label="Subasta Involucrada *" value={effectiveAuctionId} onChange={handleChange} options={auctionOptions} />
          <Select id="reportedUserId" name="reportedUserId" label="Usuario Denunciado *" value={effectiveReportedUserId} onChange={handleChange} options={userOptions} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isEditing ? (
          <Input id="reason" name="reason" label="Motivo del Reclamo *" disabled={isLockedForReporter} value={formData.reason} onChange={handleChange} />
        ) : (
          <Select id="reason" name="reason" label="Motivo Principal del Reclamo *" value={formData.reason} onChange={handleChange} options={REPORT_REASON_OPTIONS} />
        )}
        <Input id="evidenceUrl" name="evidenceUrl" label="Enlace de Evidencia (Opcional)" placeholder="https://..." disabled={isLockedForReporter} value={formData.evidenceUrl} onChange={handleChange} />
      </div>

      <Textarea
        id="description"
        name="description"
        label="Descripción Detallada de los Hechos *"
        placeholder="Explica los hechos y plazos incumplidos..."
        disabled={isLockedForReporter}
        value={formData.description}
        onChange={handleChange}
      />

      {isEditing && isAdmin && (
        <div className="space-y-3 pt-4 border-t border-[#224F10]/20 bg-[#F7FBF3] p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#224F10]">
            <ShieldAlert className="w-4 h-4" />
            Resolución Administrativa RN06
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select id="status" name="status" label="Estado del Expediente" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} />
            <Select id="accountAction" name="accountAction" label="Acción sobre la Cuenta" value={formData.accountAction} onChange={handleChange} options={ACCOUNT_ACTION_OPTIONS} />
          </div>
          <Input id="sanctionApplied" name="sanctionApplied" label="Dictamen / Sanción Registrada" placeholder="Ej: Suspensión temporal de cuenta..." value={formData.sanctionApplied} onChange={handleChange} />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        {!isLockedForReporter && (
          <Button type="submit">
            {isEditing ? <Save className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
            {isEditing ? 'Guardar Resolución' : 'Radicar Reporte'}
          </Button>
        )}
      </div>
    </form>
  );
}

