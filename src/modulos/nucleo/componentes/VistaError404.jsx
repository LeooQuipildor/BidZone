import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, SearchX } from 'lucide-react';

// Página simple de Error 404 siguiendo el estilo visual de BidZone
export function VistaError404() {
  return (
    <div className="min-h-[62vh] flex items-center justify-center py-10 px-2">
      <div className="w-full max-w-xl rounded-[28px] bg-white/85 border border-[#224F10]/15 p-8 sm:p-12 text-center shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#224F10] text-[#EAFFD0] flex items-center justify-center mx-auto">
          <SearchX className="w-8 h-8 text-[#B0E454]" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B0E454]/40 text-[#224F10] text-[11px] font-bold uppercase tracking-wider">
            Error 404
          </span>
          <h1 className="font-serif-display text-5xl sm:text-6xl font-semibold text-[#0D0D0D] tracking-tight">
            Página no encontrada
          </h1>
          <p className="text-xs sm:text-sm text-[#0D0D0D]/70 max-w-md mx-auto leading-relaxed">
            La sección que buscas no existe, cambió de dirección o todavía no se encuentra disponible en BidZone.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] px-5 py-2.5 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <Link
            to="/auctions"
            className="inline-flex items-center gap-2 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] border border-[#224F10]/20 text-[#0D0D0D] px-5 py-2.5 text-xs font-semibold transition-colors"
          >
            <Compass className="w-4 h-4 text-[#224F10]" />
            Explorar subastas
          </Link>
        </div>
      </div>
    </div>
  );
}

