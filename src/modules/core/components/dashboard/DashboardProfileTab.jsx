import React, { useState } from 'react';
import { useAuthStore } from '../../../auth/states/authStore';
import { getInitials } from './dashboardHelpers';
import {
  Save,
  Star,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export function DashboardProfileTab({ currentUser, auctions, bids }) {
  const updateUser = useAuthStore((s) => s.updateUser);

  const [formData, setFormData] = useState(() => ({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    city: currentUser?.city || '',
  }));
  const [feedback, setFeedback] = useState(null);

  const myAuctionsCount = auctions.filter(
    (a) => Number(a.sellerId) === Number(currentUser?.id)
  ).length;
  const myBidsCount = bids.filter(
    (b) => Number(b.bidderId) === Number(currentUser?.id)
  ).length;

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
      await updateUser(currentUser.id, formData);
      setFeedback({
        type: 'success',
        text: 'Tus datos de coordinación directa RN05 se actualizaron correctamente.',
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
          Mi Perfil
        </h1>
        <p className="text-xs sm:text-sm text-[#0D0D0D]/60 mt-1">
          Mantén actualizados tu teléfono y ciudad para la liberación automática
          de datos al cierre de subastas (RN05).
        </p>
      </div>

      {/* Feedback */}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Identity Summary Bento Card */}
        <div className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-[#224F10] to-[#122B08] text-[#EAFFD0] p-6 flex flex-col justify-between gap-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#B0E454] text-[#0D0D0D] font-bold text-lg flex items-center justify-center shrink-0">
                {getInitials(currentUser?.name)}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white truncate">
                  {currentUser?.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B0E454]/20 text-[#B0E454] text-[10px] font-bold uppercase mt-1">
                  <ShieldCheck className="w-3 h-3" />
                  {currentUser?.role === 'admin' ? 'Administrador' : 'Socio'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#EAFFD0]/85 pt-2 border-t border-[#EAFFD0]/15">
              <p className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-[#B0E454] shrink-0" />
                {currentUser?.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#B0E454] shrink-0" />
                {currentUser?.phone || 'Sin teléfono cargado'}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#B0E454] shrink-0" />
                {currentUser?.city || 'Argentina'}
              </p>
              <p className="flex items-center gap-2 font-semibold text-white">
                <Star className="w-3.5 h-3.5 text-[#B0E454] fill-[#B0E454] shrink-0" />
                Reputación: {currentUser?.reputation || '5.0'} / 5.0
              </p>
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

        {/* Right Edit Profile Card */}
        <div className="lg:col-span-8 rounded-2xl bg-white border border-[#224F10]/10 p-6 shadow-2xs">
          <h2 className="text-base font-bold text-[#0D0D0D] pb-4 border-b border-[#224F10]/10">
            Datos de Contacto y Coordinación
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2.5 text-xs text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#224F10]/25"
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
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2.5 text-xs text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#224F10]/25"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Teléfono / WhatsApp RN05 *
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2.5 text-xs text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#224F10]/25"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#0D0D0D]/75">
                  Ciudad / Localidad
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, city: e.target.value }))
                  }
                  className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/15 px-3.5 py-2.5 text-xs text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#224F10]/25"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-5 py-2.5 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

