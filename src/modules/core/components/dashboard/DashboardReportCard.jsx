import React from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/formatters';
import { AlertOctagon, Edit3, ShieldAlert, Trash2 } from 'lucide-react';

function getReportBadgeInfo(status) {
  if (status === 'resuelto_sancion') return { label: 'Sancionado', className: 'bg-red-50 text-red-700 border-red-200' };
  if (status === 'en_revision') return { label: 'En Revisión', className: 'bg-[#B0E454]/40 text-[#0D0D0D] border-[#224F10]/15' };
  return { label: 'Solucionado', className: 'bg-[#EAFFD0] text-[#224F10] border-[#224F10]/15' };
}

// Tarjeta de un expediente de reporte e infracción (RN06)
export function DashboardReportCard({
  report,
  auctionTitle,
  reporterName,
  reportedName,
  reportedStatus,
  canEdit,
  isAdmin,
  onEdit,
  onDelete,
}) {
  const badge = getReportBadgeInfo(report.status);

  return (
    <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 space-y-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#224F10]/8 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.className}`}>
            <AlertOctagon className="w-3 h-3" />
            {badge.label}
          </span>
          <span className="text-[11px] text-[#0D0D0D]/55">
            Expediente #{report.id} · {formatDateTime(report.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              {isAdmin ? 'Resolver / Sancionar' : 'Editar'}
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={onDelete}
              className="w-7 h-7 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-[#0D0D0D]">{report.reason}</h3>
        <p className="text-xs text-[#0D0D0D]/75 leading-relaxed">{report.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F7FBF3] p-3.5 rounded-xl border border-[#224F10]/10 text-xs">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/50 block">Subasta Involucrada</span>
          <Link to={`/auctions/${report.auctionId}`} className="font-semibold text-[#224F10] hover:underline">
            {auctionTitle}
          </Link>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/50 block">Denunciante → Denunciado</span>
          <strong className="text-[#0D0D0D]">
            {reporterName} →{' '}
            <span className="text-red-700">
              {reportedName}
              {reportedStatus ? ` (${reportedStatus})` : ''}
            </span>
          </strong>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/50 block">Medida / Sanción</span>
          <strong className="text-[#224F10] inline-flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{report.sanctionApplied}</span>
          </strong>
        </div>
      </div>
    </div>
  );
}

