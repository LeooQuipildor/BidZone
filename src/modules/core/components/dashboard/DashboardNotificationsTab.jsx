import React from 'react';
import { useNotificationStore } from '../../../notifications/states/notificationStore';
import { formatDateTime } from '../../utils/formatters';
import { Bell, CheckCheck, Trash2, Check } from 'lucide-react';

export function DashboardNotificationsTab({
  currentUser,
  notifications,
  searchQuery,
}) {
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const deleteNotification = useNotificationStore((s) => s.deleteNotification);

  const isAdmin = currentUser?.role === 'admin';
  const baseNotifications = isAdmin
    ? notifications
    : notifications.filter(
        (n) => Number(n.userId) === Number(currentUser?.id)
      );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filtered = baseNotifications.filter(
    (n) =>
      !normalizedQuery ||
      n.title.toLowerCase().includes(normalizedQuery) ||
      n.message.toLowerCase().includes(normalizedQuery)
  );

  const unreadCount = baseNotifications.filter((n) => !n.read).length;
  const readCount = baseNotifications.filter((n) => n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
            Notificaciones
          </h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">
            Alertas en tiempo real sobre pujas superadas, cierres RN05 y
            expedientes de mediación.
          </p>
        </div>

        {currentUser && unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead(currentUser.id)}
            className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start md:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Marcar todas como leídas</span>
          </button>
        )}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#224F10] to-[#122B08] text-[#EAFFD0] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#EAFFD0]/90">
              Total Alertas
            </span>
            <span className="w-7 h-7 rounded-full bg-[#EAFFD0]/15 text-[#B0E454] flex items-center justify-center">
              <Bell className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-4xl font-bold tracking-tight my-2">
            {baseNotifications.length}
          </p>
          <span className="text-[11px] text-[#EAFFD0]/75">
            Bandeja del sistema
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-xs font-semibold text-[#0D0D0D]/75">
            Pendientes sin leer
          </span>
          <p className="text-4xl font-bold tracking-tight text-[#224F10] my-2">
            {unreadCount}
          </p>
          <span className="text-[11px] text-[#0D0D0D]/55">
            Requieren atención
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-xs font-semibold text-[#0D0D0D]/75">
            Leídas
          </span>
          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-2">
            {readCount}
          </p>
          <span className="text-[11px] text-[#0D0D0D]/55">
            Historial archivado
          </span>
        </div>
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-10 text-center text-xs text-[#0D0D0D]/60">
          No tienes notificaciones para mostrar.
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 divide-y divide-[#224F10]/8 shadow-2xs overflow-hidden">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                !item.read ? 'bg-[#F7FBF3]/80' : 'bg-white'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    !item.read
                      ? 'bg-[#224F10] text-[#B0E454]'
                      : 'bg-[#F1F8E9] text-[#224F10]/60'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </span>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0D0D0D]">
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="px-2 py-0.5 rounded-full bg-[#B0E454] text-[#0D0D0D] text-[10px] font-bold">
                        Nueva
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#0D0D0D]/75">{item.message}</p>
                  <span className="text-[11px] text-[#0D0D0D]/45 block">
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                {!item.read && (
                  <button
                    onClick={() => markAsRead(item.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#224F10] text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Marcar leída
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(item.id)}
                  title="Eliminar notificación"
                  className="w-8 h-8 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

