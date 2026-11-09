import React, { useEffect } from 'react';
import { useNotificationStore } from '../states/notificationStore';
import { useAuthStore } from '../../auth/states/authStore';
import { Card, Button, Badge, PageHeader } from '../../core/design-system/ui';
import { formatDateTime } from '../../core/utils/formatters';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

export function NotificationsView() {
  const notifications = useNotificationStore((s) => s.notifications);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const deleteNotification = useNotificationStore((s) => s.deleteNotification);
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const isAdmin = currentUser?.role === 'admin';
  const myNotifications = isAdmin
    ? notifications
    : notifications.filter(
        (n) => Number(n.userId) === Number(currentUser?.id)
      );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Centro de Notificaciones"
        subtitle="Alertas automáticas de ofertas superadas, subastas adjudicadas con liberación de contacto y expedientes de mediación."
        action={
          currentUser && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => markAllAsRead(currentUser.id)}
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como leídas
            </Button>
          )
        }
      />

      {myNotifications.length === 0 ? (
        <Card className="text-center py-12 text-sm text-[#EAFFD0]/60">
          No tienes notificaciones pendientes.
        </Card>
      ) : (
        <div className="space-y-3">
          {myNotifications.map((item) => (
            <Card
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !item.read
                  ? 'border-[#B0E454]/60 bg-[#224F10]/20'
                  : 'opacity-80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#224F10] text-[#B0E454] flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#EAFFD0]">
                      {item.title}
                    </h3>
                    {!item.read && <Badge variant="lime">NUEVA</Badge>}
                  </div>
                  <p className="text-xs text-[#EAFFD0]/80">{item.message}</p>
                  <span className="text-[10px] text-[#EAFFD0]/50 block">
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                {!item.read && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead(item.id)}
                  >
                    Marcar leída
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteNotification(item.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

