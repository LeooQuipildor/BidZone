import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../states/authStore';
import { UserForm } from './UserForm';
import { Button, Card, PageHeader } from '../../core/design-system/ui';
import { ArrowLeft } from 'lucide-react';

export function UserCreateView() {
  const navigate = useNavigate();
  const createUser = useAuthStore((s) => s.createUser);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Alta de Nuevo Usuario"
        subtitle="Registrar un nuevo usuario o administrador en la plataforma."
        action={
          <Button variant="outline" onClick={() => navigate('/users')}>
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
          </Button>
        }
      />

      <Card className="p-6">
        <UserForm
          isAdmin
          onCreateUser={createUser}
          onSaved={() => navigate('/users')}
          onCancel={() => navigate('/users')}
        />
      </Card>
    </div>
  );
}
