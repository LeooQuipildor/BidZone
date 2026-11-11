import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const PLATFORM_LINKS = [
  { to: '/auctions', label: 'Catálogo de Lotes' },
  { to: '/bids', label: 'Historial de Pujas' },
  { to: '/reviews', label: 'Reseñas 1 a 5 ★' },
  { to: '/reports', label: 'Centro de Reportes' },
];

const BUSINESS_RULES = [
  'RN01 · Puja superadora',
  'RN02 · Prohibición propia',
  'RN05 · Liberación de datos',
  'RN06 · Sanción de cuenta',
];

const TEAM_MEMBERS = [
  'Mario Matías Moussa',
  'Luciano Medina',
  'Leandro Agustín Quipildor',
];

const FOOTER_MODULES = ['Subastas', 'Pujas', 'Reportes', 'Reseñas', 'Usuarios'];

export function Footer() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pb-6">
      <footer className="rounded-[28px] bg-[#224F10] text-[#EAFFD0] p-7 sm:p-10 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 border-b border-[#EAFFD0]/15">
          <div className="lg:col-span-5 space-y-5">
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#EAFFD0] leading-snug max-w-sm">
              Participa en subastas con trato directo seguro
            </h3>

            <button
              onClick={() => navigate('/auctions')}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] text-[#0D0D0D] pl-5 pr-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Explorar lotes</span>
              <span className="w-6 h-6 rounded-full bg-[#224F10] text-[#EAFFD0] flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-2.5">
              <p className="text-[11px] uppercase tracking-wider text-[#B0E454] font-semibold">
                Plataforma
              </p>
              <ul className="space-y-2 text-[#EAFFD0]/80">
                {PLATFORM_LINKS.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="hover:text-[#B0E454]">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="text-[11px] uppercase tracking-wider text-[#B0E454] font-semibold">
                Reglas de Negocio
              </p>
              <ul className="space-y-2 text-[#EAFFD0]/80">
                {BUSINESS_RULES.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2.5 col-span-2 sm:col-span-1">
              <p className="text-[11px] uppercase tracking-wider text-[#B0E454] font-semibold">
                Grupo 8 · Prog 4
              </p>
              <ul className="space-y-2 text-[#EAFFD0]/80">
                {TEAM_MEMBERS.map((member) => (
                  <li key={member}>{member}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="py-5 border-b border-[#EAFFD0]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#EAFFD0]/10 border border-[#EAFFD0]/20 flex items-center justify-center text-[#B0E454]">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-[#EAFFD0]">
                Sistema BidZone · Sin pasarelas ni billeteras virtuales
              </p>
              <p className="text-[11px] text-[#EAFFD0]/65">
                Coordinación directa entre comprador y vendedor al cierre de la subasta
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FOOTER_MODULES.map((mod) => (
              <span
                key={mod}
                className="px-3.5 py-1 rounded-full border border-[#EAFFD0]/25 text-[11px] font-medium text-[#EAFFD0]/90"
              >
                {mod}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#EAFFD0]/60">
          <span>© 2026 BidZone · Todos los derechos reservados · Programación 4</span>
          <span>Paleta Oficial: #B0E454 · #224F10 · #EAFFD0 · #0D0D0D</span>
        </div>
      </footer>
    </div>
  );
}

