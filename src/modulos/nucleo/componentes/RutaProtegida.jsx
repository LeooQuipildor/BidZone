import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { Button, Card } from '../diseno/ui';

// Protege rutas privadas: si no hay sesión, redirige al login; si exige un rol específico, lo valida
export function RutaProtegida({ children, rolesPermitidos = [] }) {
  const navegar = useNavigate();
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);
  const ubicacion = useLocation();

  if (!usuarioActual) {
    return <Navigate to="/iniciar-sesion" state={{ from: ubicacion }} replace />;
  }

  const requiereRolEspecifico = rolesPermitidos.length > 0;
  const tienePermiso = rolesPermitidos.includes(usuarioActual.role);

  if (requiereRolEspecifico && !tienePermiso) {
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
            <strong className="text-[#224F10] uppercase font-bold">{usuarioActual.role}</strong> y esta vista requiere permisos de{' '}
            <strong className="text-[#224F10] uppercase font-bold">
              {rolesPermitidos.join(' o ')}
            </strong>
            .
          </p>
          <Button onClick={() => navegar(-1)} variant="secondary">
            Volver atrás
          </Button>
        </Card>
      </div>
    );
  }

  return children;
}

