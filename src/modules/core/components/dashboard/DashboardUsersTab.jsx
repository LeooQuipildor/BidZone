import React, { useState } from 'react';
import { useAuthStore } from '../../../auth/states/authStore';
import { sameId, matchesSearch } from '../../utils/formatters';
import { getInitials } from './dashboardHelpers';
import { DashboardFeedback, DashboardStatCard } from './DashboardShared';
import {
  UserPlus,
  X,
  Users as UsersIcon,
  Edit3,
  Trash2,
  Phone,
  MapPin,
  Star,
  Shield,
  Save,
} from 'lucide-react';

const AVATAR_COLORS = [
  'bg-[#EAFFD0] text-[#224F10]',
  'bg-[#B0E454] text-[#0D0D0D]',
  'bg-[#224F10] text-[#EAFFD0]',
  'bg-[#0D0D0D] text-[#B0E454]',
];

const EMPTY_USER_FORM = {
  name: '',
  email: '',
  password: '',
  phone: '',
  city: '',
  role: 'user',
  status: 'active',
};

// Traduce el estado técnico de la cuenta a un texto claro y color de etiqueta
function getAccountStatusInfo(status) {
  if (status === 'active') {
    return {
      label: 'Activa',
      className: 'bg-[#F7FBF3] text-[#224F10] border-[#224F10]/15',
    };
  }
  if (status === 'suspended') {
    return {
      label: 'Suspendida',
      className: 'bg-red-50 text-red-700 border-red-200',
    };
  }
  return {
    label: 'Cerrada',
    className: 'bg-red-50 text-red-700 border-red-200',
  };
}

