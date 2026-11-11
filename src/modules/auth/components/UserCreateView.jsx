import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../states/authStore';
import {
  Card,
  Input,
  Select,
  Button,
  PageHeader,
  Alert,
} from '../../core/design-system/ui';
import { UserPlus, ArrowLeft } from 'lucide-react';

export function UserCreateView() {
  const navigate = useNavigate();
  const createUser = useAuthStore((s) => s.createUser);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    role: 'user',
    status: 'active',
  });
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    setFormData((prev) => ({ ...prev, [fieldName]: fieldValue }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setErrorMsg('Nombre, correo electrónico y contraseña son obligatorios.');
      return;
    }

    try {
      await createUser(formData);
      navigate('/users');
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

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
              placeholder="Ej: Sofía Gómez"
              value={formData.name}
              onChange={handleChange}
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Correo Electrónico *"
              placeholder="sofia@bidzone.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="password"
              name="password"
              type="password"
              label="Contraseña Temporal *"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
            />
            <Input
              id="phone"
              name="phone"
              label="Teléfono / WhatsApp *"
              placeholder="+54 9 381 400-0000"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="city"
              name="city"
              label="Ciudad"
              placeholder="San Miguel de Tucumán"
              value={formData.city}
              onChange={handleChange}
            />
            <Select
              id="role"
              name="role"
              label="Rol de Sistema"
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
              label="Estado Inicial"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'active', label: 'Activa' },
                { value: 'suspended', label: 'Suspendida' },
                { value: 'closed', label: 'Cerrada' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => navigate('/users')}>
              Cancelar
            </Button>
            <Button type="submit">
              <UserPlus className="w-4 h-4" />
              Guardar Usuario
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
