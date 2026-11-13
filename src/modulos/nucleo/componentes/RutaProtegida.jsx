// ============================================================================
// ARCHIVO: src/modulos/nucleo/componentes/RutaProtegida.jsx
// RESPONSABILIDAD: Guardián de seguridad y control de acceso basado en roles (RBAC).
// ============================================================================
//
// ¿QUÉ HACE ESTE COMPONENTE?
// En React Router, cualquier usuario puede intentar tipear una URL en el navegador
// (como '/panel', '/subastas/nueva' o '/usuarios').
// Este componente actúa como un intermediario o "guardián" (Route Guard):
// 1. Lee 'usuarioActual' desde 'tiendaAutenticacion'.
// 2. Si NO hay usuario conectado:
//    - Redirige a '/iniciar-sesion' usando '<Navigate replace />'.
//    - Guarda la ubicación previa en 'state: { from: ubicacion }' para que tras
//      iniciar sesión, el sistema lo devuelva a la página que intentaba visitar.
// 3. Si hay sesión, pero la ruta exige un rol específico (ej: 'admin'):
//    - Verifica si 'rolesPermitidos.includes(usuarioActual.role)'.
//    - Si no tiene permisos, muestra una pantalla de bloqueo con opción "Volver atrás" ('navegar(-1)').
// 4. Si todo está en orden, renderiza los 'children' normalmente.
// ============================================================================

import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { Button, Card } from '../diseno/ui';

/**
 * Componente Guardián de Rutas
 * 
 * PROPS:
 * - 'children': El componente de la vista que se desea proteger (<VistaPanelControl />, etc.).
 * - 'rolesPermitidos': Array opcional de roles admitidos (ej: ['admin']). Si está vacío, solo exige estar autenticado.
 */
export function RutaProtegida({ children, rolesPermitidos = [] }) {
  const navegar = useNavigate();
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);
  const ubicacion = useLocation();

  // 1. Si no hay sesión activa, redirigimos a login guardando la ruta de origen
  if (!usuarioActual) {
    return <Navigate to="/iniciar-sesion" state={{ from: ubicacion }} replace />;
  }

  // 2. Verificamos si la ruta exige roles privilegiados
  const requiereRolEspecifico = rolesPermitidos.length > 0;
  const tienePermiso = rolesPermitidos.includes(usuarioActual.role);

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
            <strong className="text-[#224F10] uppercase font-bold">{usuarioActual.role}</strong> y esta vista requiere permisos de{' '}
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

