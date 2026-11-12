import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Layers, ShieldCheck, Tag } from "lucide-react";
import { OPCIONES_ESTADO_SALA, OPCIONES_ORDEN_SUBASTA } from "../utilidades/formatos";

// Cajita reutilizable para cada filtro rápido de la portada
function CajaFiltroPortada({ icono, titulo, children }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/75 border border-[#224F10]/10">
      <span className="w-8 h-8 rounded-full bg-[#B0E454]/35 text-[#224F10] flex items-center justify-center shrink-0">
        {icono}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-[#0D0D0D]/55 font-medium">{titulo}</p>
        {children}
      </div>
    </div>
  );
}

// Portada principal del inicio con accesos rápidos y barra de búsqueda de subastas
export function PortadaInicio({ categorias, alBuscar }) {
  const navegar = useNavigate();
  const [categoriaElegida, setCategoriaElegida] = useState("Todas");
  const [estadoElegido, setEstadoElegido] = useState("activa");
  const [ordenElegido, setOrdenElegido] = useState("proximasACerrar");

  function enviarBusquedaRapida() {
    alBuscar({
      categoria: categoriaElegida,
      estado: estadoElegido,
      ordenarPor: ordenElegido,
    });
  }

  return (
    <section className="relative w-full min-h-[580px] sm:min-h-[660px] bg-[#0D0D0D] flex flex-col justify-between pt-36 md:pt-32 lg:pt-28 pb-8 sm:pb-10 px-4 sm:px-8 lg:px-12 shadow-lg overflow-hidden">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Velikiy_Novgorod_Detinets_01.jpg"
        alt="Portada BidZone"
        className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/15" />

      <div className="relative z-10 max-w-7xl mx-auto w-full my-auto py-6 sm:py-8">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#B0E454] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B0E454]" />
            <span>Plataforma de Subastas en Tiempo Real</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-semibold text-white tracking-tight leading-[1.08] drop-shadow-sm">
            Subastas transparentes con trato directo
          </h1>

          <p className="text-xs sm:text-sm text-white/85 max-w-lg leading-relaxed drop-shadow-xs">
            A pocos clics de tu próximo artículo. Puja en vivo con historial
            público y, al ganar la subasta, liberamos los datos de contacto del
            vendedor y del ganador para coordinar sin intermediarios.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navegar("/auctions")}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] text-[#0D0D0D] pl-5 pr-1.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-md"
            >
              <span>Explorar subastas</span>
              <span className="w-6 h-6 rounded-full bg-[#224F10] text-[#EAFFD0] flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => navegar("/auctions/new")}
              className="inline-flex items-center gap-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 text-white pl-5 pr-1.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-md"
            >
              <span>Publicar una subasta</span>
              <span className="w-6 h-6 rounded-full bg-white text-[#0D0D0D] flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra inferior de filtros rápidos */}
      <div className="relative z-10 max-w-7xl mx-auto w-full mt-6">
        <div className="rounded-2xl bg-[#EAFFD0] text-[#0D0D0D] p-2.5 sm:p-3 shadow-xl border border-[#224F10]/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-center">
          <CajaFiltroPortada
            icono={<Layers className="w-4 h-4" />}
            titulo="Categoría del lote"
          >
            <select
              value={categoriaElegida}
              onChange={(evento) => setCategoriaElegida(evento.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[#0D0D0D] focus:outline-none cursor-pointer"
            >
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </CajaFiltroPortada>

          <CajaFiltroPortada
            icono={<Clock className="w-4 h-4" />}
            titulo="Estado de subasta"
          >
            <select
              value={estadoElegido}
              onChange={(evento) => setEstadoElegido(evento.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[#0D0D0D] focus:outline-none cursor-pointer"
            >
              {OPCIONES_ESTADO_SALA.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </CajaFiltroPortada>

          <CajaFiltroPortada
            icono={<Tag className="w-4 h-4" />}
            titulo="Orden de precios"
          >
            <select
              value={ordenElegido}
              onChange={(evento) => setOrdenElegido(evento.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[#0D0D0D] focus:outline-none cursor-pointer"
            >
              {OPCIONES_ORDEN_SUBASTA.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </CajaFiltroPortada>

          <CajaFiltroPortada
            icono={<ShieldCheck className="w-4 h-4" />}
            titulo="Modalidad de cierre"
          >
            <p className="text-xs font-bold text-[#0D0D0D] truncate">
              Trato directo (RN05)
            </p>
          </CajaFiltroPortada>

          <button
            type="button"
            onClick={enviarBusquedaRapida}
            className="w-full h-full min-h-[44px] inline-flex items-center justify-between rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] pl-5 pr-2 py-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Buscar subasta</span>
            <span className="w-7 h-7 rounded-full bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
