import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Plus } from 'lucide-react';
import { buscarPorId, coincideConBusqueda, mismoId } from '../../utilidades/ayudas';
import { calcularTiempoRestante } from '../../utilidades/formatos';
import { BotonPanel, CabeceraSeccionPanel, GridEstadisticasPanel } from './PanelCompartido';
import { TarjetaProximoCierre, TarjetaSubastasRecientes } from './TarjetasResumenPanel';
import { CierresAdjudicadosPanel } from './CierresAdjudicadosPanel';
import { GraficosAdminPanel } from './GraficosAdminPanel';

function BotonFlecha({ alHacerClic, titulo, destacada = false }) {
  const claseColor = destacada
    ? 'bg-[#EAFFD0] hover:bg-[#B0E454]'
    : 'border border-[#224F10]/20 hover:bg-[#EAFFD0]';
  return (
    <button
      type="button"
      onClick={alHacerClic}
      title={titulo}
      className={`w-8 h-8 rounded-full text-[#0D0D0D] flex items-center justify-center transition-colors cursor-pointer ${claseColor}`}
    >
      <ArrowUpRight className="w-4 h-4" />
    </button>
  );
}

function obtenerTarjetasResumen({ esAdmin, usuarioActual, totales, alElegirSeccion }) {
  if (esAdmin) {
    return [
      {
        destacada: true,
        titulo: 'Total Subastas',
        valor: totales.totalSubastas,
        subtitulo: `${totales.activas} en vivo en plataforma`,
        accionSuperior: <BotonFlecha destacada titulo="Ir a Subastas" alHacerClic={() => alElegirSeccion('subastas')} />,
      },
      {
        titulo: 'Mis Pujas',
        valor: totales.misPujas,
        subtitulo: `${totales.totalPujas} pujas en plataforma`,
        accionSuperior: <BotonFlecha titulo="Ver mis pujas" alHacerClic={() => alElegirSeccion('pujas')} />,
      },
      {
        titulo: 'Tickets Abiertos',
        valor: totales.reportesAbiertos,
        subtitulo: `${totales.totalReportes} casos registrados`,
        accionSuperior: <BotonFlecha titulo="Ir a Tickets" alHacerClic={() => alElegirSeccion('reportes')} />,
      },
      {
        titulo: 'Usuarios',
        valor: totales.totalUsuarios,
        subtitulo: 'Cuentas registradas',
        accionSuperior: <BotonFlecha titulo="Ir a Usuarios" alHacerClic={() => alElegirSeccion('usuarios')} />,
      },
    ];
  }

  return [
    {
      destacada: true,
      titulo: 'Mis Subastas',
      valor: totales.misSubastas,
      subtitulo: `${totales.misActivas} activas ahora`,
      accionSuperior: <BotonFlecha destacada titulo="Ver mis subastas" alHacerClic={() => alElegirSeccion('subastas')} />,
    },
    {
      titulo: 'Mis Pujas',
      valor: totales.misPujas,
      subtitulo: 'Ofertas realizadas',
      accionSuperior: <BotonFlecha titulo="Ver mis pujas" alHacerClic={() => alElegirSeccion('pujas')} />,
    },
    {
      titulo: 'Cierres adjudicados',
      valor: totales.misCierres,
      subtitulo: 'Operaciones finalizadas',
      accionSuperior: <BotonFlecha titulo="Ver mis reseñas" alHacerClic={() => alElegirSeccion('resenas')} />,
    },
    {
      titulo: 'Mi Reputación',
      valor: `${usuarioActual?.reputacion || '5.0'} ★`,
      subtitulo: `${totales.reportesAbiertos} reportes en revisión`,
      accionSuperior: <BotonFlecha titulo="Ver mis reportes" alHacerClic={() => alElegirSeccion('reportes')} />,
    },
  ];
}

