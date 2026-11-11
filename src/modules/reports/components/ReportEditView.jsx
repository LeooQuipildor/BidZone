import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReportStore } from '../states/reportStore';
import { useAuthStore } from '../../auth/states/authStore';
import { findById, sameId } from '../../core/utils/formatters';
import { ReportForm } from './ReportForm';
import {
  Button,
  Card,
  ErrorStateCard,
  PageHeader,
  Spinner,
} from '../../core/design-system/ui';
import { ArrowLeft } from 'lucide-react';

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

  if (reportsLoading && !report) return <Spinner label="Cargando expediente..." />;

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
  const reportedName = reportedUser?.name || report.reportedUserName || `#${report.reportedUserId}`;
  const reportedStatus = reportedUser?.status ? `Estado actual: ${reportedUser.status}` : 'En evaluación';

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

      <Card className="p-6 sm:p-8 rounded-3xl">
        <ReportForm
          key={`${report.id}-${report.updatedAt || report.status}`}
          report={report}
          isAdmin={isAdmin}
          onUpdateReport={updateReport}
          onSaved={() => navigate('/reports')}
          onCancel={() => navigate('/reports')}
        />
      </Card>
    </div>
  );
}
