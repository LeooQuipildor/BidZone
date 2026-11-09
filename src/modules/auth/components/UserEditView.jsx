import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../states/authStore';
import {
  Card,
  Input,
  Select,
  Button,
  PageHeader,
  Alert,
} from '../../core/design-system/ui';
import { Save, ArrowLeft } from 'lucide-react';

export function UserEditView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const users = useAuthStore((s) => s.users);
  const currentUser = useAuthStore((s) => s.currentUser);
  const updateUser = useAuthStore((s) => s.updateUser);

  const targetUser = users.find((u) => Number(u.id) === Number(id));

  const [formData, setFormData] = useState(() => ({
    name: targetUser?.name || '',
    email: targetUser?.email || '',
    phone: targetUser?.phone || '',
    city: targetUser?.city || '',
    role: targetUser?.role || 'user',
    status: targetUser?.status || 'active',
  }));
  const [errorMsg, setErrorMsg] = useState('');

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

  const isAdmin = currentUser?.role === 'admin';

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

    try {
      await updateUser(targetUser.id, formData);
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

