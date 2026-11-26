import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStoreReports } from '../../../reportes/estado/storeReports';
import { FormularioReporte } from '../../../reportes/componentes/FormularioReporte';
import { PanelResolucionTicket } from '../../../reportes/componentes/PanelResolucionTicket';
import { buscarPorId, coincideConBusqueda, mismoId } from '../../utilidades/ayudas';
import {
  AvisoPanel,
  BotonPanel,
  CabeceraSeccionPanel,
  ContenedorFormularioPanel,
  EstadoVacioPanel,
} from './PanelCompartido';
import { FiltrosBotones } from '../../diseno/componentesBloques';
import { TarjetaReportePanel } from './TarjetaReportePanel';

const FILTROS_ESTADO_TICKET = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'en_revision', etiqueta: 'Abiertos' },
  { valor: 'resuelto_sancion', etiqueta: 'Con Sanción' },
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
  // Acciones asíncronas de la tienda de Zustand `storeReports.js`
  const crearReporte = useStoreReports((estado) => estado.crearReporte);
  const actualizarReporte = useStoreReports((estado) => estado.actualizarReporte);
  const eliminarReporte = useStoreReports((estado) => estado.eliminarReporte);

  const esAdmin = usuarioActual?.rol === 'admin';
  const otrosUsuarios = usuarios.filter((usuario) => !mismoId(usuario.id, usuarioActual?.id));

  // Estados locales para filtros, alertas y control de modales
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(Boolean(datosIniciales?.abrirFormulario));
  const [idReporteEditando, setIdReporteEditando] = useState(null);
  const [idTicketAtendiendo, setIdTicketAtendiendo] = useState(null);

  const reporteEditando = idReporteEditando ? buscarPorId(reportes, idReporteEditando) : null;
  const cantidadAbiertos = reportes.filter((item) => item.estado === 'en_revision').length;

  // Filtrado de reportes según el estado del ticket y el término de búsqueda ingresado
  const reportesFiltrados = reportes.filter((reporte) => {
    if (filtroEstado !== 'todos' && reporte.estado !== filtroEstado) return false;
    const denunciado = buscarPorId(usuarios, reporte.denunciadoId);
    const subasta = buscarPorId(subastas, reporte.subastaId);
    return coincideConBusqueda(
      [
        `#${reporte.id}`,
        reporte.motivo,
        reporte.descripcion,
        denunciado?.nombre || reporte.nombreDenunciado,
        subasta?.titulo || reporte.tituloSubasta,
      ],
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
      texto: reporteEditando
        ? `Ticket #${reporteEditando.id} actualizado.`
        : `Ticket #${reporteGuardado.id} abierto para revisión RN06.`,
    });
    cerrarFormulario();
  }

  function manejarTicketResuelto(reporteResuelto) {
    setAviso({
      tipo: 'exito',
      texto: `Ticket #${reporteResuelto.id} actualizado: ${reporteResuelto.sancionAplicada}.`,
    });
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
      {/* Cabecera con estadísticas de tickets y botón para abrir nuevo reclamo */}
      <CabeceraSeccionPanel
        titulo={esAdmin ? 'Tickets y Reportes' : 'Mis Reportes'}
        subtitulo={subtituloPanel}
        botonPrincipal={
          <BotonPanel
            icono={<Plus className="w-3.5 h-3.5" />}
            alHacerClic={() => {
              setIdReporteEditando(null);
              setIdTicketAtendiendo(null);
              setFormularioAbierto(true);
              setAviso(null);
            }}
          >
            Informar Incumplimiento
          </BotonPanel>
        }
      />

      {/* Banner de alertas y mensajes */}
      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {/* Modal flotante del formulario de reporte */}
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

      {/* Barra de botones de filtro por estado de resolución */}
      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 shadow-2xs">
        <FiltrosBotones opciones={FILTROS_ESTADO_TICKET} valorActual={filtroEstado} alElegir={setFiltroEstado} />
      </div>

      {/* Lista de tarjetas de reporte o estado vacío */}
      {reportesFiltrados.length === 0 ? (
        <EstadoVacioPanel mensaje="No hay tickets para mostrar con los filtros actuales." />
      ) : (
        <div className="space-y-4">
          {reportesFiltrados.map((reporte) => {
            const subasta = buscarPorId(subastas, reporte.subastaId);
            const denunciante = buscarPorId(usuarios, reporte.denuncianteId);
            const denunciado = buscarPorId(usuarios, reporte.denunciadoId);
            const nombreDenunciado = denunciado?.nombre || reporte.nombreDenunciado || 'Usuario';
            const estaAtendiendo = esAdmin && mismoId(idTicketAtendiendo, reporte.id);

            return (
              <TarjetaReportePanel
                key={reporte.id}
                reporte={reporte}
                tituloSubasta={subasta?.titulo || reporte.tituloSubasta || `Subasta #${reporte.subastaId}`}
                nombreDenunciante={denunciante?.nombre || reporte.nombreDenunciante || 'Usuario'}
                nombreDenunciado={nombreDenunciado}
                estadoDenunciado={denunciado?.estado}
                puedeEditarReclamo={mismoId(usuarioActual?.id, reporte.denuncianteId) && reporte.estado === 'en_revision'}
                esAdmin={esAdmin}
                estaAtendiendo={estaAtendiendo}
                alAtenderTicket={() => {
                  cerrarFormulario();
                  setIdTicketAtendiendo(estaAtendiendo ? null : reporte.id);
                  setAviso(null);
                }}
                alEditarReclamo={() => {
                  setIdReporteEditando(reporte.id);
                  setFormularioAbierto(true);
                  setAviso(null);
                }}
                alEliminar={() => manejarEliminacion(reporte)}
                panelResolucion={
                  estaAtendiendo && (
                    <PanelResolucionTicket
                      key={reporte.id}
                      reporte={reporte}
                      nombreDenunciado={nombreDenunciado}
                      estadoDenunciado={denunciado?.estado}
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
