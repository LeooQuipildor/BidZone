/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/TabResumenPanel.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE COMPONENTE?
 * Es la vista principal o pestaña por defecto ("Resumen") del Panel de Control de BidZone.
 *
 * ¿POR QUÉ EXISTE Y CUÁL ES SU PROPÓSITO?
 * Ofrece un cuadro de mando integral adaptado dinámicamente según el rol del usuario:
 * 1. Para un Administrador:
 *    - Presenta métricas globales de la plataforma: cantidad total de subastas activas,
 *      ofertas realizadas, tickets de soporte y mediación RN06 pendientes de resolución,
 *      y usuarios registrados.
 * 2. Para un Socio (Usuario regular):
 *    - Presenta métricas estrictamente personales: cantidad de subastas publicadas propias,
 *      pujas emitidas (RN04), operaciones cerradas con contacto liberado (RN05) y su
 *      reputación promedio en estrellas (RN07).
 *
 * Además, ambos roles visualizan:
 * - Una tarjeta con la cuenta regresiva en vivo de la subasta más próxima a finalizar.
 * - Una lista de publicaciones recientes con acceso directo.
 * - El panel de operaciones cerradas y contactos liberados (`CierresAdjudicadosPanel`)
 *   donde pueden calificar a su contraparte o reportar incidentes.
 *
 * ¿DE DÓNDE PROVIENEN LOS DATOS?
 * - `usuarioActual`: Sesión activa de `tiendaAutenticacion.js`.
 * - `usuarios`: Lista de usuarios de `tiendaAutenticacion.js`.
 * - `subastas`: Lista de lotes de `tiendaSubastas.js`.
 * - `pujas`: Lista de ofertas de `tiendaPujas.js`.
 * - `reportes`: Tickets de disputa de `tiendaReportes.js`.
 * - `resenas`: Calificaciones de `tiendaResenas.js`.
 * - `textoBusqueda`: Cadena de búsqueda ingresada en la barra superior del Header.
 * - `ahoraMs`: Timestamp en milisegundos actualizado cada segundo en `VistaPanelControl.jsx`.
 * - `alElegirSeccion`: Función para navegar programáticamente entre pestañas del panel.
 * ==============================================================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Plus } from 'lucide-react';
import { buscarPorId, coincideConBusqueda, mismoId } from '../../utilidades/ayudas';
import { calcularTiempoRestante } from '../../utilidades/formatos';
import { BotonPanel, CabeceraSeccionPanel, GridEstadisticasPanel } from './PanelCompartido';
import { TarjetaProximoCierre, TarjetaSubastasRecientes } from './TarjetasResumenPanel';
import { CierresAdjudicadosPanel } from './CierresAdjudicadosPanel';

/**
 * Subcomponente auxiliar: BotonFlecha
 * ----------------------------------------------------------------------------
 * Renderiza el botón circular con flecha diagonal para saltar rápidamente
 * desde una tarjeta estadística hacia su pestaña correspondiente.
 */
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

/**
 * Función auxiliar: obtenerTarjetasResumen
 * ----------------------------------------------------------------------------
 * Construye la configuración de las 4 tarjetas métricas superiores según si
 * el usuario conectado tiene privilegios de administrador o es un socio común.
 */
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
        subtitulo: `${totales.totalReportes} casos RN06 registrados`,
        accionSuperior: <BotonFlecha titulo="Ir a Tickets RN06" alHacerClic={() => alElegirSeccion('reportes')} />,
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
      titulo: 'Cierres RN05',
      valor: totales.misCierres,
      subtitulo: 'Operaciones finalizadas',
      accionSuperior: <BotonFlecha titulo="Ver mis reseñas" alHacerClic={() => alElegirSeccion('resenas')} />,
    },
    {
      titulo: 'Mi Reputación',
      valor: `${usuarioActual?.reputation || '5.0'} ★`,
      subtitulo: `${totales.reportesAbiertos} reportes en revisión`,
      accionSuperior: <BotonFlecha titulo="Ver mis reportes" alHacerClic={() => alElegirSeccion('reportes')} />,
    },
  ];
}

/**
 * Componente principal: TabResumenPanel
 * ----------------------------------------------------------------------------
 * Renderiza la cabecera, la grilla de estadísticas, el bloque de próximo cierre
 * y el panel de liberaciones de contacto directo post-cierre.
 */
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
  const esAdmin = usuarioActual?.role === 'admin';

  // Segmentación de datos personales vs globales
  const misSubastas = subastas.filter((s) => mismoId(s.sellerId, usuarioActual?.id));
  const misSubastasActivas = misSubastas.filter((s) => s.status === 'activa');
  const misPujas = pujas.filter((p) => mismoId(p.bidderId, usuarioActual?.id));
  const subastasActivas = subastas.filter((s) => s.status === 'activa');
  const subastasAdjudicadas = subastas.filter((s) => s.status === 'finalizada' && s.winnerId);
  const reportesAbiertos = reportes.filter((r) => r.status === 'en_revision');

  // Solo mostramos contactos liberados (RN05) en operaciones propias del usuario actual
  const misCierres = subastasAdjudicadas.filter(
    (s) => mismoId(s.winnerId, usuarioActual?.id) || mismoId(s.sellerId, usuarioActual?.id)
  );

  // Subasta más próxima a cerrar para alimentar el reloj regresivo destacado
  const fuenteProximo = !esAdmin && misSubastasActivas.length > 0 ? misSubastasActivas : subastasActivas;
  const subastaProximaACerrar =
    [...fuenteProximo].sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())[0] ||
    null;
  const cuentaRegresiva = subastaProximaACerrar
    ? calcularTiempoRestante(subastaProximaACerrar.endTime, ahoraMs).textoFormateado
    : '00:00:00';

  // Lista de publicaciones recientes filtrada por el buscador
  const listaRecientes = (esAdmin ? subastas : misSubastas)
    .filter((s) => coincideConBusqueda([s.title, s.category], textoBusqueda))
    .slice(0, 5);

  // Cierres adjudicados filtrados por búsqueda
  const cierresFiltrados = misCierres.filter((cierre) => {
    const vendedor = buscarPorId(usuarios, cierre.sellerId);
    const ganador = buscarPorId(usuarios, cierre.winnerId);
    return coincideConBusqueda(
      [cierre.title, vendedor?.name || cierre.sellerName, ganador?.name || cierre.winnerName],
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
        subtitulo={esAdmin ? 'Supervisa subastas globales, tickets RN06 y cuentas.' : 'Controla tus subastas publicadas, pujas y cierres adjudicados.'}
        botonPrincipal={
          <BotonPanel icono={<Plus className="w-3.5 h-3.5" />} alHacerClic={() => alElegirSeccion('subastas', { abrirFormulario: true })}>
            Publicar Subasta
          </BotonPanel>
        }
      />

      {/* Grilla superior de 4 tarjetas estadísticas */}
      <GridEstadisticasPanel tarjetas={tarjetasResumen} />

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
