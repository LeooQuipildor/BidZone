import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../auth/states/authStore';
import { Card, Button } from '../design-system/ui';
import { ShieldAlert } from 'lucide-react';

// Protege rutas privadas: si no hay sesión, manda al login; si exige un rol, lo valida
export function ProtectedRoute({ children, allowedRoles = [] }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const requiresSpecificRole = allowedRoles.length > 0;
  const userHasPermission = allowedRoles.includes(currentUser.role);

  if (requiresSpecificRole && !userHasPermission) {
    return (
      <div className="max-w-lg mx-auto my-16 px-4">
        <Card className="text-center p-8 rounded-3xl">
          <div className="w-14 h-14 rounded-full bg-[#224F10] text-[#EAFFD0] flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-serif-display text-3xl text-[#0D0D0D] mb-2">
            Acceso restringido por rol
          </h2>
          <p className="text-xs text-[#0D0D0D]/75 mb-6">
            Tu cuenta tiene rol{' '}
            <strong className="text-[#224F10] uppercase font-bold">
              {currentUser.role}
            </strong>{' '}
            y esta vista requiere permisos de{' '}
            <strong className="text-[#224F10] uppercase font-bold">
              {allowedRoles.join(' o ')}
            </strong>
            .
          </p>
          <Button onClick={() => window.history.back()} variant="secondary">
            Volver atrás
          </Button>
        </Card>
      </div>
    );
  }

  return children;
}