export function TabResumenPanel({
  usuarioActual,
  usuarios,
  subastas,
  pujas,
  reportes,
  resenas,
  textoBusqueda,
  ahoraMs,
  alElegirSeccion,
}) {
  const navegar = useNavigate();
  const esAdmin = usuarioActual?.rol === 'admin';

  // Segmentación de datos personales vs globales
  const misSubastas = subastas.filter((s) => mismoId(s.vendedorId, usuarioActual?.id));
  const misSubastasActivas = misSubastas.filter((s) => s.estado === 'activa');
  const misPujas = pujas.filter((p) => mismoId(p.postorId, usuarioActual?.id));
  const subastasActivas = subastas.filter((s) => s.estado === 'activa');
  const subastasAdjudicadas = subastas.filter((s) => s.estado === 'finalizada' && s.ganadorId);
  const reportesAbiertos = reportes.filter((r) => r.estado === 'en_revision');

  // Solo mostramos contactos liberados (RN05) en operaciones propias del usuario actual
  const misCierres = subastasAdjudicadas.filter(
    (s) => mismoId(s.ganadorId, usuarioActual?.id) || mismoId(s.vendedorId, usuarioActual?.id)
  );

  // Subasta más próxima a cerrar para alimentar el reloj regresivo destacado
  const fuenteProximo = !esAdmin && misSubastasActivas.length > 0 ? misSubastasActivas : subastasActivas;
  const subastaProximaACerrar =
    [...fuenteProximo].sort((a, b) => new Date(a.fechaFin).getTime() - new Date(b.fechaFin).getTime())[0] ||
    null;
  const cuentaRegresiva = subastaProximaACerrar
    ? calcularTiempoRestante(subastaProximaACerrar.fechaFin, ahoraMs).textoFormateado
    : '00:00:00';

  // Lista de publicaciones recientes filtrada por el buscador
  const listaRecientes = (esAdmin ? subastas : misSubastas)
    .filter((s) => coincideConBusqueda([s.titulo, s.categoria], textoBusqueda))
    .slice(0, 5);

  // Cierres adjudicados filtrados por búsqueda
  const cierresFiltrados = misCierres.filter((cierre) => {
    const vendedor = buscarPorId(usuarios, cierre.vendedorId);
    const ganador = buscarPorId(usuarios, cierre.ganadorId);
    return coincideConBusqueda(
      [cierre.titulo, vendedor?.nombre || cierre.nombreVendedor, ganador?.nombre || cierre.nombreGanador],
      textoBusqueda
    );
  });

  // Generación de tarjetas estadísticas
  const tarjetasResumen = obtenerTarjetasResumen({
    esAdmin,
    usuarioActual,
    alElegirSeccion,
    totales: {
      totalSubastas: subastas.length,
      activas: subastasActivas.length,
      totalPujas: pujas.length,
      misCierres: misCierres.length,
      reportesAbiertos: reportesAbiertos.length,
      totalReportes: reportes.length,
      totalUsuarios: usuarios.length,
      misSubastas: misSubastas.length,
      misActivas: misSubastasActivas.length,
      misPujas: misPujas.length,
    },
  });

  return (
    <div className="space-y-6">
      {/* Cabecera de la sección con botón directo para crear una subasta */}
      <CabeceraSeccionPanel
        titulo={esAdmin ? 'Panel de Administración' : 'Resumen de mi cuenta'}
        subtitulo={esAdmin ? 'Supervisa subastas globales, tickets y cuentas.' : 'Controla tus subastas publicadas, pujas y cierres adjudicados.'}
        botonPrincipal={
          <BotonPanel icono={<Plus className="w-3.5 h-3.5" />} alHacerClic={() => alElegirSeccion('subastas', { abrirFormulario: true })}>
            Publicar Subasta
          </BotonPanel>
        }
      />

      {/* Grilla superior de 4 tarjetas estadísticas */}
      <GridEstadisticasPanel tarjetas={tarjetasResumen} />

      {/* Gráficos visuales en vivo (exclusivos para el Administrador) */}
      {esAdmin && (
        <GraficosAdminPanel
          subastas={subastas}
          reportes={reportes}
          usuarios={usuarios}
        />
      )}

      {/* Bloque central: Próximo cierre con cuenta regresiva y publicaciones recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <TarjetaProximoCierre
          subasta={subastaProximaACerrar}
          cuentaRegresiva={cuentaRegresiva}
          alAccionar={() =>
            subastaProximaACerrar
              ? navegar(`/subastas/${subastaProximaACerrar.id}`)
              : alElegirSeccion('subastas', { abrirFormulario: true })
          }
        />
        <TarjetaSubastasRecientes
          titulo={esAdmin ? 'Subastas Recientes' : 'Mis Publicaciones Recientes'}
          subastas={listaRecientes}
          alAbrirSubasta={(idSubasta) => navegar(`/subastas/${idSubasta}`)}
        />
      </div>

      {/* Panel inferior de cierres con datos de contacto liberados (RN05) */}
      {(!esAdmin || misCierres.length > 0) && (
        <CierresAdjudicadosPanel
          cierres={cierresFiltrados}
          usuarios={usuarios}
          resenas={resenas}
          idUsuarioActual={usuarioActual?.id}
          alElegirSeccion={alElegirSeccion}
        />
      )}
    </div>
  );
}
