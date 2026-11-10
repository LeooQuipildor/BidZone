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
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Centro de notificaciones"
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
        <Card className="text-center py-12 text-sm text-[#0D0D0D]/60">
          No tienes notificaciones pendientes.
        </Card>
      ) : (
        <div className="space-y-3.5">
          {myNotifications.map((item) => (
            <Card
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !item.read
                  ? 'border-[#224F10]/40 bg-white'
                  : 'opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#224F10] text-[#EAFFD0] flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0D0D0D]">
                      {item.title}
                    </h3>
                    {!item.read && <Badge variant="lime">Nueva</Badge>}
                  </div>
                  <p className="text-xs text-[#0D0D0D]/75">{item.message}</p>
                  <span className="text-[10px] text-[#0D0D0D]/50 block">
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
