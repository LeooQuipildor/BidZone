import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReportStore } from '../states/reportStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import {
  Card,
  Button,
  Badge,
  Select,
  PageHeader,
  Alert,
} from '../../core/design-system/ui';
import { formatDateTime } from '../../core/utils/formatters';
import {
  AlertOctagon,
  PlusCircle,
  Edit3,
  Trash2,
  ShieldAlert,
} from 'lucide-react';

export function ReportsListView() {
  const navigate = useNavigate();
  const reports = useReportStore((s) => s.reports);
  const fetchReports = useReportStore((s) => s.fetchReports);
  const deleteReport = useReportStore((s) => s.deleteReport);
  const auctions = useAuctionStore((s) => s.auctions);
  const users = useAuthStore((s) => s.users);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [statusFilter, setStatusFilter] = useState('todos');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const isAdmin = currentUser?.role === 'admin';

  const filtered = reports.filter((r) => {
    if (statusFilter !== 'todos' && r.status !== statusFilter) return false;
    return true;
  });

  const handleDelete = async (report) => {
    const confirmed = window.confirm(
      `¿Confirmas eliminar el expediente de reporte #${report.id}?`
    );
    if (!confirmed) return;
    await deleteReport(report.id);
    setFeedback(`Expediente #${report.id} eliminado.`);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Centro de reportes e infracciones"
        subtitle="Si el ganador o el dueño del artículo no cumple con el pago o entrega acordada, se informa aquí para aplicar infracción o cierre de cuenta (RN06)."
        action={
          <Button onClick={() => navigate('/reports/new')}>
            <PlusCircle className="w-4 h-4" />
            Informar Incumplimiento
          </Button>
        }
      />

      {feedback && (
        <Alert type="success" onClose={() => setFeedback('')}>
          {feedback}
        </Alert>
      )}

      <Card className="p-5">
        <div className="max-w-xs">
          <Select
            id="report-status"
            label="Estado del Expediente"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'todos', label: 'Todos los reportes' },
              { value: 'en_revision', label: 'En revisión / Mediación' },
              {
                value: 'resuelto_sancion',
                label: 'Resuelto con Sanción / Cierre de Cuenta',
              },
              { value: 'desestimado', label: 'Desestimado / Solucionado' },
            ]}
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="text-center py-12 text-sm text-[#0D0D0D]/60">
          No hay reportes registrados con ese estado.
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((rep) => {
            const auction = auctions.find(
              (a) => Number(a.id) === Number(rep.auctionId)
            );
            const reporter = users.find(
              (u) => Number(u.id) === Number(rep.reporterId)
            );
            const reported = users.find(
              (u) => Number(u.id) === Number(rep.reportedUserId)
            );
            const canEdit =
              isAdmin || Number(currentUser?.id) === Number(rep.reporterId);

            return (
              <Card key={rep.id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#224F10]/15 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        rep.status === 'resuelto_sancion'
                          ? 'danger'
                          : rep.status === 'en_revision'
                            ? 'lime'
                            : 'success'
                      }
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                      {rep.status === 'resuelto_sancion'
                        ? 'Sancionado / Cuenta Infraccionada'
                        : rep.status === 'en_revision'
                          ? 'En Revisión'
                          : 'Solucionado'}
                    </Badge>
                    <span className="text-xs text-[#0D0D0D]/55">
                      Expediente #{rep.id} · {formatDateTime(rep.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <Link to={`/reports/${rep.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          <Edit3 className="w-3.5 h-3.5" />
                          {isAdmin ? 'Resolver / Sancionar' : 'Editar Reporte'}
                        </Button>
                      </Link>
                    )}
                    {isAdmin && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(rep)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif-display text-2xl font-semibold text-[#0D0D0D]">
                    Motivo: {rep.reason}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#0D0D0D]/80 leading-relaxed">
                    {rep.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/80 p-4 rounded-2xl border border-[#224F10]/15 text-xs">
                  <div>
                    <span className="text-[11px] text-[#0D0D0D]/55 block">
                      Subasta Involucrada
                    </span>
                    <Link
                      to={`/auctions/${rep.auctionId}`}
                      className="font-semibold text-[#224F10] hover:underline"
                    >
                      {auction?.title || `Subasta #${rep.auctionId}`}
                    </Link>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#0D0D0D]/55 block">
                      Denunciante → Denunciado
                    </span>
                    <strong className="text-[#0D0D0D]">
                      {reporter?.name || 'Usuario'} →{' '}
                      <span className="text-red-700">
                        {reported?.name || 'Usuario'} ({reported?.status})
                      </span>
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#0D0D0D]/55 block">
                      Medida / Sanción Aplicada
                    </span>
                    <strong className="text-[#224F10] flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {rep.sanctionApplied}
                    </strong>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
