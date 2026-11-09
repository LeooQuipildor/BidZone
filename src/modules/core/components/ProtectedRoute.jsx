import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../auth/states/authStore';
import { Card, Button } from '../design-system/ui';
import { ShieldAlert } from 'lucide-react';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(currentUser.role)
  ) {
    return (
      <div className="max-w-lg mx-auto my-16 px-4">
        <Card className="text-center p-8 border-red-500/40">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#EAFFD0] mb-2">
            Acceso Restringido por Rol
          </h2>
          <p className="text-sm text-[#EAFFD0]/70 mb-6">
            Tu cuenta tiene rol <strong className="text-[#B0E454] uppercase">{currentUser.role}</strong> y esta vista requiere permisos de{' '}
            <strong className="text-[#B0E454] uppercase">{allowedRoles.join(' o ')}</strong>.
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

