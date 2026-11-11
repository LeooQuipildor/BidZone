import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReportStore } from '../../../reports/states/reportStore';
import {
  formatDateTime,
  sameId,
  findById,
  pickValidId,
  matchesSearch,
} from '../../utils/formatters';
import { DashboardFeedback, DashboardStatCard } from './DashboardShared';
import {
  Plus,
  X,
  AlertOctagon,
  ShieldAlert,
  Edit3,
  Trash2,
  Save,
} from 'lucide-react';

const STATUS_FILTER_TABS = [
  { value: 'todos', label: 'Todos los expedientes' },
  { value: 'en_revision', label: 'En Revisión' },
  { value: 'resuelto_sancion', label: 'Con Sanción RN06' },
  { value: 'desestimado', label: 'Solucionados' },
];

// Devuelve el texto y los colores de la insignia según el estado del reporte
function getReportBadgeInfo(status) {
  if (status === 'resuelto_sancion') {
    return {
      label: 'Sancionado',
      className: 'bg-red-50 text-red-700 border-red-200',
    };
  }
  if (status === 'en_revision') {
    return {
      label: 'En Revisión',
      className: 'bg-[#B0E454]/40 text-[#0D0D0D] border-[#224F10]/15',
    };
  }
  return {
    label: 'Solucionado',
    className: 'bg-[#EAFFD0] text-[#224F10] border-[#224F10]/15',
  };
}

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
  const otherUsers = users.filter((u) => !sameId(u.id, currentUser?.id));

  const [statusFilter, setStatusFilter] = useState('todos');
  const [feedback, setFeedback] = useState(null);

  const [formOpen, setFormOpen] = useState(Boolean(prefill?.openCreate));
  const [editingReportId, setEditingReportId] = useState(null);

  const [formData, setFormData] = useState(() => ({
    auctionId: prefill?.auctionId || (auctions[0] ? String(auctions[0].id) : ''),
    reportedUserId:
      prefill?.reportedUserId ||
      (otherUsers[0] ? String(otherUsers[0].id) : ''),
    reason: 'Incumplimiento de pago en plazo acordado',
    description: '',
    evidenceUrl: '',
    status: 'en_revision',
    sanctionApplied: '',
    accountAction: 'none',
  }));

  // Garantizamos un ID válido para los selectores cuando estamos creando un reporte nuevo
  const effectiveAuctionId = editingReportId
    ? formData.auctionId
    : pickValidId(auctions, formData.auctionId, prefill?.auctionId);

  const effectiveReportedUserId = editingReportId
    ? formData.reportedUserId
    : pickValidId(otherUsers, formData.reportedUserId, prefill?.reportedUserId);

  // Contadores de resumen
  const openReports = reports.filter((r) => r.status === 'en_revision');
  const sanctionedReports = reports.filter(
    (r) => r.status === 'resuelto_sancion'
  );
  const resolvedReports = reports.filter((r) => r.status === 'desestimado');

  // Filtrado por estado y texto buscado
  const filteredReports = reports.filter((rep) => {
    if (statusFilter !== 'todos' && rep.status !== statusFilter) {
      return false;
    }
    const reported = findById(users, rep.reportedUserId);
    const auction = findById(auctions, rep.auctionId);
    return matchesSearch(
      [
        rep.reason,
        rep.description,
        reported?.name || rep.reportedUserName,
        auction?.title || rep.auctionTitle,
      ],
      searchQuery
    );
  });

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function openCreateForm() {
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
  }

  function openEditForm(rep) {
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
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);

    if (!formData.reason.trim() || !formData.description.trim()) {
      setFeedback({
        type: 'error',
        text: 'El motivo y la descripción detallada del caso son obligatorios.',
      });
      return;
    }

    try {
      if (editingReportId) {
        const payload = isAdmin
          ? formData
          : {
              reason: formData.reason.trim(),
              description: formData.description.trim(),
              evidenceUrl: formData.evidenceUrl.trim(),
            };
        await updateReport(editingReportId, payload);
        setFeedback({
          type: 'success',
          text: `Expediente #${editingReportId} actualizado.`,
        });
      } else {
        if (!effectiveAuctionId || !effectiveReportedUserId) {
          setFeedback({
            type: 'error',
            text: 'Debes seleccionar una subasta y el usuario denunciado.',
          });
          return;
        }
        const created = await createReport({
          auctionId: effectiveAuctionId,
          reportedUserId: effectiveReportedUserId,
          reason: formData.reason.trim(),
          description: formData.description.trim(),
          evidenceUrl: formData.evidenceUrl.trim(),
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
  }

  async function handleDelete(rep) {
    const confirmed = window.confirm(
      `¿Confirmas eliminar el expediente de reporte #${rep.id}?`
    );
    if (!confirmed) return;

    try {
      await deleteReport(rep.id);
      setFeedback({
        type: 'success',
        text: `Expediente #${rep.id} eliminado.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
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
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Informar Incumplimiento</span>
        </button>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard
          highlight
          title="Total Expedientes"
          icon={<AlertOctagon className="w-3.5 h-3.5" />}
          value={reports.length}
          subtitle="Historial disciplinario RN06"
        />
        <DashboardStatCard
          title="En Revisión"
          value={openReports.length}
          subtitle="Pendientes de resolución"
          subtitleClassName="text-[#224F10] font-semibold"
        />
        <DashboardStatCard
          title="Con Sanción"
          value={sanctionedReports.length}
          subtitle="Suspensión o cierre aplicado"
          subtitleClassName="text-red-700 font-semibold"
        />
        <DashboardStatCard
          title="Solucionados"
          value={resolvedReports.length}
          subtitle="Acuerdo entre las partes"
        />
      </div>

      <DashboardFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      {/* Formulario integrado para crear o resolver reporte */}
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
              type="button"
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
                    value={effectiveAuctionId}
                    onChange={(e) => updateField('auctionId', e.target.value)}
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
                    value={effectiveReportedUserId}
                    onChange={(e) =>
                      updateField('reportedUserId', e.target.value)
                    }
                    className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                  >
                    {otherUsers.length > 0 ? (
                      otherUsers.map((u) => {
                        const detalle = u.email
                          ? u.email
                          : u.city || 'Socio BidZone';
                        return (
                          <option key={u.id} value={String(u.id)}>
                            {u.name} ({detalle})
                          </option>
                        );
                      })
                    ) : (
                      <option value="">Sin usuarios disponibles</option>
                    )}
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
                    onChange={(e) => updateField('reason', e.target.value)}
                    className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                  />
                ) : (
                  <select
                    value={formData.reason}
                    onChange={(e) => updateField('reason', e.target.value)}
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
                  onChange={(e) => updateField('evidenceUrl', e.target.value)}
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
                onChange={(e) => updateField('description', e.target.value)}
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
                    onChange={(e) => updateField('status', e.target.value)}
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
                      updateField('accountAction', e.target.value)
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
                      updateField('sanctionApplied', e.target.value)
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

      {/* Filtros por estado */}
      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 flex flex-wrap items-center gap-2 shadow-2xs">
        {STATUS_FILTER_TABS.map((tab) => {
          const isSelected = statusFilter === tab.value;
          const tabStyle = isSelected
            ? 'bg-[#224F10] text-[#EAFFD0]'
            : 'bg-[#F7FBF3] text-[#0D0D0D]/70 hover:bg-[#EAFFD0]';

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${tabStyle}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Lista de expedientes */}
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
            const canEdit =
              isAdmin ||
              (sameId(currentUser?.id, rep.reporterId) &&
                rep.status === 'en_revision');
            const badge = getReportBadgeInfo(rep.status);

            return (
              <div
                key={rep.id}
                className="rounded-2xl bg-white border border-[#224F10]/10 p-5 space-y-4 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#224F10]/8 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.className}`}
                    >
                      <AlertOctagon className="w-3 h-3" />
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-[#0D0D0D]/55">
                      Expediente #{rep.id} · {formatDateTime(rep.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => openEditForm(rep)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        {isAdmin ? 'Resolver / Sancionar' : 'Editar'}
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
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
                      {auction?.title ||
                        rep.auctionTitle ||
                        `Subasta #${rep.auctionId}`}
                    </Link>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/50 block">
                      Denunciante → Denunciado
                    </span>
                    <strong className="text-[#0D0D0D]">
                      {reporter?.name || rep.reporterName || 'Usuario'} →{' '}
                      <span className="text-red-700">
                        {reported?.name || rep.reportedUserName || 'Usuario'}
                        {reported?.status ? ` (${reported.status})` : ''}
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
