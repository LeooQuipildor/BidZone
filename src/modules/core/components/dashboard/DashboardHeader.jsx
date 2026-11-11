import React from 'react';
import { getInitials } from './dashboardHelpers';
import { Bell, Mail, Search } from 'lucide-react';

const SEARCH_PLACEHOLDERS = {
  overview: 'Buscar subasta, usuario o lote...',
  auctions: 'Buscar subasta por título o categoría...',
  bids: 'Buscar puja por lote, postor o nota...',
  reports: 'Buscar expediente, motivo o usuario...',
  reviews: 'Buscar reseña, autor o calificado...',
  users: 'Buscar usuario por nombre, correo o ciudad...',
  notifications: 'Buscar alertas y mensajes...',
  profile: 'Buscar en tu panel...',
};

// Barra superior del Dashboard con buscador de la pestaña actual y accesos rápidos
export function DashboardHeader({
  activeSection,
  searchQuery,
  onSearchChange,
  unreadCount,
  currentUser,
  onSelectSection,
}) {
  function buttonStyle(isActive) {
    return isActive
      ? 'bg-[#224F10] border-[#224F10] text-[#EAFFD0]'
      : 'bg-white border-[#224F10]/12 hover:border-[#224F10]/30 text-[#0D0D0D]/75';
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2.5 bg-white border border-[#224F10]/12 rounded-2xl px-3.5 py-2 w-full sm:max-w-xs shadow-2xs">
        <Search className="w-4 h-4 text-[#0D0D0D]/45 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={SEARCH_PLACEHOLDERS[activeSection] || SEARCH_PLACEHOLDERS.overview}
          className="w-full bg-transparent text-xs text-[#0D0D0D] placeholder-[#0D0D0D]/40 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectSection('reports')}
            title="Reportes e Infracciones"
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${buttonStyle(activeSection === 'reports')}`}
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onSelectSection('notifications')}
            title="Notificaciones"
            className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${buttonStyle(activeSection === 'notifications')}`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#B0E454] ring-2 ring-white" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelectSection('profile')}
          className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-white transition-colors cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-[#224F10] text-[#B0E454] font-bold text-xs flex items-center justify-center ring-2 ring-[#B0E454]/50 shrink-0">
            {getInitials(currentUser?.name)}
          </div>
          <div className="text-left leading-tight">
            <p className="text-xs font-bold text-[#0D0D0D]">{currentUser?.name}</p>
            <p className="text-[11px] text-[#0D0D0D]/55 truncate max-w-[160px]">{currentUser?.email}</p>
          </div>
        </button>
      </div>
    </div>
  );
}

