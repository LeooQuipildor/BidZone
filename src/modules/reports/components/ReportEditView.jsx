import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReportStore } from '../states/reportStore';
import { useAuthStore } from '../../auth/states/authStore';
import { findById, sameId } from '../../core/utils/formatters';
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
import { Save, ArrowLeft, ShieldAlert } from 'lucide-react';

function ReportEditForm({
  report,
  reportedUser,
  isAdmin,
  updateReport,
  navigate,
}) {
  const [formData, setFormData] = useState({
    reason: report.reason || '',
    description: report.description || '',
    evidenceUrl: report.evidenceUrl || '',
    status: report.status || 'en_revision',
    sanctionApplied: report.sanctionApplied || '',
    accountAction: 'none',
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Si el expediente ya fue cerrado por moderación, el denunciante común no puede editarlo
  const isLockedForReporter = !isAdmin && report.status !== 'en_revision';

  function handleChange(e) {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    setFormData((prev) => ({ ...prev, [fieldName]: fieldValue }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    const payload = isAdmin
      ? formData
      : {
          reason: formData.reason,
          description: formData.description,
          evidenceUrl: formData.evidenceUrl,
        };

    try {
      await updateReport(report.id, payload);
      navigate('/reports');
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  const reportedName =
    reportedUser?.name ||
    report.reportedUserName ||
    `#${report.reportedUserId}`;
  const reportedStatus = reportedUser?.status
    ? `Estado actual: ${reportedUser.status}`
    : 'En evaluación';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={`Expediente de reporte #${report.id}`}
        subtitle={`Usuario denunciado: ${reportedName} (${reportedStatus})`}
        action={
          <Button variant="outline" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
          </Button>
        }
      />

      {isLockedForReporter && (
        <Alert type="warning" title="Expediente cerrado para edición">
          Este expediente ya fue resuelto por moderación y no admite cambios del
          denunciante.
        </Alert>
      )}

      <Card className="p-6 sm:p-8 rounded-3xl">
        {errorMsg && (
          <div className="mb-4">
            <Alert type="error" onClose={() => setErrorMsg('')}>
              {errorMsg}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="reason"
            name="reason"
            label="Motivo del Reclamo *"
            disabled={isLockedForReporter}
            value={formData.reason}
            onChange={handleChange}
          />

          <Input
            id="evidenceUrl"
            name="evidenceUrl"
            label="Enlace de Evidencia"
            disabled={isLockedForReporter}
            value={formData.evidenceUrl}
            onChange={handleChange}
          />

          <Textarea
            id="description"
            name="description"
            label="Descripción del Caso *"
            disabled={isLockedForReporter}
            value={formData.description}
            onChange={handleChange}
          />

          {/* Panel exclusivo de administradores para aplicar sanciones (RN06) */}
          {isAdmin && (
            <div className="space-y-4 pt-4 border-t border-[#224F10]/20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#224F10]">
                <ShieldAlert className="w-4 h-4" />
                Resolución Administrativa y Sanción de Cuenta (RN06)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  id="status"
                  name="status"
                  label="Estado del Expediente"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    { value: 'en_revision', label: 'En revisión / Mediación' },
                    {
                      value: 'resuelto_sancion',
                      label: 'Resuelto con Sanción al Infractor',
                    },
                    {
                      value: 'desestimado',
                      label: 'Solucionado entre las partes',
                    },
                  ]}
                />

                <Select
                  id="accountAction"
                  name="accountAction"
                  label="Acción sobre la Cuenta Denunciada"
                  value={formData.accountAction}
                  onChange={handleChange}
                  options={[
                    { value: 'none', label: 'Mantener estado actual' },
                    {
                      value: 'suspend',
                      label: 'Infraccionar y Suspender Cuenta',
                    },
                    {
                      value: 'close',
                      label: 'Cerrar Cuenta Definitivamente',
                    },
                    { value: 'activate', label: 'Rehabilitar Cuenta' },
                  ]}
                />
              </div>

              <Input
                id="sanctionApplied"
                name="sanctionApplied"
                label="Dictamen / Sanción Registrada"
                placeholder="Ej: Cierre definitivo de cuenta por falta de pago reiterada."
                value={formData.sanctionApplied}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => navigate('/reports')}>
              Cancelar
            </Button>
            {!isLockedForReporter && (
              <Button type="submit">
                <Save className="w-4 h-4" />
                Guardar Expediente
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

export function ReportEditView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const reports = useReportStore((s) => s.reports);
  const reportsLoading = useReportStore((s) => s.loading);
  const fetchReports = useReportStore((s) => s.fetchReports);
  const updateReport = useReportStore((s) => s.updateReport);
  const currentUser = useAuthStore((s) => s.currentUser);
  const users = useAuthStore((s) => s.users);
  const fetchUsers = useAuthStore((s) => s.fetchUsers);

  useEffect(() => {
    fetchReports();
    fetchUsers();
  }, [fetchReports, fetchUsers]);

  const report = findById(reports, id);
  const isAdmin = currentUser?.role === 'admin';

  if (reportsLoading && !report) {
    return <Spinner label="Cargando expediente..." />;
  }

  if (!report) {
    return (
      <ErrorStateCard
        title="Reporte no encontrado"
        message="El expediente solicitado no existe o no tienes acceso para consultarlo."
        buttonLabel="Volver a Reportes"
        onBack={() => navigate('/reports')}
      />
    );
  }

  const isReporter = sameId(currentUser?.id, report.reporterId);
  if (!isAdmin && !isReporter) {
    return (
      <ErrorStateCard
        title="Sin permisos de edición"
        message="Solo el denunciante original o un administrador puede modificar este reporte."
        buttonLabel="Volver a Reportes"
        onBack={() => navigate('/reports')}
      />
    );
  }

  const reportedUser = findById(users, report.reportedUserId);

  return (
    <ReportEditForm
      key={`${report.id}-${report.updatedAt || report.status}`}
      report={report}
      reportedUser={reportedUser}
      isAdmin={isAdmin}
      updateReport={updateReport}
      navigate={navigate}
    />
  );
}
