import React, { useState } from 'react';
import { useAuthStore } from '../../../auth/states/authStore';
import { getInitials } from './dashboardHelpers';
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
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    role: 'user',
    status: 'active',
  });

  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const adminUsersCount = users.filter((u) => u.role === 'admin').length;
  const sanctionedUsersCount = users.filter(
    (u) => u.status === 'suspended' || u.status === 'closed'
  ).length;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !normalizedQuery ||
      (u.name || '').toLowerCase().includes(normalizedQuery) ||
      (u.email || '').toLowerCase().includes(normalizedQuery) ||
      (u.city || '').toLowerCase().includes(normalizedQuery);
    const matchesRole = roleFilter === 'todos' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'todos' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const openCreateForm = () => {
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      city: '',
      role: 'user',
      status: 'active',
    });
    setFormOpen(true);
    setFeedback(null);
  };

  const openEditForm = (u) => {
    setEditingUserId(u.id);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      password: '',
      phone: u.phone || '',
      city: u.city || '',
      role: u.role || 'user',
      status: u.status || 'active',
    });
    setFormOpen(true);
    setFeedback(null);
  };

  const handleSubmit = async (e) => {
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
  };

  const handleDelete = async (user) => {
    if (Number(user.id) === Number(currentUser?.id)) {
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
  };

  const avatarColors = [
    'bg-[#EAFFD0] text-[#224F10]',
    'bg-[#B0E454] text-[#0D0D0D]',
    'bg-[#224F10] text-[#EAFFD0]',
    'bg-[#0D0D0D] text-[#B0E454]',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start md:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Nuevo Usuario</span>
          </button>
        )}
      </div>

      {/* 4 Donezo KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#224F10] to-[#122B08] text-[#EAFFD0] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#EAFFD0]/90">
              Total Comunidad
            </span>
            <span className="w-7 h-7 rounded-full bg-[#EAFFD0]/15 text-[#B0E454] flex items-center justify-center">
              <UsersIcon className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-4xl font-bold tracking-tight my-2">
            {users.length}
          </p>
          <span className="text-[11px] text-[#EAFFD0]/75">
            Socios verificados
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-xs font-semibold text-[#0D0D0D]/75">
            Cuentas Activas
          </span>
          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-2">
            {activeUsersCount}
          </p>
          <span className="text-[11px] text-[#224F10] font-semibold">
            Habilitadas para pujar
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-xs font-semibold text-[#0D0D0D]/75">
            Moderadores
          </span>
          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-2">
            {adminUsersCount}
          </p>
          <span className="text-[11px] text-[#0D0D0D]/55">
            Rol Administrador
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-xs font-semibold text-[#0D0D0D]/75">
            Sancionados
          </span>
          <p className="text-4xl font-bold tracking-tight text-[#0D0D0D] my-2">
            {sanctionedUsersCount}
          </p>
          <span className="text-[11px] text-red-700 font-semibold">
            Suspensión o cierre RN06
          </span>
        </div>
      </div>

      {/* Inline Feedback */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs font-medium border ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-[#EAFFD0] border-[#224F10]/20 text-[#224F10]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Inline Create / Edit User Panel */}
      {formOpen && (
        <div className="rounded-2xl bg-white border border-[#224F10]/20 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-[#224F10]/10 pb-3">
            <h2 className="text-base font-bold text-[#0D0D0D]">
              {editingUserId
                ? `Editar Usuario: ${formData.name}`
                : 'Alta de Nuevo Usuario'}
            </h2>
            <button
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
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
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
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, password: e.target.value }))
                    }
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
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phone: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, city: e.target.value }))
                  }
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
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, role: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, status: e.target.value }))
                    }
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

      {/* Filter Bar */}
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

      {/* Users Cards Grid */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-10 text-center text-xs text-[#0D0D0D]/60">
          No hay usuarios que coincidan con el filtro aplicado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.map((u, idx) => {
            const canEdit = isAdmin || Number(currentUser?.id) === Number(u.id);
            const isSanctioned =
              u.status === 'suspended' || u.status === 'closed';

            return (
              <div
                key={u.id}
                className="rounded-2xl bg-white border border-[#224F10]/10 p-5 flex flex-col justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                          avatarColors[idx % avatarColors.length]
                        }`}
                      >
                        {getInitials(u.name)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#0D0D0D] truncate">
                          {u.name}
                        </h3>
                        <p className="text-[11px] text-[#0D0D0D]/55 truncate">
                          {u.email || 'Privado hasta el cierre (RN05)'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-[#B0E454] text-[#0D0D0D]'
                            : 'bg-[#EAFFD0] text-[#224F10]'
                        }`}
                      >
                        <Shield className="w-2.5 h-2.5" />
                        {u.role.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isSanctioned
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-[#F7FBF3] text-[#224F10] border-[#224F10]/15'
                        }`}
                      >
                        {u.status === 'active'
                          ? 'Activa'
                          : u.status === 'suspended'
                            ? 'Suspendida'
                            : 'Cerrada'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#F7FBF3] rounded-xl border border-[#224F10]/10 p-3.5 space-y-1.5 text-xs text-[#0D0D0D]/75">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#224F10] shrink-0" />
                      <span className="truncate">
                        {u.phone ||
                          (u.contactLocked ? 'Privado (RN05)' : 'Sin teléfono')}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#224F10] shrink-0" />
                      <span className="truncate">{u.city || 'Sin ciudad'}</span>
                    </p>
                    <p className="flex items-center gap-2 font-semibold text-[#0D0D0D]">
                      <Star className="w-3.5 h-3.5 text-[#224F10] fill-[#B0E454] shrink-0" />
                      <span>Reputación: {u.reputation || '5.0'} / 5.0</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#224F10]/8">
                  {canEdit && (
                    <button
                      onClick={() => openEditForm(u)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#224F10]/20 hover:bg-[#EAFFD0] text-[#0D0D0D] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                  )}
                  {isAdmin && Number(currentUser?.id) !== Number(u.id) && (
                    <button
                      onClick={() => handleDelete(u)}
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

