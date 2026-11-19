import React from 'react';
import { BarChart3, PieChart, ShieldAlert, Users } from 'lucide-react';

// Calcula el porcentaje entero de una parte sobre un total (evitando división por 0)
function calcularPorcentaje(parte, total) {
  if (!total) return 0;
  return Math.round((parte / total) * 100);
}

// Tarjeta contenedora uniforme para cada uno de los 4 gráficos
function TarjetaGrafico({ icono, titulo, subtitulo, children }) {
  return (
    <div className="rounded-2xl bg-white border border-[#224F10]/12 p-5 shadow-2xs flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#0D0D0D]">{titulo}</h3>
          <p className="text-[11px] text-[#0D0D0D]/55 mt-0.5">{subtitulo}</p>
        </div>
        <span className="w-8 h-8 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center shrink-0">
          {icono}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function GraficosAdminPanel({ subastas = [], reportes = [], usuarios = [] }) {
  // --- DATOS GRÁFICO 1: Subastas por Categoría (Top 5) ---
  const conteoCategorias = {};
  for (const s of subastas) {
    const cat = s.categoria || 'Sin categoría';
    conteoCategorias[cat] = (conteoCategorias[cat] || 0) + 1;
  }
  const categoriasOrdenadas = Object.entries(conteoCategorias)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCategoria = categoriasOrdenadas[0]?.[1] || 1;

  // --- DATOS GRÁFICO 2: Estado de Subastas (Activas / Finalizadas / Canceladas) ---
  const totalSubastas = subastas.length;
  const cantActivas = subastas.filter((s) => s.estado === 'activa').length;
  const cantFinalizadas = subastas.filter((s) => s.estado === 'finalizada').length;
  const cantCanceladas = subastas.filter((s) => s.estado === 'cancelada').length;

  const pctActivas = calcularPorcentaje(cantActivas, totalSubastas);
  const pctFinalizadas = calcularPorcentaje(cantFinalizadas, totalSubastas);
  const pctCanceladas = calcularPorcentaje(cantCanceladas, totalSubastas);

  // Grados para el gráfico circular con conic-gradient
  const corte1 = totalSubastas ? (cantActivas / totalSubastas) * 100 : 100;
  const corte2 = totalSubastas ? ((cantActivas + cantFinalizadas) / totalSubastas) * 100 : 100;

  // --- DATOS GRÁFICO 3: Tickets RN06 por Estado ---
  const ticketsAbiertos = reportes.filter((r) => r.estado === 'en_revision').length;
  const ticketsSancion = reportes.filter((r) => r.estado === 'resuelto_sancion').length;
  const ticketsSolucionados = reportes.filter((r) => r.estado === 'desestimado').length;
  const maxTickets = Math.max(ticketsAbiertos, ticketsSancion, ticketsSolucionados, 1);

  const barrasTickets = [
    { etiqueta: 'Abiertos', cantidad: ticketsAbiertos, color: 'bg-[#B0E454]' },
    { etiqueta: 'Sancionados', cantidad: ticketsSancion, color: 'bg-red-500' },
    { etiqueta: 'Solucionados', cantidad: ticketsSolucionados, color: 'bg-[#224F10]' },
  ];

  // --- DATOS GRÁFICO 4: Cuentas de Usuarios ---
  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((u) => u.estado === 'activa').length;
  const usuariosSuspendidos = usuarios.filter((u) => u.estado === 'suspendida').length;
  const usuariosCerrados = usuarios.filter((u) => u.estado === 'cerrada').length;
  const cantAdmins = usuarios.filter((u) => u.rol === 'admin').length;

  const filasUsuarios = [
    { etiqueta: 'Cuentas activas', cantidad: usuariosActivos, color: 'bg-[#224F10]' },
    { etiqueta: 'Suspendidas (RN06)', cantidad: usuariosSuspendidos, color: 'bg-amber-500' },
    { etiqueta: 'Cerradas (RN06)', cantidad: usuariosCerrados, color: 'bg-red-500' },
  ];

  return (
    <section className="space-y-3">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#224F10]">
          ESTADÍSTICAS EN VIVO
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-[#0D0D0D] mt-0.5">
          Resumen gráfico de la plataforma
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Gráfico de barras horizontales: Subastas por Categoría */}
        <TarjetaGrafico
          icono={<BarChart3 className="w-4 h-4" />}
          titulo="Subastas por categoría"
          subtitulo="Principales rubros publicados"
        >
          <div className="space-y-2.5">
            {categoriasOrdenadas.map(([nombre, cantidad]) => {
              const ancho = Math.max(8, Math.round((cantidad / maxCategoria) * 100));
              return (
                <div key={nombre} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#0D0D0D]/80 truncate">{nombre}</span>
                    <span className="font-bold text-[#224F10] tabular-nums">{cantidad}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#F1F8E9] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#224F10] transition-all duration-500"
                      style={{ width: `${ancho}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </TarjetaGrafico>

        {/* 2. Gráfico circular (dona): Estado de las Subastas */}
        <TarjetaGrafico
          icono={<PieChart className="w-4 h-4" />}
          titulo="Estado de subastas"
          subtitulo={`Distribución sobre ${totalSubastas} lotes`}
        >
          <div className="flex items-center gap-5">
            <div
              className="w-28 h-28 rounded-full shrink-0 flex items-center justify-center"
              style={{
                background: `conic-gradient(#224F10 0% ${corte1}%, #B0E454 ${corte1}% ${corte2}%, #EF4444 ${corte2}% 100%)`,
              }}
            >
              <div className="w-16 h-16 rounded-full bg-white flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-[#0D0D0D] leading-none">{totalSubastas}</span>
                <span className="text-[9px] text-[#0D0D0D]/55 uppercase">lotes</span>
              </div>
            </div>

            <div className="space-y-2 text-xs flex-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#0D0D0D]/80">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#224F10]" /> Activas
                </span>
                <strong className="text-[#0D0D0D]">{cantActivas} ({pctActivas}%)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#0D0D0D]/80">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B0E454]" /> Finalizadas
                </span>
                <strong className="text-[#0D0D0D]">{cantFinalizadas} ({pctFinalizadas}%)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#0D0D0D]/80">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Canceladas
                </span>
                <strong className="text-[#0D0D0D]">{cantCanceladas} ({pctCanceladas}%)</strong>
              </div>
            </div>
          </div>
        </TarjetaGrafico>

        {/* 3. Gráfico de barras verticales: Tickets y Reportes RN06 */}
        <TarjetaGrafico
          icono={<ShieldAlert className="w-4 h-4" />}
          titulo="Tickets y mediación RN06"
          subtitulo={`${reportes.length} expedientes registrados`}
        >
          <div className="grid grid-cols-3 gap-3 items-end h-32 pt-2">
            {barrasTickets.map((barra) => {
              const altura = barra.cantidad === 0 ? 8 : Math.max(18, Math.round((barra.cantidad / maxTickets) * 100));
              return (
                <div key={barra.etiqueta} className="flex flex-col items-center justify-end h-full gap-1.5">
                  <span className="text-xs font-bold text-[#0D0D0D] tabular-nums">{barra.cantidad}</span>
                  <div className="w-full max-w-[48px] flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-xl ${barra.color} transition-all duration-500`}
                      style={{ height: `${altura}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-[#0D0D0D]/70 text-center">
                    {barra.etiqueta}
                  </span>
                </div>
              );
            })}
          </div>
        </TarjetaGrafico>

        {/* 4. Gráfico de distribución: Cuentas de Usuarios */}
        <TarjetaGrafico
          icono={<Users className="w-4 h-4" />}
          titulo="Estado de usuarios"
          subtitulo={`${totalUsuarios} cuentas (${cantAdmins} admin · ${totalUsuarios - cantAdmins} socios)`}
        >
          <div className="space-y-3">
            {filasUsuarios.map((fila) => {
              const porcentaje = calcularPorcentaje(fila.cantidad, totalUsuarios);
              return (
                <div key={fila.etiqueta} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#0D0D0D]/80">{fila.etiqueta}</span>
                    <span className="font-bold text-[#0D0D0D] tabular-nums">
                      {fila.cantidad} ({porcentaje}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#F1F8E9] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${fila.color} transition-all duration-500`}
                      style={{ width: `${Math.max(fila.cantidad > 0 ? 6 : 0, porcentaje)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </TarjetaGrafico>
      </div>
    </section>
  );
}
