import React, { useState } from 'react';
import { useReportStore } from '../../../reports/states/reportStore';
import { ReportForm } from '../../../reports/components/ReportForm';
import { sameId, findById, matchesSearch } from '../../utils/formatters';
import { DashboardFeedback, DashboardFormPanel, DashboardStatCard } from './DashboardShared';
import { DashboardReportCard } from './DashboardReportCard';
import { Plus, AlertOctagon } from 'lucide-react';

const STATUS_FILTER_TABS = [
  { value: 'todos', label: 'Todos los expedientes' },
  { value: 'en_revision', label: 'En Revisión' },
  { value: 'resuelto_sancion', label: 'Con Sanción RN06' },
  { value: 'desestimado', label: 'Solucionados' },
];

export function DashboardReportsTab({ currentUser, users, auctions, reports, searchQuery, prefill }) {
  const createReport = useReportStore((s) => s.createReport);
  const updateReport = useReportStore((s) => s.updateReport);
  const deleteReport = useReportStore((s) => s.deleteReport);

  const isAdmin = currentUser?.role === 'admin';
  const otherUsers = users.filter((u) => !sameId(u.id, currentUser?.id));

  const [statusFilter, setStatusFilter] = useState('todos');
  const [feedback, setFeedback] = useState(null);
  const [formOpen, setFormOpen] = useState(Boolean(prefill?.openCreate));
  const [editingReportId, setEditingReportId] = useState(null);

  const editingReport = editingReportId ? findById(reports, editingReportId) : null;
  const openCount = reports.filter((r) => r.status === 'en_revision').length;
  const sanctionedCount = reports.filter((r) => r.status === 'resuelto_sancion').length;
  const resolvedCount = reports.filter((r) => r.status === 'desestimado').length;

  const filteredReports = reports.filter((rep) => {
    if (statusFilter !== 'todos' && rep.status !== statusFilter) return false;
    const reported = findById(users, rep.reportedUserId);
    const auction = findById(auctions, rep.auctionId);
    return matchesSearch(
      [rep.reason, rep.description, reported?.name || rep.reportedUserName, auction?.title || rep.auctionTitle],
      searchQuery
    );
  });

  function closeForm() {
    setFormOpen(false);
    setEditingReportId(null);
  }

  function handleSaved(saved) {
    setFeedback({
      type: 'success',
      text: editingReport
        ? `Expediente #${editingReport.id} actualizado.`
        : `Expediente #${saved.id} radicado para mediación RN06.`,
    });
    closeForm();
  }

  async function handleDelete(rep) {
    if (!window.confirm(`¿Confirmas eliminar el expediente de reporte #${rep.id}?`)) return;
    try {
      await deleteReport(rep.id);
      setFeedback({ type: 'success', text: `Expediente #${rep.id} eliminado.` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">Reportes e Infracciones</h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">
            Mediación ante incumplimientos de pago o entrega y control disciplinario (RN06).
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setEditingReportId(null); setFormOpen(true); setFeedback(null); }}
          className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Informar Incumplimiento</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard highlight title="Total Expedientes" icon={<AlertOctagon className="w-3.5 h-3.5" />} value={reports.length} subtitle="Historial disciplinario RN06" />
        <DashboardStatCard title="En Revisión" value={openCount} subtitle="Pendientes de resolución" subtitleClassName="text-[#224F10] font-semibold" />
        <DashboardStatCard title="Con Sanción" value={sanctionedCount} subtitle="Suspensión o cierre aplicado" subtitleClassName="text-red-700 font-semibold" />
        <DashboardStatCard title="Solucionados" value={resolvedCount} subtitle="Acuerdo entre las partes" />
      </div>

      <DashboardFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      {formOpen && (
        <DashboardFormPanel
          title={editingReport ? `Resolver / Editar Expediente #${editingReport.id}` : 'Radicar Denuncia de Incumplimiento'}
          onClose={closeForm}
        >
          <ReportForm
            key={editingReport ? `${editingReport.id}-${editingReport.status}` : `new-${prefill?.auctionId || ''}`}
            report={editingReport}
            auctions={auctions}
            otherUsers={otherUsers}
            isAdmin={isAdmin}
            initialAuctionId={prefill?.auctionId || ''}
            initialReportedUserId={prefill?.reportedUserId || ''}
            onCreateReport={createReport}
            onUpdateReport={updateReport}
            onSaved={handleSaved}
            onCancel={closeForm}
          />
        </DashboardFormPanel>
      )}

      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 flex flex-wrap items-center gap-2 shadow-2xs">
        {STATUS_FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === tab.value ? 'bg-[#224F10] text-[#EAFFD0]' : 'bg-[#F7FBF3] text-[#0D0D0D]/70 hover:bg-[#EAFFD0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredReports.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-10 text-center text-xs text-[#0D0D0D]/60">
          No hay reportes registrados con los criterios actuales.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((rep) => {
            const auction = findById(auctions, rep.auctionId);
            const reporter = findById(users, rep.reporterId);
            const reported = findById(users, rep.reportedUserId);
            const canEdit = isAdmin || (sameId(currentUser?.id, rep.reporterId) && rep.status === 'en_revision');

            return (
              <DashboardReportCard
                key={rep.id}
                report={rep}
                auctionTitle={auction?.title || rep.auctionTitle || `Subasta #${rep.auctionId}`}
                reporterName={reporter?.name || rep.reporterName || 'Usuario'}
                reportedName={reported?.name || rep.reportedUserName || 'Usuario'}
                reportedStatus={reported?.status}
                canEdit={canEdit}
                isAdmin={isAdmin}
                onEdit={() => { setEditingReportId(rep.id); setFormOpen(true); setFeedback(null); }}
                onDelete={() => handleDelete(rep)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
