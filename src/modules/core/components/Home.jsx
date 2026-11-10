import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuctionStore } from "../../auctions/states/auctionStore";
import { AuctionCard } from "../../auctions/components/AuctionCard";
import {
  ArrowRight,
  ArrowUpRight,
  Gavel,
  ShieldCheck,
  PhoneCall,
  Star,
  Clock,
  Tag,
  Layers,
  MapPin,
  Mail,
  Phone,
  AlertTriangle,
  Award,
  Sparkles,
} from "lucide-react";

export function Home() {
  const navigate = useNavigate();
  const auctions = useAuctionStore((s) => s.auctions);
  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);
  const setFilters = useAuctionStore((s) => s.setFilters);

  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [heroCategory, setHeroCategory] = useState("Todas");
  const [heroStatus, setHeroStatus] = useState("activa");
  const [heroSort, setHeroSort] = useState("endingSoon");

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const categories = [
    "Todas",
    "Tecnología",
    "Gaming",
    "Hogar y Oficina",
    "Fotografía",
  ];

  const filteredCatalog =
    selectedCategory === "Todas"
      ? auctions
      : auctions.filter((a) => a.category === selectedCategory);

  const handleHeroSearch = () => {
    setFilters({
      category: heroCategory,
      status: heroStatus,
      sortBy: heroSort,
    });
    navigate("/auctions");
  };

  return (
    <div className="w-full">
      {/* =====================================================================
          1. FULL-WIDTH HERO SECTION (Occupies 100% of the screen width)
         ===================================================================== */}
      <section className="relative w-full min-h-[580px] sm:min-h-[660px] bg-[#0D0D0D] flex flex-col justify-between pt-24 sm:pt-28 pb-8 sm:pb-10 px-4 sm:px-8 lg:px-12 shadow-lg overflow-hidden">
        {/* Background Atmospheric Kremlin / Fortress Image */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Velikiy_Novgorod_Detinets_01.jpg"
          alt="Fortaleza Histórica BidZone"
          className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/15" />

        {/* Middle Hero Content: Left Headline + CTAs */}
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
              público y, al ganar la subasta, liberamos los datos de contacto
              del vendedor y del ganador para coordinar sin intermediarios.
            </p>

            {/* Two Pill Buttons matching Hero Reference */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate("/auctions")}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] text-[#0D0D0D] pl-5 pr-1.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-md"
              >
                <span>Explorar subastas</span>
                <span className="w-6 h-6 rounded-full bg-[#224F10] text-[#EAFFD0] flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                onClick={() => navigate("/auctions/new")}
                className="inline-flex items-center gap-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 text-white pl-5 pr-1.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-md"
              >
                <span>Publicar un lote</span>
                <span className="w-6 h-6 rounded-full bg-white text-[#0D0D0D] flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Floating White/Mint Filter Bar inside Hero */}
        <div className="relative z-10 max-w-7xl mx-auto w-full mt-6">
          <div className="rounded-2xl bg-[#EAFFD0] text-[#0D0D0D] p-2.5 sm:p-3 shadow-xl border border-[#224F10]/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-center">
          {/* Filter Col 1 */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/75 border border-[#224F10]/10">
            <span className="w-8 h-8 rounded-full bg-[#B0E454]/35 text-[#224F10] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[#0D0D0D]/55 font-medium">
                Categoría del lote
              </p>
              <select
                value={heroCategory}
                onChange={(e) => setHeroCategory(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-[#0D0D0D] focus:outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Col 2 */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/75 border border-[#224F10]/10">
            <span className="w-8 h-8 rounded-full bg-[#B0E454]/35 text-[#224F10] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[#0D0D0D]/55 font-medium">
                Estado de subasta
              </p>
              <select
                value={heroStatus}
                onChange={(e) => setHeroStatus(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-[#0D0D0D] focus:outline-none cursor-pointer"
              >
                <option value="activa">En vivo (Activas)</option>
                <option value="finalizada">Adjudicadas</option>
                <option value="todas">Todas las salas</option>
              </select>
            </div>
          </div>

          {/* Filter Col 3 */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/75 border border-[#224F10]/10">
            <span className="w-8 h-8 rounded-full bg-[#B0E454]/35 text-[#224F10] flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[#0D0D0D]/55 font-medium">
                Orden de precios
              </p>
              <select
                value={heroSort}
                onChange={(e) => setHeroSort(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-[#0D0D0D] focus:outline-none cursor-pointer"
              >
                <option value="endingSoon">Próximas a cerrar</option>
                <option value="priceAsc">Menor oferta actual</option>
                <option value="priceDesc">Mayor oferta actual</option>
              </select>
            </div>
          </div>

          {/* Filter Col 4 */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/75 border border-[#224F10]/10">
            <span className="w-8 h-8 rounded-full bg-[#B0E454]/35 text-[#224F10] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[#0D0D0D]/55 font-medium">
                Modalidad de cierre
              </p>
              <p className="text-xs font-bold text-[#0D0D0D] truncate">
                Trato directo (RN05)
              </p>
            </div>
          </div>

          {/* Right Action Button */}
          <button
            onClick={handleHeroSearch}
            className="w-full h-full min-h-[44px] inline-flex items-center justify-between rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] pl-5 pr-2 py-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Buscar lote</span>
            <span className="w-7 h-7 rounded-full bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>
    </section>

    {/* Centered Content Container for Sections 2 to 6 */}
    <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-16 py-12 sm:py-16">
      {/* =====================================================================
          2. "TU CONFIANZA EMPIEZA AQUÍ" — 4 FEATURE CARDS (1 DARK GREEN + 3 LIGHT)
         ===================================================================== */}
      <section className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#224F10]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#224F10]" />
              <span>SOBRE LA PLATAFORMA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0D0D0D] leading-tight">
              Tu seguridad en cada puja empieza aquí
            </h2>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <p className="text-xs sm:text-sm text-[#0D0D0D]/70 leading-relaxed">
              BidZone elimina comisiones ocultas, billeteras complejas y
              retenciones bancarias. Al finalizar una subasta con ganador, se
              liberan automáticamente los datos de contacto de ambas partes.
            </p>
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#0D0D0D] hover:text-[#224F10]"
            >
              <span>Conoce nuestro reglamento y sanciones</span>
              <span className="w-6 h-6 rounded-full bg-white border border-[#224F10]/20 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#224F10]" />
              </span>
            </Link>
          </div>
        </div>

        {/* 4 Square Rounded Cards: First is Dark Forest Green, 2-4 are Soft White/Mint */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Dark Green Active Card */}
          <div className="rounded-3xl bg-[#224F10] text-[#EAFFD0] p-6 flex flex-col justify-between min-h-[210px] shadow-sm">
            <span className="w-10 h-10 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center">
              <Gavel className="w-5 h-5" />
            </span>
            <div className="space-y-1.5 pt-8">
              <h3 className="text-base font-semibold text-[#EAFFD0]">
                Ofertas en vivo auditables
              </h3>
              <p className="text-xs text-[#EAFFD0]/75 leading-relaxed">
                Cada puja supera el monto actual respetando el incremento mínimo
                configurado por el dueño (RN01).
              </p>
            </div>
          </div>

          {/* Card 2: Light Card */}
          <div className="rounded-3xl bg-white/80 border border-[#224F10]/12 p-6 flex flex-col justify-between min-h-[210px]">
            <span className="w-10 h-10 rounded-full bg-[#B0E454]/40 text-[#224F10] flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </span>
            <div className="space-y-1.5 pt-8">
              <h3 className="text-base font-semibold text-[#0D0D0D]">
                Liberación de datos al ganar
              </h3>
              <p className="text-xs text-[#0D0D0D]/65 leading-relaxed">
                Cuando cierra la subasta se desbloquean teléfono, WhatsApp y
                correo del vendedor y del ganador (RN05).
              </p>
            </div>
          </div>

          {/* Card 3: Light Card */}
          <div className="rounded-3xl bg-white/80 border border-[#224F10]/12 p-6 flex flex-col justify-between min-h-[210px]">
            <span className="w-10 h-10 rounded-full bg-[#B0E454]/40 text-[#224F10] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div className="space-y-1.5 pt-8">
              <h3 className="text-base font-semibold text-[#0D0D0D]">
                Infracción o cierre de cuenta
              </h3>
              <p className="text-xs text-[#0D0D0D]/65 leading-relaxed">
                Si alguna parte incumple el pago o entrega, se reporta en la
                página y se aplica sanción o cierre (RN06).
              </p>
            </div>
          </div>

          {/* Card 4: Light Card */}
          <div className="rounded-3xl bg-white/80 border border-[#224F10]/12 p-6 flex flex-col justify-between min-h-[210px]">
            <span className="w-10 h-10 rounded-full bg-[#B0E454]/40 text-[#224F10] flex items-center justify-center">
              <Star className="w-5 h-5" />
            </span>
            <div className="space-y-1.5 pt-8">
              <h3 className="text-base font-semibold text-[#0D0D0D]">
                Reputación de 1 a 5 estrellas
              </h3>
              <p className="text-xs text-[#0D0D0D]/65 leading-relaxed">
                Calificaciones mutuas verificadas tras cada operación para
                construir confianza en la comunidad (RN07).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. "ELIGE TU LOTE" — CATALOG GRID + DARK GREEN SUMMARY CARD
         ===================================================================== */}
      <section className="space-y-7">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#224F10]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#224F10]" />
              <span>CATÁLOGO DE SUBASTAS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0D0D0D]">
              Elige tu próximo artículo
            </h2>
          </div>

          {/* Category Filter Pills (Active pill in Dark Forest Green) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#224F10] text-[#EAFFD0]"
                    : "bg-white/75 text-[#0D0D0D]/75 hover:bg-white border border-[#224F10]/12"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Column Catalog Grid + Final Dark Green Summary Card (matching bottom-left of reference image) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCatalog.slice(0, 7).map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}

          {/* Final Slot: Solid Dark Forest Green Summary Card */}
          <div className="rounded-[28px] bg-[#224F10] text-[#EAFFD0] p-6 sm:p-7 flex flex-col justify-between min-h-[320px] shadow-sm">
            <span className="w-10 h-10 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </span>

            <div className="space-y-4 pt-6">
              <div className="space-y-1.5">
                <h3 className="text-xl font-semibold text-[#EAFFD0] leading-snug">
                  {auctions.length} lotes activos y adjudicados
                </h3>
                <p className="text-xs text-[#EAFFD0]/75 leading-relaxed">
                  Explora todas las categorías, filtra por precio y consulta el
                  historial completo de ofertas en vivo.
                </p>
              </div>

              <button
                onClick={() => navigate("/auctions")}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] text-[#0D0D0D] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Ver todos los lotes</span>
                <span className="w-6 h-6 rounded-full bg-[#224F10] text-[#EAFFD0] flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. BENTO MOSAIC SECTION (1 Large Left Image Card + 2x2 Right Mini Cards)
         ===================================================================== */}
      <section className="space-y-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-6 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#224F10]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#224F10]" />
              <span>ECOSISTEMA COMPLETO</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0D0D0D] leading-tight">
              Coordinación directa sin intermediarios
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="text-xs sm:text-sm text-[#0D0D0D]/70 leading-relaxed">
              Navega por los 5 módulos relacionales del sistema: administra
              subastas, revisa cada puja en tiempo real, gestiona datos de
              contacto liberados y audita reportes o reseñas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Large Image Card */}
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden min-h-[410px] bg-[#0D0D0D] p-6 sm:p-8 flex flex-col justify-end">
            <img
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80"
              alt="Sala de Subastas BidZone"
              className="absolute inset-0 w-full h-full object-cover opacity-65"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/95 via-[#0D0D0D]/40 to-transparent" />

            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAFFD0]/20 backdrop-blur-md border border-[#EAFFD0]/30 text-[#EAFFD0] text-[11px] font-medium">
                Liberación de Datos (RN05)
              </span>

              <div className="space-y-1.5">
                <h3 className="text-2xl sm:text-3xl font-semibold text-[#EAFFD0]">
                  Sala de Adjudicación Directa
                </h3>
                <p className="text-xs text-[#EAFFD0]/80 max-w-md leading-relaxed">
                  Cuando una subasta finaliza con ganador, habilitamos el panel
                  privado con teléfono, WhatsApp, email y ciudad tanto del
                  vendedor como del comprador.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] text-[#0D0D0D] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Mi Panel de Control</span>
                  <span className="w-6 h-6 rounded-full bg-[#224F10] text-[#EAFFD0] flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>

                <button
                  onClick={() => navigate("/bids")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#EAFFD0]/15 hover:bg-[#EAFFD0]/25 backdrop-blur-md border border-[#EAFFD0]/30 text-[#EAFFD0] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Historial de Pujas</span>
                  <span className="w-6 h-6 rounded-full bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 2x2 Mosaic of 4 Smaller Image Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Pujas en Vivo",
                subtitle: "Registro auditable en tiempo real",
                to: "/bids",
                img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=700&q=80",
              },
              {
                title: "Denuncias (RN06)",
                subtitle: "Infracciones y cierre de cuentas",
                to: "/reports",
                img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=700&q=80",
              },
              {
                title: "Reseñas 1 a 5 ★",
                subtitle: "Calificación mutua verificada",
                to: "/reviews",
                img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=700&q=80",
              },
              {
                title: "Comunidad y Roles",
                subtitle: "Gestión de usuarios y estados",
                to: "/users",
                img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=80",
              },
            ].map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group relative rounded-3xl overflow-hidden min-h-[195px] bg-[#0D0D0D] p-5 flex items-end justify-between"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/90 via-[#0D0D0D]/30 to-transparent" />

                <div className="relative z-10 pr-2">
                  <h4 className="text-base font-semibold text-[#EAFFD0]">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#EAFFD0]/75">
                    {item.subtitle}
                  </p>
                </div>

                <span className="relative z-10 w-8 h-8 rounded-full bg-[#EAFFD0] text-[#0D0D0D] group-hover:bg-[#B0E454] flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. SPLIT PROMO CARD + RIGHT MINT CARD ("RAZONES PARA CONFIAR")
         ===================================================================== */}
      <section className="space-y-7">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#224F10]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#224F10]" />
              <span>GARANTÍA Y CUMPLIMIENTO</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0D0D0D]">
              Respaldo ante cualquier incumplimiento
            </h2>
          </div>

          <Link
            to="/reports"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-[#0D0D0D] hover:text-[#224F10]"
          >
            <span>Ver todos los reportes</span>
            <span className="w-6 h-6 rounded-full bg-white border border-[#224F10]/20 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#224F10]" />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left 8-col Split Card (Dark Green Left + Image Right) */}
          <div className="lg:col-span-8 rounded-3xl overflow-hidden bg-[#224F10] text-[#EAFFD0] grid grid-cols-1 md:grid-cols-2 min-h-[280px] shadow-sm">
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <span className="w-10 h-10 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </span>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#EAFFD0] leading-snug">
                  Protección contra falta de pago o no entrega (RN06)
                </h3>
                <p className="text-xs text-[#EAFFD0]/80 leading-relaxed">
                  Si el ganador o el dueño del artículo no cumple el acuerdo, se
                  informa a la página para infraccionar, suspender o cerrar
                  definitivamente la cuenta.
                </p>
              </div>

              <div>
                <button
                  onClick={() => navigate("/reports/new")}
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] text-[#0D0D0D] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Informar incumplimiento</span>
                  <span className="w-6 h-6 rounded-full bg-[#224F10] text-[#EAFFD0] flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>

            <div className="relative min-h-[220px]">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80"
                alt="Auditoría y Sanciones BidZone"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right 4-col Soft Lime/Mint Card */}
          <div className="lg:col-span-4 rounded-3xl bg-[#B0E454]/35 border border-[#224F10]/15 p-6 sm:p-8 flex flex-col justify-between min-h-[280px]">
            <span className="w-10 h-10 rounded-full bg-white text-[#224F10] flex items-center justify-center shadow-2xs">
              <Award className="w-5 h-5" />
            </span>

            <div className="space-y-2 py-4">
              <h3 className="text-xl font-semibold text-[#0D0D0D] leading-snug">
                Certificado de Reputación
              </h3>
              <p className="text-xs text-[#0D0D0D]/70 leading-relaxed">
                Consulta las calificaciones de 1 a 5 estrellas otorgadas por
                otros compradores y vendedores antes de realizar tu oferta.
              </p>
            </div>

            <div>
              <button
                onClick={() => navigate("/reviews")}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Ver calificaciones</span>
                <span className="w-6 h-6 rounded-full bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. CONTACT & MEDIATION SPLIT CARD (White container: Left Info + Right Photo)
         ===================================================================== */}
      <section className="rounded-3xl bg-white/85 border border-[#224F10]/12 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#224F10]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#224F10]" />
              <span>CÓMO FUNCIONA EL CIERRE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0D0D0D] leading-tight">
              Trato directo y centro de mediación
            </h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[#EAFFD0] border border-[#224F10]/15 text-[#224F10] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </span>
              <div>
                <p className="text-[11px] text-[#0D0D0D]/55">
                  Coordinación de entrega
                </p>
                <p className="font-semibold text-[#0D0D0D]">
                  Acuerdo directo de envío o retiro según la ciudad de ambas
                  partes
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[#EAFFD0] border border-[#224F10]/15 text-[#224F10] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </span>
              <div>
                <p className="text-[11px] text-[#0D0D0D]/55">
                  Teléfono y WhatsApp desbloqueados
                </p>
                <p className="font-semibold text-[#0D0D0D]">
                  Visibles en la sala de subasta apenas finaliza el cronómetro
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[#EAFFD0] border border-[#224F10]/15 text-[#224F10] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </span>
              <div>
                <p className="text-[11px] text-[#0D0D0D]/55">
                  Mesa de ayuda y auditoría
                </p>
                <p className="font-semibold text-[#0D0D0D]">
                  mediacion@bidzone.com · Moderación activa 24/7
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate("/auctions")}
              className="inline-flex items-center gap-2 rounded-full bg-[#224F10] hover:bg-[#0D0D0D] text-[#EAFFD0] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Ir a las salas en vivo</span>
              <span className="w-6 h-6 rounded-full bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>

            <button
              onClick={() => navigate("/reports")}
              className="inline-flex items-center gap-2 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] border border-[#224F10]/20 text-[#0D0D0D] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Reportar usuario</span>
              <span className="w-6 h-6 rounded-full bg-white text-[#224F10] flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl overflow-hidden h-72 sm:h-80 bg-[#0D0D0D]">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80"
              alt="Acuerdo directo entre comprador y vendedor"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}

export default Home;