export function DashboardUsersTab({ currentUser, users, searchQuery }) {
  const createUser = useAuthStore((s) => s.createUser);
  const updateUser = useAuthStore((s) => s.updateUser);
  const deleteUser = useAuthStore((s) => s.deleteUser);

  const isAdmin = currentUser?.role === 'admin';

  const [roleFilter, setRoleFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [feedback, setFeedback] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_USER_FORM);

  // Contadores de resumen para el panel
  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const adminUsersCount = users.filter((u) => u.role === 'admin').length;
  const sanctionedUsersCount = users.filter(
    (u) => u.status === 'suspended' || u.status === 'closed'
  ).length;

  const filteredUsers = users.filter((user) => {
    const matchText = matchesSearch(
      [user.name, user.email, user.city],
      searchQuery
    );
    const matchRole = roleFilter === 'todos' || user.role === roleFilter;
    const matchStatus =
      statusFilter === 'todos' || user.status === statusFilter;
    return matchText && matchRole && matchStatus;
  });

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function openCreateForm() {
    setEditingUserId(null);
    setFormData(EMPTY_USER_FORM);
    setFormOpen(true);
    setFeedback(null);
  }

  function openEditForm(user) {
    setEditingUserId(user.id);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      city: user.city || '',
      role: user.role || 'user',
      status: user.status || 'active',
    });
    setFormOpen(true);
    setFeedback(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setFeedback({
        type: 'error',
        text: 'El nombre y el correo electrónico son obligatorios.',
      });
      return;
    }

    try {
      if (editingUserId) {
        const updates = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
        };
        if (isAdmin) {
          updates.role = formData.role;
          updates.status = formData.status;
        }
        await updateUser(editingUserId, updates);
        setFeedback({
          type: 'success',
          text: `Usuario "${formData.name}" actualizado correctamente.`,
        });
      } else {
        if (!formData.password) {
          setFeedback({
            type: 'error',
            text: 'Debes asignar una contraseña temporal para el nuevo usuario.',
          });
          return;
        }
        await createUser(formData);
        setFeedback({
          type: 'success',
          text: `Usuario "${formData.name}" registrado en la plataforma.`,
        });
      }
      setFormOpen(false);
      setEditingUserId(null);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  }

  async function handleDelete(user) {
    if (sameId(user.id, currentUser?.id)) {
      setFeedback({
        type: 'error',
        text: 'No puedes eliminar tu propia sesión activa.',
      });
      return;
    }

    const label = user.email ? `"${user.name}" (${user.email})` : `"${user.name}"`;
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar al usuario ${label}?`
    );
    if (!confirmed) return;

    try {
      await deleteUser(user.id);
      setFeedback({
        type: 'success',
        text: `Usuario "${user.name}" eliminado correctamente.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
            Directorio de Usuarios
          </h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">
            Gestión de socios, control de roles (Admin/User), reputación y estado
            disciplinario.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start md:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Nuevo Usuario</span>
          </button>
        )}
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard
          highlight
          title="Total Comunidad"
          icon={<UsersIcon className="w-3.5 h-3.5" />}
          value={users.length}
          subtitle="Socios verificados"
        />
        <DashboardStatCard
          title="Cuentas Activas"
          value={activeUsersCount}
          subtitle="Habilitadas para pujar"
          subtitleClassName="text-[#224F10] font-semibold"
        />
        <DashboardStatCard
          title="Moderadores"
          value={adminUsersCount}
          subtitle="Rol Administrador"
        />
        <DashboardStatCard
          title="Sancionados"
          value={sanctionedUsersCount}
          subtitle="Suspensión o cierre RN06"
          subtitleClassName="text-red-700 font-semibold"
        />
      </div>

      <DashboardFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      {/* Formulario integrado para crear o editar un usuario */}
      {formOpen && (
        <div className="rounded-2xl bg-white border border-[#224F10]/20 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-[#224F10]/10 pb-3">
            <h2 className="text-base font-bold text-[#0D0D0D]">
              {editingUserId
                ? `Editar Usuario: ${formData.name}`
                : 'Alta de Nuevo Usuario'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditingUserId(null);
              }}
              className="w-8 h-8 rounded-full bg-[#F7FBF3] hover:bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {!editingUserId && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                    Contraseña Temporal *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                />
              </div>
            </div>

            {isAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#224F10]/10">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                    Rol de Permisos
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => updateField('role', e.target.value)}
                    className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                  >
                    <option value="user">Usuario estándar</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                    Estado de Cuenta
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateField('status', e.target.value)}
                    className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3 py-2 text-xs text-[#0D0D0D] focus:outline-none"
                  >
                    <option value="active">Activa (Habilitada)</option>
                    <option value="suspended">Suspendida</option>
                    <option value="closed">Cerrada definitivamente</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded-full border border-[#224F10]/15 text-xs font-semibold text-[#0D0D0D]/75 hover:bg-[#F7FBF3] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] text-xs font-semibold cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {editingUserId ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Barra de filtros */}
      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#0D0D0D]/55 shrink-0">
            Rol:
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuario estándar</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#0D0D0D]/55 shrink-0">
            Estado:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none"
          >
            <option value="todos">Todos los estados</option>
            <option value="active">Activa</option>
            <option value="suspended">Suspendida</option>
            <option value="closed">Cerrada</option>
          </select>
        </div>
      </div>

      {/* Grilla de usuarios */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-10 text-center text-xs text-[#0D0D0D]/60">
          No hay usuarios que coincidan con el filtro aplicado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.map((user, idx) => {
            const canEdit = isAdmin || sameId(currentUser?.id, user.id);
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const roleBadgeStyle =
              user.role === 'admin'
                ? 'bg-[#B0E454] text-[#0D0D0D]'
                : 'bg-[#EAFFD0] text-[#224F10]';
            const statusInfo = getAccountStatusInfo(user.status);
            const phoneDisplay =
              user.phone ||
              (user.contactLocked ? 'Privado (RN05)' : 'Sin teléfono');

            return (
              <div
                key={user.id}
                className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${avatarColor}`}
                      >
                        {getInitials(user.name)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#0D0D0D] truncate">
                          {user.name}
                        </h3>
                        <p className="text-[11px] text-[#0D0D0D]/55 truncate">
                          {user.email || 'Privado hasta el cierre (RN05)'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${roleBadgeStyle}`}
                      >
                        <Shield className="w-2.5 h-2.5" />
                        {user.role.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#F7FBF3] rounded-xl border border-[#224F10]/10 p-3.5 space-y-1.5 text-xs text-[#0D0D0D]/75">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#224F10] shrink-0" />
                      <span className="truncate">{phoneDisplay}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#224F10] shrink-0" />
                      <span className="truncate">
                        {user.city || 'Sin ciudad'}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 font-semibold text-[#0D0D0D]">
                      <Star className="w-3.5 h-3.5 text-[#224F10] fill-[#B0E454] shrink-0" />
                      <span>Reputación: {user.reputation || '5.0'} / 5.0</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#224F10]/8">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => openEditForm(user)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                  )}
                  {isAdmin && !sameId(currentUser?.id, user.id) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(user)}
                      className="w-7 h-7 rounded-full border border-red-200 hover:bg-red-50 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
