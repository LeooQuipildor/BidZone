import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../states/authStore';
import {
  Card,
  Input,
  Select,
  Button,
  PageHeader,
  Alert,
  Spinner,
} from '../../core/design-system/ui';
import { Save, ArrowLeft } from 'lucide-react';

function UserEditForm({ targetUser, isAdmin, updateUser, navigate }) {
  const [formData, setFormData] = useState({
    name: targetUser.name || '',
    email: targetUser.email || '',
    phone: targetUser.phone || '',
    city: targetUser.city || '',
    role: targetUser.role || 'user',
    status: targetUser.status || 'active',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg('El nombre y el correo electrónico son obligatorios.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      city: formData.city.trim(),
    };
    if (isAdmin) {
      payload.role = formData.role;
      payload.status = formData.status;
    }

    try {
      await updateUser(targetUser.id, payload);
      navigate('/users');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

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
        {errorMsg && (
          <div className="mb-4">
            <Alert type="error" onClose={() => setErrorMsg('')}>
              {errorMsg}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="name"
              name="name"
              label="Nombre Completo *"
              value={formData.name}
              onChange={handleChange}
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Correo Electrónico *"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="phone"
              name="phone"
              label="Teléfono / WhatsApp para Coordinación *"
              value={formData.phone}
              onChange={handleChange}
            />
            <Input
              id="city"
              name="city"
              label="Ciudad / Ubicación"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          {isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#224F10]/50">
              <Select
                id="role"
                name="role"
                label="Rol de Permisos (Solo Admin)"
                value={formData.role}
                onChange={handleChange}
                options={[
                  { value: 'user', label: 'Usuario Estándar' },
                  { value: 'admin', label: 'Administrador' },
                ]}
              />
              <Select
                id="status"
                name="status"
                label="Estado de Cuenta / Sanción (Solo Admin)"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'active', label: 'Activa (Habilitada)' },
                  {
                    value: 'suspended',
                    label: 'Suspendida (Infracción temporal)',
                  },
                  {
                    value: 'closed',
                    label: 'Cerrada (Inhabilitación definitiva)',
                  },
                ]}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => navigate('/users')}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

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

  const targetUser = users.find((u) => Number(u.id) === Number(id));
  const isAdmin = currentUser?.role === 'admin';

  if (usersLoading && !targetUser) {
    return <Spinner label="Cargando perfil de usuario..." />;
  }

  if (!targetUser) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Alert type="error" title="Usuario no encontrado">
          El registro solicitado no existe.
        </Alert>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/users')}
        >
          Volver a Usuarios
        </Button>
      </div>
    );
  }

  if (!isAdmin && Number(currentUser?.id) !== Number(targetUser.id)) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Alert type="error" title="Sin permisos de edición">
          Solo puedes editar tu propio perfil o contar con permisos de administrador.
        </Alert>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/users')}
        >
          Volver a Usuarios
        </Button>
      </div>
    );
  }

  return (
    <UserEditForm
      key={targetUser.id}
      targetUser={targetUser}
      isAdmin={isAdmin}
      updateUser={updateUser}
      navigate={navigate}
    />
  );
}

