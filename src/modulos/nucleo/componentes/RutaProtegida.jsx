import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useStoreAuthentication } from '../../autenticacion/estado/storeAuthentication';
import { Button, Card } from '../diseno/ui';

export function RutaProtegida({ children, rolesPermitidos = [] }) {
  const navegar = useNavigate();
  const usuarioActual = useStoreAuthentication((estado) => estado.usuarioActual);
  const ubicacion = useLocation();

  // 1. Si no hay sesión activa, redirigimos a login guardando la ruta de origen
  if (!usuarioActual) {
    return <Navigate to="/iniciar-sesion" state={{ from: ubicacion }} replace />;
  }

  // 2. Verificamos si la ruta exige roles privilegiados
  const requiereRolEspecifico = rolesPermitidos.length > 0;
  const tienePermiso = rolesPermitidos.includes(usuarioActual.rol);

  // 3. Si no tiene el rol requerido, mostramos la tarjeta de advertencia
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
            <strong className="text-[#224F10] uppercase font-bold">{usuarioActual.rol}</strong> y esta vista requiere permisos de{' '}
            <strong className="text-[#224F10] uppercase font-bold">
              {rolesPermitidos.join(' o ')}
            </strong>
            .
          </p>
          {/* 'navegar(-1)' es el equivalente en React Router a presionar la flecha atrás del navegador */}
          <Button onClick={() => navegar(-1)} variant="secondary">
            Volver atrás
          </Button>
        </Card>
      </div>
    );
  }

  // 4. Autorizado: mostramos la página solicitada
  return children;
}

