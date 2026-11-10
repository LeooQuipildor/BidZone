import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReportStore } from '../states/reportStore';
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
import { Save, ArrowLeft, ShieldAlert } from 'lucide-react';

export function ReportEditView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const reports = useReportStore((s) => s.reports);
  const updateReport = useReportStore((s) => s.updateReport);
  const currentUser = useAuthStore((s) => s.currentUser);
  const users = useAuthStore((s) => s.users);

  const report = reports.find((r) => Number(r.id) === Number(id));
  const isAdmin = currentUser?.role === 'admin';

  const [formData, setFormData] = useState(() => ({
    reason: report?.reason || '',
    description: report?.description || '',
    evidenceUrl: report?.evidenceUrl || '',
    status: report?.status || 'en_revision',
    sanctionApplied: report?.sanctionApplied || '',
    accountAction: 'none',
  }));
  const [errorMsg, setErrorMsg] = useState('');

  if (!report) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Alert type="error" title="Reporte no encontrado">
          El expediente solicitado no existe.
        </Alert>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/reports')}
        >
          Volver a Reportes
        </Button>
      </div>
    );
  }

  const reportedUser = users.find(
    (u) => Number(u.id) === Number(report.reportedUserId)
  );

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await updateReport(report.id, formData);
      navigate('/reports');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={`Expediente de reporte #${report.id}`}
        subtitle={`Usuario denunciado: ${reportedUser?.name || `#${report.reportedUserId}`} (Estado actual: ${reportedUser?.status || 'active'})`}
        action={
          <Button variant="outline" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
          </Button>
        }
      />

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
            value={formData.reason}
            onChange={handleChange}
          />

          <Input
            id="evidenceUrl"
            name="evidenceUrl"
            label="Enlace de Evidencia"
            value={formData.evidenceUrl}
            onChange={handleChange}
          />

          <Textarea
            id="description"
            name="description"
            label="Descripción del Caso *"
            value={formData.description}
            onChange={handleChange}
          />

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
            <Button type="submit">
              <Save className="w-4 h-4" />
              Guardar Expediente
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
