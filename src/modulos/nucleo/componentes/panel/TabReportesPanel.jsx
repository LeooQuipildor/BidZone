import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usarTiendaReportes } from '../../../reportes/estado/tiendaReportes';
import { FormularioReporte } from '../../../reportes/componentes/FormularioReporte';
import { PanelResolucionTicket } from '../../../reportes/componentes/PanelResolucionTicket';
import { buscarPorId, coincideConBusqueda, mismoId } from '../../utilidades/ayudas';
import { AvisoPanel, BotonPanel, CabeceraSeccionPanel, ContenedorFormularioPanel, EstadoVacioPanel } from './PanelCompartido';
import { FiltrosBotones } from '../../diseno/componentesBloques';
import { TarjetaReportePanel } from './TarjetaReportePanel';

const FILTROS_ESTADO_TICKET = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'en_revision', etiqueta: 'Abiertos' },
  { valor: 'resuelto_sancion', etiqueta: 'Con Sanción' },
  { valor: 'desestimado', etiqueta: 'Solucionados' },
];

// Pestaña de reportes tipo Ticket RN06: el Socio abre tickets; el Admin los atiende y resuelve inline
export function TabReportesPanel({ usuarioActual, usuarios, subastas, reportes, textoBusqueda, datosIniciales }) {
  const crearReporte = usarTiendaReportes((estado) => estado.crearReporte);
  const actualizarReporte = usarTiendaReportes((estado) => estado.actualizarReporte);
  const eliminarReporte = usarTiendaReportes((estado) => estado.eliminarReporte);

  const esAdmin = usuarioActual?.role === 'admin';
  const otrosUsuarios = usuarios.filter((usuario) => !mismoId(usuario.id, usuarioActual?.id));
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(Boolean(datosIniciales?.abrirFormulario));
  const [idReporteEditando, setIdReporteEditando] = useState(null);
  const [idTicketAtendiendo, setIdTicketAtendiendo] = useState(null);

  const reporteEditando = idReporteEditando ? buscarPorId(reportes, idReporteEditando) : null;
  const cantidadAbiertos = reportes.filter((item) => item.status === 'en_revision').length;

  const reportesFiltrados = reportes.filter((reporte) => {
    if (filtroEstado !== 'todos' && reporte.status !== filtroEstado) return false;
    const denunciado = buscarPorId(usuarios, reporte.reportedUserId);
    const subasta = buscarPorId(subastas, reporte.auctionId);
    return coincideConBusqueda(
      [`#${reporte.id}`, reporte.reason, reporte.description, denunciado?.name || reporte.reportedUserName, subasta?.title || reporte.auctionTitle],
      textoBusqueda
    );
  });

  function cerrarFormulario() {
    setFormularioAbierto(false);
    setIdReporteEditando(null);
  }

  function manejarGuardadoReclamo(reporteGuardado) {
    setAviso({
      tipo: 'exito',
      texto: reporteEditando ? `Ticket #${reporteEditando.id} actualizado.` : `Ticket #${reporteGuardado.id} abierto para revisión RN06.`,
    });
    cerrarFormulario();
  }

  function manejarTicketResuelto(reporteResuelto) {
    setAviso({ tipo: 'exito', texto: `Ticket #${reporteResuelto.id} actualizado: ${reporteResuelto.sanctionApplied}.` });
    setIdTicketAtendiendo(null);
  }

  async function manejarEliminacion(reporte) {
    if (!window.confirm(`¿Confirmas eliminar el Ticket #${reporte.id}?`)) return;
    try {
      await eliminarReporte(reporte.id);
      if (mismoId(idTicketAtendiendo, reporte.id)) setIdTicketAtendiendo(null);
      setAviso({ tipo: 'exito', texto: `Ticket #${reporte.id} eliminado.` });
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    }
  }

  const subtituloPanel = esAdmin
    ? `Mesa de mediación RN06 (${cantidadAbiertos} tickets abiertos · ${reportes.length} totales).`
    : `Tus tickets de mediación RN06 (${cantidadAbiertos} abiertos · ${reportes.length} totales).`;

  return (
    <div className="space-y-5">
      <CabeceraSeccionPanel
        titulo={esAdmin ? 'Tickets y Reportes' : 'Mis Reportes'}
        subtitulo={subtituloPanel}
        botonPrincipal={
          <BotonPanel
            icono={<Plus className="w-3.5 h-3.5" />}
            alHacerClic={() => { setIdReporteEditando(null); setIdTicketAtendiendo(null); setFormularioAbierto(true); setAviso(null); }}
          >
            Informar Incumplimiento
          </BotonPanel>
        }
      />

      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {formularioAbierto && (
        <ContenedorFormularioPanel
          titulo={reporteEditando ? `Editar Ticket #${reporteEditando.id}` : 'Abrir Nuevo Ticket de Reporte'}
          alCerrar={cerrarFormulario}
        >
          <FormularioReporte
            key={reporteEditando ? reporteEditando.id : 'nuevo-reporte'}
            reporte={reporteEditando}
            subastas={subastas}
            otrosUsuarios={otrosUsuarios}
            idSubastaInicial={datosIniciales?.idSubasta || ''}
            idUsuarioReportadoInicial={datosIniciales?.idUsuarioReportado || ''}
            alCrearReporte={crearReporte}
            alActualizarReporte={actualizarReporte}
            alGuardar={manejarGuardadoReclamo}
            alCancelar={cerrarFormulario}
          />
        </ContenedorFormularioPanel>
      )}

      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 shadow-2xs">
        <FiltrosBotones opciones={FILTROS_ESTADO_TICKET} valorActual={filtroEstado} alElegir={setFiltroEstado} />
      </div>

      {reportesFiltrados.length === 0 ? (
        <EstadoVacioPanel mensaje="No hay tickets para mostrar con los filtros actuales." />
      ) : (
        <div className="space-y-4">
          {reportesFiltrados.map((reporte) => {
            const subasta = buscarPorId(subastas, reporte.auctionId);
            const denunciante = buscarPorId(usuarios, reporte.reporterId);
            const denunciado = buscarPorId(usuarios, reporte.reportedUserId);
            const nombreDenunciado = denunciado?.name || reporte.reportedUserName || 'Usuario';
            const estaAtendiendo = esAdmin && mismoId(idTicketAtendiendo, reporte.id);

            return (
              <TarjetaReportePanel
                key={reporte.id}
                reporte={reporte}
                tituloSubasta={subasta?.title || reporte.auctionTitle || `Subasta #${reporte.auctionId}`}
                nombreDenunciante={denunciante?.name || reporte.reporterName || 'Usuario'}
                nombreDenunciado={nombreDenunciado}
                estadoDenunciado={denunciado?.status}
                puedeEditarReclamo={mismoId(usuarioActual?.id, reporte.reporterId) && reporte.status === 'en_revision'}
                esAdmin={esAdmin}
                estaAtendiendo={estaAtendiendo}
                alAtenderTicket={() => { cerrarFormulario(); setIdTicketAtendiendo(estaAtendiendo ? null : reporte.id); setAviso(null); }}
                alEditarReclamo={() => { setIdReporteEditando(reporte.id); setFormularioAbierto(true); setAviso(null); }}
                alEliminar={() => manejarEliminacion(reporte)}
                panelResolucion={
                  estaAtendiendo && (
                    <PanelResolucionTicket
                      key={reporte.id}
                      reporte={reporte}
                      nombreDenunciado={nombreDenunciado}
                      estadoDenunciado={denunciado?.status}
                      alActualizarReporte={actualizarReporte}
                      alGuardar={manejarTicketResuelto}
                      alCancelar={() => setIdTicketAtendiendo(null)}
                    />
                  )
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
