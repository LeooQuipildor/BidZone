import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../states/authStore';
import { findById, sameId } from '../../core/utils/formatters';
import { UserForm } from './UserForm';
import {
  Button,
  Card,
  ErrorStateCard,
  PageHeader,
  Spinner,
} from '../../core/design-system/ui';
import { ArrowLeft } from 'lucide-react';

export function UserEditView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const users = useAuthStore((s) => s.users);
  const usersLoading = useAuthStore((s) => s.loading);
  const fetchUsers = useAuthStore((s) => s.fetchUsers);
  const currentUser = useAuthStore((s) => s.currentUser);
  const updateUser = useAuthStore((s) => s.updateUser);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const targetUser = findById(users, id);
  const isAdmin = currentUser?.role === 'admin';

  if (usersLoading && !targetUser) return <Spinner label="Cargando perfil de usuario..." />;

  if (!targetUser) {
    return (
      <ErrorStateCard
        title="Usuario no encontrado"
        message="El registro solicitado no existe."
        buttonLabel="Volver a Usuarios"
        onBack={() => navigate('/users')}
      />
    );
  }

  const isOwnProfile = sameId(currentUser?.id, targetUser.id);
  if (!isAdmin && !isOwnProfile) {
    return (
      <ErrorStateCard
        title="Sin permisos de edición"
        message="Solo puedes editar tu propio perfil o contar con permisos de administrador."
        buttonLabel="Volver a Usuarios"
        onBack={() => navigate('/users')}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={`Editar Usuario: ${targetUser.name}`}
        subtitle="Modificación de datos de contacto, rol de acceso y estado disciplinario de la cuenta."
        action={
          <Button variant="outline" onClick={() => navigate('/users')}>
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
          </Button>
        }
      />

      <Card className="p-6">
        <UserForm
          key={targetUser.id}
          user={targetUser}
          isAdmin={isAdmin}
          onUpdateUser={updateUser}
          onSaved={() => navigate('/users')}
          onCancel={() => navigate('/users')}
        />
      </Card>
    </div>
  );
}
