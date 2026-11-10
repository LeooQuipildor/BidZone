import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReportStore } from '../../../reports/states/reportStore';
import { formatDateTime } from '../../utils/formatters';
import {
  Plus,
  X,
  AlertOctagon,
  ShieldAlert,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

export function DashboardReportsTab({
  currentUser,
  users,
  auctions,
  reports,
  searchQuery,
  prefill,
}) {
  const createReport = useReportStore((s) => s.createReport);
  const updateReport = useReportStore((s) => s.updateReport);
  const deleteReport = useReportStore((s) => s.deleteReport);

  const isAdmin = currentUser?.role === 'admin';
  const otherUsers = users.filter(
    (u) => Number(u.id) !== Number(currentUser?.id)
  );

  const [statusFilter, setStatusFilter] = useState('todos');
  const [feedback, setFeedback] = useState(null);

  const [formOpen, setFormOpen] = useState(Boolean(prefill?.openCreate));
  const [editingReportId, setEditingReportId] = useState(null);

  const [formData, setFormData] = useState(() => ({
    auctionId: prefill?.auctionId || (auctions[0] ? String(auctions[0].id) : ''),
    reportedUserId:
      prefill?.reportedUserId || (otherUsers[0] ? String(otherUsers[0].id) : ''),
    reason: 'Incumplimiento de pago en plazo acordado',
    description: '',
    evidenceUrl: '',
    status: 'en_revision',
    sanctionApplied: '',
    accountAction: 'none',
  }));

  const openReports = reports.filter((r) => r.status === 'en_revision');
  const sanctionedReports = reports.filter(
    (r) => r.status === 'resuelto_sancion'
  );
  const resolvedReports = reports.filter((r) => r.status === 'desestimado');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredReports = reports.filter((rep) => {
    const matchStatus =
      statusFilter === 'todos' || rep.status === statusFilter;
    if (!matchStatus) return false;
    if (!normalizedQuery) return true;
    const reported = users.find(
      (u) => Number(u.id) === Number(rep.reportedUserId)
    );
    const auction = auctions.find(
      (a) => Number(a.id) === Number(rep.auctionId)
    );
    return (
      rep.reason.toLowerCase().includes(normalizedQuery) ||
      rep.description.toLowerCase().includes(normalizedQuery) ||
      (reported?.name || '').toLowerCase().includes(normalizedQuery) ||
      (auction?.title || '').toLowerCase().includes(normalizedQuery)
    );
  });

  const openCreateForm = () => {
    setEditingReportId(null);
    setFormData({
      auctionId: auctions[0] ? String(auctions[0].id) : '',
      reportedUserId: otherUsers[0] ? String(otherUsers[0].id) : '',
      reason: 'Incumplimiento de pago en plazo acordado',
      description: '',
      evidenceUrl: '',
      status: 'en_revision',
      sanctionApplied: '',
      accountAction: 'none',
    });
    setFormOpen(true);
    setFeedback(null);
  };

  const openEditForm = (rep) => {
    setEditingReportId(rep.id);
    setFormData({
      auctionId: String(rep.auctionId),
      reportedUserId: String(rep.reportedUserId),
      reason: rep.reason || '',
      description: rep.description || '',
      evidenceUrl: rep.evidenceUrl || '',
      status: rep.status || 'en_revision',
      sanctionApplied: rep.sanctionApplied || '',
      accountAction: 'none',
    });
    setFormOpen(true);
    setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    try {
      if (editingReportId) {
        await updateReport(editingReportId, formData);
        setFeedback({
          type: 'success',
          text: `Expediente #${editingReportId} actualizado y medidas aplicadas.`,
        });
      } else {
        const created = await createReport({
          ...formData,
          reporterId: currentUser.id,
        });
        setFeedback({
          type: 'success',
          text: `Expediente #${created.id} radicado para mediación RN06.`,
        });
      }
      setFormOpen(false);
      setEditingReportId(null);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (rep) => {
    const confirmed = window.confirm(
      `¿Confirmas eliminar el expediente de reporte #${rep.id}?`
    );
    if (!confirmed) return;
    await deleteReport(rep.id);
    setFeedback({
      type: 'success',
      text: `Expediente #${rep.id} eliminado.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
            Reportes e Infracciones
          </h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">
            Mediación ante incumplimientos de pago o entrega y control
            disciplinario de cuentas (RN06).
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Informar Incumplimiento</span>
        </button>
      </div>

      {/* 4 Donezo KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#224F10] to-[#122B08] text-[#EAFFD0] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#EAFFD0]/90">
              Total Expedientes
            </span>
            <span className="w-7 h-7 rounded-full bg-[#EAFFD0]/15 text-[#B0E454] flex items-center justify-center">
              <AlertOctagon className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-4xl font-bold tracking-tight my-2">
            {reports.length}
          </p>
          <span className="text-[11px] text-[#EAFFD0]/75">
            Historial disciplinario RN06
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-xs font-semibold text-[#0D0D0D]/75">
            En Revisión
          </span>
          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-2">
            {openReports.length}
          </p>
          <span className="text-[11px] text-[#224F10] font-semibold">
            Pendientes de resolución
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-xs font-semibold text-[#0D0D0D]/75">
            Con Sanción
          </span>
          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-2">
            {sanctionedReports.length}
          </p>
          <span className="text-[11px] text-red-700 font-semibold">
            Suspensión o cierre aplicado
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-xs font-semibold text-[#0D0D0D]/75">
            Solucionados
          </span>
          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-2">
            {resolvedReports.length}
          </p>
          <span className="text-[11px] text-[#0D0D0D]/55">
            Acuerdo entre las partes
          </span>
        </div>
      </div>

      {/* Inline Feedback */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs font-medium border ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-[#EAFFD0] border-[#224F10]/20 text-[#224F10]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Inline Create / Resolve Report Panel */}
      {formOpen && (
        <div className="rounded-2xl bg-white border border-[#224F10]/20 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-[#224F10]/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0D0D0D]">
                {editingReportId
                  ? `Resolver / Editar Expediente #${editingReportId}`
                  : 'Radicar Denuncia de Incumplimiento'}
              </h2>
              <p className="text-[11px] text-[#0D0D0D]/60">
                Documenta el incumplimiento tras la liberación de contacto para
                mediación o sanción RN06.
              </p>
            </div>
            <button
              onClick={() => {
                setFormOpen(false);
                setEditingReportId(null);
              }}
              className="w-8 h-8 rounded-full bg-[#F7FBF3] hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingReportId && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                    Subasta Involucrada *
                  </label>
                  <select
                    value={formData.auctionId}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, auctionId: e.target.value }))
                    }
                    className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                  >
                    {auctions.map((a) => (
                      <option key={a.id} value={String(a.id)}>
                        #{a.id} — {a.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                    Usuario Denunciado *
                  </label>
                  <select
                    value={formData.reportedUserId}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        reportedUserId: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                  >
                    {otherUsers.map((u) => (
                      <option key={u.id} value={String(u.id)}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Motivo Principal *
                </label>
                {editingReportId ? (
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, reason: e.target.value }))
                    }
                    className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                  />
                ) : (
                  <select
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, reason: e.target.value }))
                    }
                    className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                  >
                    <option value="Incumplimiento de pago en plazo acordado">
                      El ganador no realizó el pago acordado
                    </option>
                    <option value="No entrega del artículo tras el pago">
                      El vendedor no entregó el artículo
                    </option>
                    <option value="Artículo distinto a la descripción publicada">
                      Artículo distinto a lo publicado
                    </option>
                    <option value="Falta de respuesta para coordinar entrega">
                      Falta de respuesta en trato directo
                    </option>
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Enlace de Evidencia (Opcional)
                </label>
                <input
                  type="url"
                  value={formData.evidenceUrl}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, evidenceUrl: e.target.value }))
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                Descripción Detallada *
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Explica los hechos y plazos incumplidos..."
                className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] focus:outline-none"
              />
            </div>

            {editingReportId && isAdmin && (
              <div className="pt-3 border-t border-[#224F10]/10 space-y-3 bg-[#F7FBF3] p-4 rounded-xl">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#224F10] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Resolución Administrativa RN06
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, status: e.target.value }))
                    }
                    className="rounded-xl bg-white border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                  >
                    <option value="en_revision">En revisión</option>
                    <option value="resuelto_sancion">
                      Resuelto con Sanción
                    </option>
                    <option value="desestimado">Solucionado / Desestimado</option>
                  </select>

                  <select
                    value={formData.accountAction}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        accountAction: e.target.value,
                      }))
                    }
                    className="rounded-xl bg-white border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                  >
                    <option value="none">Mantener estado cuenta</option>
                    <option value="suspend">Suspender Cuenta</option>
                    <option value="close">Cerrar Definitivamente</option>
                    <option value="activate">Rehabilitar Cuenta</option>
                  </select>

                  <input
                    type="text"
                    value={formData.sanctionApplied}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        sanctionApplied: e.target.value,
                      }))
                    }
                    placeholder="Dictamen aplicado..."
                    className="rounded-xl bg-white border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded-full border border-[#224F10]/15 text-xs font-semibold text-[#0D0D0D]/75 hover:bg-[#F7FBF3] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] text-xs font-semibold cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {editingReportId ? 'Guardar Resolución' : 'Radicar Reporte'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pill Filters */}
      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 flex flex-wrap items-center gap-2 shadow-2xs">
        {[
          { value: 'todos', label: 'Todos los expedientes' },
          { value: 'en_revision', label: 'En Revisión' },
          { value: 'resuelto_sancion', label: 'Con Sanción RN06' },
          { value: 'desestimado', label: 'Solucionados' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === tab.value
                ? 'bg-[#224F10] text-[#EAFFD0]'
                : 'bg-[#F7FBF3] text-[#0D0D0D]/70 hover:bg-[#EAFFD0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-10 text-center text-xs text-[#0D0D0D]/60">
          No hay reportes registrados con los criterios actuales.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((rep) => {
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
              <div
                key={rep.id}
                className="rounded-2xl bg-white border border-[#224F10]/10 p-5 space-y-4 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#224F10]/8 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        rep.status === 'resuelto_sancion'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : rep.status === 'en_revision'
                            ? 'bg-[#B0E454]/40 text-[#0D0D0D] border-[#224F10]/15'
                            : 'bg-[#EAFFD0] text-[#224F10] border-[#224F10]/15'
                      }`}
                    >
                      <AlertOctagon className="w-3 h-3" />
                      {rep.status === 'resuelto_sancion'
                        ? 'Sancionado'
                        : rep.status === 'en_revision'
                          ? 'En Revisión'
                          : 'Solucionado'}
                    </span>
                    <span className="text-[11px] text-[#0D0D0D]/55">
                      Expediente #{rep.id} · {formatDateTime(rep.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {canEdit && (
                      <button
                        onClick={() => openEditForm(rep)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        {isAdmin ? 'Resolver / Sancionar' : 'Editar'}
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(rep)}
                        className="w-7 h-7 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#0D0D0D]">
                    {rep.reason}
                  </h3>
                  <p className="text-xs text-[#0D0D0D]/75 leading-relaxed">
                    {rep.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F7FBF3] p-3.5 rounded-xl border border-[#224F10]/10 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/50 block">
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
                    <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/50 block">
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
                    <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/50 block">
                      Medida / Sanción
                    </span>
                    <strong className="text-[#224F10] inline-flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{rep.sanctionApplied}</span>
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

