import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Plus } from 'lucide-react';
import { buscarPorId, coincideConBusqueda, mismoId } from '../../utilidades/ayudas';
import { formatearCuentaRegresiva } from './ayudasPanel';
import {
  BotonPanel,
  CabeceraSeccionPanel,
  GridEstadisticasPanel,
} from './PanelCompartido';
import { TarjetaProximoCierre, TarjetaSubastasRecientes } from './TarjetasResumenPanel';
import { FilaProgresoResumen } from './FilaProgresoResumen';
import { CierresAdjudicadosPanel } from './CierresAdjudicadosPanel';

function BotonFlechaEstadistica({ alHacerClic, titulo, destacada = false }) {
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

export function TabResumenPanel({
  usuarioActual,
  usuarios,
  subastas,
  pujas,
  reportes,
  textoBusqueda,
  ahoraMs,
  relojPausado,
  alAlternarPausa,
  alElegirSeccion,
}) {
  const navegar = useNavigate();
  const esAdmin = usuarioActual?.role === 'admin';

  // Métricas reales calculadas a partir de los datos cargados del servidor
  const subastasActivas = subastas.filter((subasta) => subasta.status === 'activa');
  const subastasAdjudicadas = subastas.filter((subasta) => subasta.status === 'finalizada' && subasta.winnerId);
  const misPujas = pujas.filter((puja) => mismoId(puja.bidderId, usuarioActual?.id));
  const reportesAbiertos = reportes.filter((reporte) => reporte.status === 'en_revision');

  // Subastas finalizadas en las que participa la persona (o todas si es admin)
  const cierresInvolucrados = subastasAdjudicadas.filter((subasta) => {
    const participa =
      mismoId(subasta.winnerId, usuarioActual?.id) ||
      mismoId(subasta.sellerId, usuarioActual?.id);
    return esAdmin || participa;
  });

  // Subasta activa que cierra más pronto
  const activasOrdenadas = [...subastasActivas].sort(
    (subastaA, subastaB) => new Date(subastaA.endTime).getTime() - new Date(subastaB.endTime).getTime()
  );
  const subastaProximaACerrar = activasOrdenadas[0] || null;
  const cuentaRegresiva = subastaProximaACerrar
    ? formatearCuentaRegresiva(subastaProximaACerrar.endTime, ahoraMs)
    : '00:00:00';

  const listaSubastasFiltradas = subastas
    .filter((subasta) => coincideConBusqueda([subasta.title, subasta.category], textoBusqueda))
    .slice(0, 5);
  const listaUsuariosFiltrados = usuarios
    .filter((usuario) => coincideConBusqueda([usuario.name, usuario.email, usuario.city], textoBusqueda))
    .slice(0, 4);
  const cierresFiltrados = cierresInvolucrados.filter((cierre) => {
    const vendedor = buscarPorId(usuarios, cierre.sellerId);
    const ganador = buscarPorId(usuarios, cierre.winnerId);
    return coincideConBusqueda(
      [cierre.title, vendedor?.name || cierre.sellerName, ganador?.name || cierre.winnerName],
      textoBusqueda
    );
  });

  const subtituloResumen = esAdmin
    ? 'Supervisa subastas en tiempo real, pujas vinculantes, sanciones y calificaciones.'
    : 'Planifica tus pujas, administra tus publicaciones y coordina cierres adjudicados.';

  const tarjetasResumen = [
    {
      destacada: true,
      titulo: 'Total Subastas',
      valor: subastas.length,
      subtitulo: `${subastasActivas.length} en vivo actualmente`,
      accionSuperior: <BotonFlechaEstadistica destacada titulo="Ver todas las subastas" alHacerClic={() => alElegirSeccion('subastas')} />,
    },
    {
      titulo: 'Subastas Adjudicadas',
      valor: subastasAdjudicadas.length,
      subtitulo: `${cierresInvolucrados.length} con contacto liberado RN05`,
      accionSuperior: <BotonFlechaEstadistica titulo="Explorar adjudicadas" alHacerClic={() => alElegirSeccion('subastas', { estado: 'finalizada' })} />,
    },
    {
      titulo: 'Pujas Registradas',
      valor: pujas.length,
      subtitulo: `${misPujas.length} ofertas realizadas por ti`,
      accionSuperior: <BotonFlechaEstadistica titulo="Historial de pujas" alHacerClic={() => alElegirSeccion('pujas')} />,
    },
    {
      titulo: 'Reportes Activos',
      valor: reportesAbiertos.length,
      subtitulo: `Tu reputación: ${usuarioActual?.reputation || '5.0'} ★`,
      accionSuperior: <BotonFlechaEstadistica titulo="Centro de reportes" alHacerClic={() => alElegirSeccion('reportes')} />,
    },
  ];

  return (
    <div className="space-y-6">
      <CabeceraSeccionPanel
        titulo="Panel Principal"
        subtitulo={subtituloResumen}
        botonPrincipal={
          <div className="flex flex-wrap items-center gap-2.5">
            <BotonPanel
              icono={<Plus className="w-3.5 h-3.5" />}
              alHacerClic={() => alElegirSeccion('subastas', { abrirFormulario: true })}
            >
              Publicar Subasta
            </BotonPanel>
            <BotonPanel
              variante="secundario"
              alHacerClic={() => alElegirSeccion('reportes', { abrirFormulario: true })}
            >
              Informar Incumplimiento
            </BotonPanel>
          </div>
        }
      />

      <GridEstadisticasPanel tarjetas={tarjetasResumen} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <TarjetaProximoCierre
          subasta={subastaProximaACerrar}
          cuentaRegresiva={cuentaRegresiva}
          alAccionar={() =>
            subastaProximaACerrar
              ? navegar(`/auctions/${subastaProximaACerrar.id}`)
              : alElegirSeccion('subastas', { abrirFormulario: true })
          }
        />
        <TarjetaSubastasRecientes
          subastas={listaSubastasFiltradas}
          alCrearNueva={() => alElegirSeccion('subastas', { abrirFormulario: true })}
          alAbrirSubasta={(idSubasta) => navegar(`/auctions/${idSubasta}`)}
        />
      </div>

      <FilaProgresoResumen
        usuarios={listaUsuariosFiltrados}
        pujas={pujas}
        cantidadAdjudicadas={subastasAdjudicadas.length}
        cantidadActivas={subastasActivas.length}
        totalSubastas={subastas.length}
        subastaProximaACerrar={subastaProximaACerrar}
        cuentaRegresiva={cuentaRegresiva}
        relojPausado={relojPausado}
        alAlternarPausa={alAlternarPausa}
        alAbrirSala={() =>
          subastaProximaACerrar
            ? navegar(`/auctions/${subastaProximaACerrar.id}`)
            : alElegirSeccion('subastas')
        }
        alVerUsuarios={() => alElegirSeccion('usuarios')}
      />

      <CierresAdjudicadosPanel
        cierres={cierresFiltrados}
        usuarios={usuarios}
        idUsuarioActual={usuarioActual?.id}
        alElegirSeccion={alElegirSeccion}
      />
    </div>
  );
}
