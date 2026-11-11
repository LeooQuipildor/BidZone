import React, { useState } from 'react';
import { Alert, Button, Input, Select } from '../../core/design-system/ui';
import { Save, UserPlus } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'user', label: 'Usuario Estándar' },
  { value: 'admin', label: 'Administrador' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activa (Habilitada)' },
  { value: 'suspended', label: 'Suspendida (Infracción temporal)' },
  { value: 'closed', label: 'Cerrada (Inhabilitación definitiva)' },
];

// Formulario único reutilizado para crear o editar un usuario (Panel y rutas /new y /edit)
export function UserForm({
  user = null,
  isAdmin = false,
  onCreateUser,
  onUpdateUser,
  onSaved,
  onCancel,
}) {
  const isEditing = Boolean(user);

  const [formData, setFormData] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    phone: user?.phone || '',
    city: user?.city || '',
    role: user?.role || 'user',
    status: user?.status || 'active',
  }));
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg('El nombre y el correo electrónico son obligatorios.');
      return;
    }

    try {
      if (isEditing) {
        const updates = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          city: formData.city.trim(),
        };
        if (isAdmin) {
          updates.role = formData.role;
          updates.status = formData.status;
        }
        const updated = await onUpdateUser(user.id, updates);
        onSaved?.(updated, formData.name.trim());
      } else {
        if (!formData.password) {
          setErrorMsg('Debes asignar una contraseña temporal para el nuevo usuario.');
          return;
        }
        const created = await onCreateUser(formData);
        onSaved?.(created, formData.name.trim());
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && <Alert type="error" onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="name" name="name" label="Nombre Completo *" placeholder="Ej: Sofía Gómez" value={formData.name} onChange={handleChange} />
        <Input id="email" name="email" type="email" label="Correo Electrónico *" placeholder="sofia@bidzone.com" value={formData.email} onChange={handleChange} />
      </div>

      <div className={`grid grid-cols-1 ${isEditing ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-4`}>
        {!isEditing && (
          <Input id="password" name="password" type="password" label="Contraseña Temporal *" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleChange} />
        )}
        <Input id="phone" name="phone" label="Teléfono / WhatsApp RN05" placeholder="+54 9 381 400-0000" value={formData.phone} onChange={handleChange} />
        <Input id="city" name="city" label="Ciudad" placeholder="San Miguel de Tucumán" value={formData.city} onChange={handleChange} />
      </div>

      {(isAdmin || !isEditing) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#224F10]/15">
          <Select id="role" name="role" label="Rol de Permisos" value={formData.role} onChange={handleChange} options={ROLE_OPTIONS} />
          <Select id="status" name="status" label="Estado de Cuenta / Sanción" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">
          {isEditing ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {isEditing ? 'Guardar Cambios' : 'Guardar Usuario'}
        </Button>
      </div>
    </form>
  );
}

