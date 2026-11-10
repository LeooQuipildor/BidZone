import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../states/authStore';
import {
  Card,
  Button,
  Badge,
  Input,
  Select,
  PageHeader,
  Alert,
} from '../../core/design-system/ui';
import {
  UserPlus,
  Edit3,
  Trash2,
  Star,
  Phone,
  MapPin,
  Shield,
} from 'lucide-react';

export function UsersListView() {
  const navigate = useNavigate();
  const users = useAuthStore((s) => s.users);
  const currentUser = useAuthStore((s) => s.currentUser);
  const fetchUsers = useAuthStore((s) => s.fetchUsers);
  const deleteUser = useAuthStore((s) => s.deleteUser);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'todos' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'todos' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDelete = async (user) => {
    if (Number(user.id) === Number(currentUser?.id)) {
      alert('No puedes eliminar tu propia sesión activa.');
      return;
    }
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar al usuario "${user.name}" (${user.email})?`
    );
    if (!confirmed) return;

    await deleteUser(user.id);
    setFeedback(`Usuario "${user.name}" eliminado correctamente.`);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Directorio de usuarios"
        subtitle="Gestión de cuentas registradas, control de roles (Admin/User), estado disciplinario y reputación."
        action={
          currentUser?.role === 'admin' && (
            <Button onClick={() => navigate('/users/new')}>
              <UserPlus className="w-4 h-4" />
              Nuevo Usuario
            </Button>
          )
        }
      />

      {feedback && (
        <Alert type="success" onClose={() => setFeedback('')}>
          {feedback}
        </Alert>
      )}

      <Card className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            id="search-users"
            label="Buscar por nombre o correo"
            placeholder="Ej: Mario, admin@bidzone.com..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            id="filter-role"
            label="Filtrar por Rol"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'todos', label: 'Todos los roles' },
              { value: 'admin', label: 'Administrador' },
              { value: 'user', label: 'Usuario estándar' },
            ]}
          />
          <Select
            id="filter-status"
            label="Estado de Cuenta"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'todos', label: 'Todos los estados' },
              { value: 'active', label: 'Activa' },
              { value: 'suspended', label: 'Suspendida por infracción' },
              { value: 'closed', label: 'Cerrada definitivamente' },
            ]}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((user) => {
          const canEdit =
            currentUser?.role === 'admin' ||
            Number(currentUser?.id) === Number(user.id);

          return (
            <Card key={user.id} className="flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-serif-display text-2xl font-semibold text-[#0D0D0D]">
                      {user.name}
                    </h3>
                    <p className="text-xs text-[#0D0D0D]/60">{user.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={user.role === 'admin' ? 'lime' : 'success'}>
                      <Shield className="w-3 h-3" />
                      {user.role.toUpperCase()}
                    </Badge>
                    <Badge
                      variant={
                        user.status === 'active'
                          ? 'default'
                          : 'danger'
                      }
                    >
                      {user.status === 'active'
                        ? 'Activa'
                        : user.status === 'suspended'
                          ? 'Suspendida'
                          : 'Cerrada'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#0D0D0D]/80 bg-white/80 p-3.5 rounded-2xl border border-[#224F10]/15">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#224F10]" />
                    <span>{user.phone || 'Sin teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#224F10]" />
                    <span>{user.city || 'Sin ciudad'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-[#224F10] fill-[#B0E454]" />
                    <span className="font-semibold">
                      Reputación: {user.reputation || '5.0'} / 5.0
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#224F10]/15">
                {canEdit && (
                  <Link to={`/users/${user.id}/edit`}>
                    <Button variant="secondary" size="sm">
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </Button>
                  </Link>
                )}
                {currentUser?.role === 'admin' &&
                  Number(currentUser.id) !== Number(user.id) && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(user)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </Button>
                  )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
