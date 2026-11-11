import React from 'react';
import { getInitials } from './dashboardHelpers';
import { Edit3, MapPin, Phone, Shield, Star, Trash2 } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-[#EAFFD0] text-[#224F10]',
  'bg-[#B0E454] text-[#0D0D0D]',
  'bg-[#224F10] text-[#EAFFD0]',
  'bg-[#0D0D0D] text-[#B0E454]',
];

function getAccountStatusInfo(status) {
  if (status === 'active') return { label: 'Activa', className: 'bg-[#F7FBF3] text-[#224F10] border-[#224F10]/15' };
  if (status === 'suspended') return { label: 'Suspendida', className: 'bg-red-50 text-red-700 border-red-200' };
  return { label: 'Cerrada', className: 'bg-red-50 text-red-700 border-red-200' };
}

// Tarjeta de un usuario en el directorio del Dashboard
export function DashboardUserCard({
  user,
  colorIndex,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}) {
  const statusInfo = getAccountStatusInfo(user.status);
  const phoneDisplay = user.phone || (user.contactLocked ? 'Privado (RN05)' : 'Sin teléfono');
  const avatarClass = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];

  return (
    <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between gap-4 shadow-2xs">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${avatarClass}`}>
              {getInitials(user.name)}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#0D0D0D] truncate">{user.name}</h3>
              <p className="text-[11px] text-[#0D0D0D]/55 truncate">{user.email || 'Privado hasta el cierre (RN05)'}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                user.role === 'admin' ? 'bg-[#B0E454] text-[#0D0D0D]' : 'bg-[#EAFFD0] text-[#224F10]'
              }`}
            >
              <Shield className="w-2.5 h-2.5" />
              {user.role.toUpperCase()}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        <div className="bg-[#F7FBF3] rounded-xl border border-[#224F10]/10 p-3.5 space-y-1.5 text-xs text-[#0D0D0D]/75">
          <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#224F10] shrink-0" /><span className="truncate">{phoneDisplay}</span></p>
          <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#224F10] shrink-0" /><span className="truncate">{user.city || 'Sin ciudad'}</span></p>
          <p className="flex items-center gap-2 font-semibold text-[#0D0D0D]"><Star className="w-3.5 h-3.5 text-[#224F10] fill-[#B0E454] shrink-0" /><span>Reputación: {user.reputation || '5.0'} / 5.0</span></p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#224F10]/8">
        {canEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            Editar
          </button>
        )}
        {canDelete && (
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
  );
}

