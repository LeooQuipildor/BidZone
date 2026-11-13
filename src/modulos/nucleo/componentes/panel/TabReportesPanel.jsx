/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/TabReportesPanel.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE COMPONENTE?
 * Es la pestaña de gestión de Tickets de Mediación y Reportes de Incumplimiento
 * del Panel de Control, implementando la interfaz para la Regla de Negocio RN06:
 * "Mesa de Ayuda, Disputas y Sanciones Disciplinarias".
 *
 * ¿POR QUÉ EXISTE Y CUÁL ES SU PROPÓSITO?
 * En una plataforma de subastas descentralizada en el pago (trato directo RN05),
 * pueden suscitarse irregularidades: un comprador ganador que desaparece sin pagar,
 * un vendedor que entrega un lote defectuoso, o posturas fraudulentas.
 *
 * Esta vista permite:
 * 1. Para los Socios:
 *    - Abrir un nuevo ticket de reporte detallando la causa, descripción y enlace a evidencia externa.
 *    - Si acceden desde un cierre adjudicado (`datosIniciales`), los campos de subasta y usuario
 *      acusado se precargan automáticamente.
 *    - Monitorear el progreso de su reclamo ('en_revision', 'resuelto_sancion', 'desestimado').
 * 2. Para los Administradores:
 *    - Auditar todos los tickets registrados en la plataforma.
 *    - Atender e interactuar con el caso en tiempo real abriendo el `PanelResolucionTicket`.
 *    - Dictaminar la resolución: aplicar apercibimientos, suspender temporalmente al usuario infractor,
 *      cerrar su cuenta de forma definitiva o desestimar el reclamo si carece de mérito.
 *    - Eliminar tickets antiguos o resueltos.
 *
 * ¿DE DÓNDE PROVIENEN LAS PROPS?
 * - `usuarioActual`: Sesión activa de `tiendaAutenticacion.js`.
 * - `usuarios`: Lista general de usuarios de `tiendaAutenticacion.js`.
 * - `subastas`: Catálogo de subastas de `tiendaSubastas.js`.
 * - `reportes`: Array de tickets de `tiendaReportes.js`.
 * - `textoBusqueda`: Filtro textual de la barra de búsqueda del Header.
 * - `datosIniciales`: Parámetros opcionales para preabrir el formulario (`abrirFormulario`, `idSubasta`, `idUsuarioReportado`).
 * ==============================================================================
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usarTiendaReportes } from '../../../reportes/estado/tiendaReportes';
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

/** Opciones de filtrado para los botones de estado del ticket */
const FILTROS_ESTADO_TICKET = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'en_revision', etiqueta: 'Abiertos' },
  { valor: 'resuelto_sancion', etiqueta: 'Con Sanción' },
  { valor: 'desestimado', etiqueta: 'Solucionados' },
];

/**
 * Componente principal: TabReportesPanel
 * ----------------------------------------------------------------------------
 * Gestiona la visualización, apertura, edición y mediación administrativa de tickets RN06.
 */
export function TabReportesPanel({
  usuarioActual,
  usuarios,
  subastas,
  reportes,
  textoBusqueda,
  datosIniciales,
}) {
  // Acciones asíncronas de la tienda de Zustand `tiendaReportes.js`
  const crearReporte = usarTiendaReportes((estado) => estado.crearReporte);
  const actualizarReporte = usarTiendaReportes((estado) => estado.actualizarReporte);
  const eliminarReporte = usarTiendaReportes((estado) => estado.eliminarReporte);

  const esAdmin = usuarioActual?.role === 'admin';
  const otrosUsuarios = usuarios.filter((usuario) => !mismoId(usuario.id, usuarioActual?.id));

  // Estados locales para filtros, alertas y control de modales
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(Boolean(datosIniciales?.abrirFormulario));
  const [idReporteEditando, setIdReporteEditando] = useState(null);
  const [idTicketAtendiendo, setIdTicketAtendiendo] = useState(null);

  const reporteEditando = idReporteEditando ? buscarPorId(reportes, idReporteEditando) : null;
  const cantidadAbiertos = reportes.filter((item) => item.status === 'en_revision').length;

  // Filtrado de reportes según el estado del ticket y el término de búsqueda ingresado
  const reportesFiltrados = reportes.filter((reporte) => {
    if (filtroEstado !== 'todos' && reporte.status !== filtroEstado) return false;
    const denunciado = buscarPorId(usuarios, reporte.reportedUserId);
    const subasta = buscarPorId(subastas, reporte.auctionId);
    return coincideConBusqueda(
      [
        `#${reporte.id}`,
        reporte.reason,
        reporte.description,
        denunciado?.name || reporte.reportedUserName,
        subasta?.title || reporte.auctionTitle,
      ],
      textoBusqueda
    );
  });

  /** Cierra el formulario de alta/edición y limpia el estado de edición */
  function cerrarFormulario() {
    setFormularioAbierto(false);
    setIdReporteEditando(null);
  }

  /** Callback al guardar un reclamo nuevo o modificado */
  function manejarGuardadoReclamo(reporteGuardado) {
    setAviso({
      tipo: 'exito',
      texto: reporteEditando
        ? `Ticket #${reporteEditando.id} actualizado.`
        : `Ticket #${reporteGuardado.id} abierto para revisión RN06.`,
    });
    cerrarFormulario();
  }

  /** Callback cuando un administrador resuelve el ticket */
  function manejarTicketResuelto(reporteResuelto) {
    setAviso({
      tipo: 'exito',
      texto: `Ticket #${reporteResuelto.id} actualizado: ${reporteResuelto.sanctionApplied}.`,
    });
    setIdTicketAtendiendo(null);
  }

  /** Borra un ticket de soporte previa confirmación */
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
