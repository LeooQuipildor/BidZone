import React, { useState } from 'react';
import { useAuthStore } from '../../../auth/states/authStore';
import { UserForm } from '../../../auth/components/UserForm';
import { sameId, findById, matchesSearch } from '../../utils/formatters';
import { DashboardFeedback, DashboardFormPanel, DashboardStatCard } from './DashboardShared';
import { DashboardUserCard } from './DashboardUserCard';
import { UserPlus, Users as UsersIcon } from 'lucide-react';

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

  const editingUser = editingUserId ? findById(users, editingUserId) : null;
  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const adminUsersCount = users.filter((u) => u.role === 'admin').length;
  const sanctionedUsersCount = users.filter((u) => u.status === 'suspended' || u.status === 'closed').length;

  const filteredUsers = users.filter((user) => {
    const matchText = matchesSearch([user.name, user.email, user.city], searchQuery);
    const matchRole = roleFilter === 'todos' || user.role === roleFilter;
    const matchStatus = statusFilter === 'todos' || user.status === statusFilter;
    return matchText && matchRole && matchStatus;
  });

  function closeForm() {
    setFormOpen(false);
    setEditingUserId(null);
  }

  function handleSaved(_savedUser, savedName) {
    setFeedback({
      type: 'success',
      text: editingUser
        ? `Usuario "${savedName}" actualizado correctamente.`
        : `Usuario "${savedName}" registrado en la plataforma.`,
    });
    closeForm();
  }

  async function handleDelete(user) {
    if (sameId(user.id, currentUser?.id)) {
      setFeedback({ type: 'error', text: 'No puedes eliminar tu propia sesión activa.' });
      return;
    }
    const label = user.email ? `"${user.name}" (${user.email})` : `"${user.name}"`;
    if (!window.confirm(`¿Estás seguro de eliminar al usuario ${label}?`)) return;
    try {
      await deleteUser(user.id);
      setFeedback({ type: 'success', text: `Usuario "${user.name}" eliminado correctamente.` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">Directorio de Usuarios</h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">
            Gestión de socios, control de roles (Admin/User), reputación y estado disciplinario.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => { setEditingUserId(null); setFormOpen(true); setFeedback(null); }}
            className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start md:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Nuevo Usuario</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard highlight title="Total Comunidad" icon={<UsersIcon className="w-3.5 h-3.5" />} value={users.length} subtitle="Socios verificados" />
        <DashboardStatCard title="Cuentas Activas" value={activeUsersCount} subtitle="Habilitadas para pujar" subtitleClassName="text-[#224F10] font-semibold" />
        <DashboardStatCard title="Moderadores" value={adminUsersCount} subtitle="Rol Administrador" />
        <DashboardStatCard title="Sancionados" value={sanctionedUsersCount} subtitle="Suspensión o cierre RN06" subtitleClassName="text-red-700 font-semibold" />
      </div>

      <DashboardFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      {formOpen && (
        <DashboardFormPanel
          title={editingUser ? `Editar Usuario: ${editingUser.name}` : 'Alta de Nuevo Usuario'}
          onClose={closeForm}
        >
          <UserForm
            key={editingUser ? editingUser.id : 'new'}
            user={editingUser}
            isAdmin={isAdmin}
            onCreateUser={createUser}
            onUpdateUser={updateUser}
            onSaved={handleSaved}
            onCancel={closeForm}
          />
        </DashboardFormPanel>
      )}

      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-2xs">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none"
        >
          <option value="todos">Rol: Todos los roles</option>
          <option value="admin">Rol: Administrador</option>
          <option value="user">Rol: Usuario estándar</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none"
        >
          <option value="todos">Estado: Todos los estados</option>
          <option value="active">Estado: Activa</option>
          <option value="suspended">Estado: Suspendida</option>
          <option value="closed">Estado: Cerrada</option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-10 text-center text-xs text-[#0D0D0D]/60">
          No hay usuarios que coincidan con el filtro aplicado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.map((user, idx) => (
            <DashboardUserCard
              key={user.id}
              user={user}
              colorIndex={idx}
              canEdit={isAdmin || sameId(currentUser?.id, user.id)}
              canDelete={isAdmin && !sameId(currentUser?.id, user.id)}
              onEdit={() => { setEditingUserId(user.id); setFormOpen(true); setFeedback(null); }}
              onDelete={() => handleDelete(user)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
