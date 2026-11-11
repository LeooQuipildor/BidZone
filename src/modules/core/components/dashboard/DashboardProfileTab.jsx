import React, { useState } from 'react';
import { useAuthStore } from '../../../auth/states/authStore';
import { sameId } from '../../utils/formatters';
import { getInitials } from './dashboardHelpers';
import { DashboardFeedback } from './DashboardShared';
import { Input, Button } from '../../design-system/ui';
import { Save, Star, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

// Formulario separado con `key` para reiniciarse limpio cuando cambian los datos del usuario
function ProfileFormCard({ currentUser, updateUser, onFeedback }) {
  const [formData, setFormData] = useState(() => ({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    city: currentUser?.city || '',
  }));

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    onFeedback(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      onFeedback({ type: 'error', text: 'El nombre y el correo electrónico son obligatorios.' });
      return;
    }

    try {
      await updateUser(currentUser.id, formData);
      onFeedback({
        type: 'success',
        text: 'Tus datos de coordinación directa RN05 se actualizaron correctamente.',
      });
    } catch (err) {
      onFeedback({ type: 'error', text: err.message });
    }
  }

  return (
    <div className="lg:col-span-8 rounded-2xl bg-white border border-[#224F10]/10 p-6 shadow-2xs">
      <h2 className="text-base font-bold text-[#0D0D0D] pb-4 border-b border-[#224F10]/10">
        Datos de Contacto y Coordinación
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="name" name="name" label="Nombre Completo *" value={formData.name} onChange={handleChange} />
          <Input id="email" name="email" type="email" label="Correo Electrónico *" value={formData.email} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="phone" name="phone" label="Teléfono / WhatsApp RN05 *" value={formData.phone} onChange={handleChange} />
          <Input id="city" name="city" label="Ciudad / Localidad" value={formData.city} onChange={handleChange} />
        </div>
        <div className="flex justify-end pt-3">
          <Button type="submit">
            <Save className="w-3.5 h-3.5" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}

export function DashboardProfileTab({ currentUser, auctions, bids }) {
  const updateUser = useAuthStore((s) => s.updateUser);
  const [feedback, setFeedback] = useState(null);

  const myAuctionsCount = auctions.filter((a) => sameId(a.sellerId, currentUser?.id)).length;
  const myBidsCount = bids.filter((b) => sameId(b.bidderId, currentUser?.id)).length;
  const roleLabel = currentUser?.role === 'admin' ? 'Administrador' : 'Socio';
  const profileKey = `${currentUser?.id || 'anon'}-${currentUser?.name || ''}-${currentUser?.email || ''}-${currentUser?.phone || ''}-${currentUser?.city || ''}`;

  return (
    <div className="space-y-6">
      <div className="pt-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">Mi Perfil</h1>
        <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">
          Mantén actualizados tu teléfono y ciudad para la liberación automática de datos al cierre (RN05).
        </p>
      </div>

      <DashboardFeedback feedback={feedback} onClose={() => setFeedback(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-[#224F10] to-[#122B08] text-[#EAFFD0] p-6 flex flex-col justify-between gap-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#B0E454] text-[#0D0D0D] font-bold text-lg flex items-center justify-center shrink-0">
                {getInitials(currentUser?.name)}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{currentUser?.name}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B0E454]/20 text-[#B0E454] text-[10px] font-bold uppercase mt-1">
                  <ShieldCheck className="w-3 h-3" />
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#EAFFD0]/85 pt-2 border-t border-[#EAFFD0]/15">
              <p className="flex items-center gap-2 truncate"><Mail className="w-3.5 h-3.5 text-[#B0E454] shrink-0" />{currentUser?.email}</p>
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#B0E454] shrink-0" />{currentUser?.phone || 'Sin teléfono cargado'}</p>
              <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#B0E454] shrink-0" />{currentUser?.city || 'Argentina'}</p>
              <p className="flex items-center gap-2 font-semibold text-white"><Star className="w-3.5 h-3.5 text-[#B0E454] fill-[#B0E454] shrink-0" />Reputación: {currentUser?.reputation || '5.0'} / 5.0</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#EAFFD0]/15">
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="text-2xl font-bold text-white">{myAuctionsCount}</p>
              <p className="text-[10px] text-[#EAFFD0]/75">Subastas creadas</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="text-2xl font-bold text-white">{myBidsCount}</p>
              <p className="text-[10px] text-[#EAFFD0]/75">Pujas emitidas</p>
            </div>
          </div>
        </div>

        <ProfileFormCard key={profileKey} currentUser={currentUser} updateUser={updateUser} onFeedback={setFeedback} />
      </div>
    </div>
  );
}
