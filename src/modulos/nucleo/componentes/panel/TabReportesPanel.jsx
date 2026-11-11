import React, { useState } from 'react';
import { AlertOctagon, Plus } from 'lucide-react';
import { usarTiendaReportes } from '../../../reportes/estado/tiendaReportes';
import { FormularioReporte } from '../../../reportes/componentes/FormularioReporte';
import { buscarPorId, coincideConBusqueda, mismoId } from '../../utilidades/ayudas';
import {
  AvisoPanel,
  BotonPanel,
  CabeceraSeccionPanel,
  ContenedorFormularioPanel,
  EstadoVacioPanel,
  GridEstadisticasPanel,
} from './PanelCompartido';
import { FiltrosBotones } from '../../diseno/componentesBloques';
import { TarjetaReportePanel } from './TarjetaReportePanel';

const FILTROS_ESTADO_REPORTE = [
  { valor: 'todos', etiqueta: 'Todos los expedientes' },
  { valor: 'en_revision', etiqueta: 'En Revisión' },
  { valor: 'resuelto_sancion', etiqueta: 'Con Sanción RN06' },
  { valor: 'desestimado', etiqueta: 'Solucionados' },
];

export function TabReportesPanel({
  usuarioActual,
  usuarios,
  subastas,
  reportes,
  textoBusqueda,
  datosIniciales,
}) {
  const crearReporte = usarTiendaReportes((estado) => estado.crearReporte);
  const actualizarReporte = usarTiendaReportes((estado) => estado.actualizarReporte);
  const eliminarReporte = usarTiendaReportes((estado) => estado.eliminarReporte);

  const esAdmin = usuarioActual?.role === 'admin';
  const otrosUsuarios = usuarios.filter((usuario) => !mismoId(usuario.id, usuarioActual?.id));

  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(Boolean(datosIniciales?.abrirFormulario));
  const [idReporteEditando, setIdReporteEditando] = useState(null);

  const reporteEditando = idReporteEditando ? buscarPorId(reportes, idReporteEditando) : null;
  const cantidadAbiertos = reportes.filter((item) => item.status === 'en_revision').length;
  const cantidadSancionados = reportes.filter((item) => item.status === 'resuelto_sancion').length;
  const cantidadSolucionados = reportes.filter((item) => item.status === 'desestimado').length;

  const reportesFiltrados = reportes.filter((reporte) => {
    if (filtroEstado !== 'todos' && reporte.status !== filtroEstado) return false;
    const denunciado = buscarPorId(usuarios, reporte.reportedUserId);
    const subasta = buscarPorId(subastas, reporte.auctionId);
    return coincideConBusqueda(
      [
        reporte.reason,
        reporte.description,
        denunciado?.name || reporte.reportedUserName,
        subasta?.title || reporte.auctionTitle,
      ],
      textoBusqueda
    );
  });

  function cerrarFormulario() {
    setFormularioAbierto(false);
    setIdReporteEditando(null);
  }

  function manejarGuardado(reporteGuardado) {
    setAviso({
      tipo: 'exito',
      texto: reporteEditando
        ? `Expediente #${reporteEditando.id} actualizado.`
        : `Expediente #${reporteGuardado.id} radicado para mediación RN06.`,
    });
    cerrarFormulario();
  }

  async function manejarEliminacion(reporte) {
    if (!window.confirm(`¿Confirmas eliminar el expediente de reporte #${reporte.id}?`)) return;
    try {
      await eliminarReporte(reporte.id);
      setAviso({ tipo: 'exito', texto: `Expediente #${reporte.id} eliminado.` });
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    }
  }

  const tarjetasResumen = [
    { destacada: true, titulo: 'Total Expedientes', icono: <AlertOctagon className="w-3.5 h-3.5" />, valor: reportes.length, subtitulo: 'Historial disciplinario RN06' },
    { titulo: 'En Revisión', valor: cantidadAbiertos, subtitulo: 'Pendientes de resolución', claseSubtitulo: 'text-[#224F10] font-semibold' },
    { titulo: 'Con Sanción', valor: cantidadSancionados, subtitulo: 'Suspensión o cierre aplicado', claseSubtitulo: 'text-red-700 font-semibold' },
    { titulo: 'Solucionados', valor: cantidadSolucionados, subtitulo: 'Acuerdo entre las partes' },
  ];

  return (
    <div className="space-y-6">
      <CabeceraSeccionPanel
        titulo="Reportes e Infracciones"
        subtitulo="Mediación ante incumplimientos de pago o entrega y control disciplinario (RN06)."
        botonPrincipal={
          <BotonPanel
            icono={<Plus className="w-3.5 h-3.5" />}
            alHacerClic={() => { setIdReporteEditando(null); setFormularioAbierto(true); setAviso(null); }}
          >
            Informar Incumplimiento
          </BotonPanel>
        }
      />

      <GridEstadisticasPanel tarjetas={tarjetasResumen} />

      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {formularioAbierto && (
        <ContenedorFormularioPanel
          titulo={reporteEditando ? `Resolver / Editar Expediente #${reporteEditando.id}` : 'Radicar Denuncia de Incumplimiento'}
          alCerrar={cerrarFormulario}
        >
          <FormularioReporte
            key={reporteEditando ? `${reporteEditando.id}-${reporteEditando.status}` : `nuevo-${datosIniciales?.idSubasta || ''}`}
            reporte={reporteEditando}
            subastas={subastas}
            otrosUsuarios={otrosUsuarios}
            esAdmin={esAdmin}
            idSubastaInicial={datosIniciales?.idSubasta || ''}
            idUsuarioReportadoInicial={datosIniciales?.idUsuarioReportado || ''}
            alCrearReporte={crearReporte}
            alActualizarReporte={actualizarReporte}
            alGuardar={manejarGuardado}
            alCancelar={cerrarFormulario}
          />
        </ContenedorFormularioPanel>
      )}

      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 shadow-2xs">
        <FiltrosBotones opciones={FILTROS_ESTADO_REPORTE} valorActual={filtroEstado} alElegir={setFiltroEstado} />
      </div>

      {reportesFiltrados.length === 0 ? (
        <EstadoVacioPanel mensaje="No hay reportes registrados con los criterios actuales." />
      ) : (
        <div className="space-y-4">
          {reportesFiltrados.map((reporte) => {
            const subasta = buscarPorId(subastas, reporte.auctionId);
            const denunciante = buscarPorId(usuarios, reporte.reporterId);
            const denunciado = buscarPorId(usuarios, reporte.reportedUserId);
            const puedeEditar =
              esAdmin || (mismoId(usuarioActual?.id, reporte.reporterId) && reporte.status === 'en_revision');

            return (
              <TarjetaReportePanel
                key={reporte.id}
                reporte={reporte}
                tituloSubasta={subasta?.title || reporte.auctionTitle || `Subasta #${reporte.auctionId}`}
                nombreDenunciante={denunciante?.name || reporte.reporterName || 'Usuario'}
                nombreDenunciado={denunciado?.name || reporte.reportedUserName || 'Usuario'}
                estadoDenunciado={denunciado?.status}
                puedeEditar={puedeEditar}
                esAdmin={esAdmin}
                alEditar={() => { setIdReporteEditando(reporte.id); setFormularioAbierto(true); setAviso(null); }}
                alEliminar={() => manejarEliminacion(reporte)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
