import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { usarTiendaSubastas } from '../../../subastas/estado/tiendaSubastas';
import { usarTiendaNotificaciones } from '../../../notificaciones/estado/tiendaNotificaciones';
import { FormularioSubasta } from '../../../subastas/componentes/FormularioSubasta';
import { PanelSolicitudCorreccion } from '../../../subastas/componentes/PanelSolicitudCorreccion';
import { buscarPorId, mismoId } from '../../utilidades/ayudas';
import { OPCIONES_ESTADO_SALA, OPCIONES_ORDEN_SUBASTA } from '../../utilidades/formatos';
import { CATEGORIAS_PANEL, filtrarYOrdenarSubastas } from './ayudasPanel';
import { AvisoPanel, BotonPanel, CabeceraSeccionPanel, ContenedorFormularioPanel, EstadoVacioPanel } from './PanelCompartido';
import { FiltrosBotones } from '../../diseno/componentesBloques';
import { TarjetaSubastaPanel } from './TarjetaSubastaPanel';

const VISTAS_SUBASTA_ADMIN = [
  { valor: 'todas', etiqueta: 'Todas (Moderación)' },
  { valor: 'mias', etiqueta: 'Mis Subastas' },
];

// Pestaña de subastas: separa Moderación y Mis Subastas en Admin; en ajenas solicita corrección o elimina
export function TabSubastasPanel({ usuarioActual, usuarios, subastas, pujas, textoBusqueda, ahoraMs, datosIniciales }) {
  const navegar = useNavigate();
  const crearSubasta = usarTiendaSubastas((estado) => estado.crearSubasta);
  const actualizarSubasta = usarTiendaSubastas((estado) => estado.actualizarSubasta);
  const cerrarSubastaAhora = usarTiendaSubastas((estado) => estado.cerrarSubastaAhora);
  const eliminarSubasta = usarTiendaSubastas((estado) => estado.eliminarSubasta);
  const enviarNotificacion = usarTiendaNotificaciones((estado) => estado.enviarNotificacion);

  const esAdmin = usuarioActual?.role === 'admin';
  const [vistaAdmin, setVistaAdmin] = useState('todas');
  const [categoria, setCategoria] = useState('Todas');
  const [filtroEstado, setFiltroEstado] = useState(datosIniciales?.estado || 'todas');
  const [ordenarPor, setOrdenarPor] = useState('proximasACerrar');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(Boolean(datosIniciales?.abrirFormulario));
  const [idSubastaEditando, setIdSubastaEditando] = useState(null);
  const [idSubastaCorrigiendo, setIdSubastaCorrigiendo] = useState(null);

  const misSubastas = subastas.filter((s) => mismoId(s.sellerId, usuarioActual?.id));
  const subastasVisibles = esAdmin && vistaAdmin === 'todas' ? subastas : misSubastas;
  const subastasFiltradas = filtrarYOrdenarSubastas(subastasVisibles, textoBusqueda, categoria, filtroEstado, ordenarPor);
  const subastaEditando = idSubastaEditando ? buscarPorId(subastas, idSubastaEditando) : null;
  const subastaACorregir = idSubastaCorrigiendo ? buscarPorId(subastas, idSubastaCorrigiendo) : null;
  const subastaEditandoTienePujas = Boolean(
    subastaEditando && (Number(subastaEditando.bidCount ?? 0) > 0 || pujas.some((p) => mismoId(p.auctionId, subastaEditando.id)))
  );

  function cerrarPaneles() {
    setFormularioAbierto(false);
    setIdSubastaEditando(null);
    setIdSubastaCorrigiendo(null);
  }

  async function guardarFormulario(datosEnvio) {
    if (subastaEditando) {
      await actualizarSubasta(subastaEditando.id, datosEnvio);
      setAviso({ tipo: 'exito', texto: `Subasta #${subastaEditando.id} actualizada.` });
    } else {
      const creada = await crearSubasta(datosEnvio);
      setAviso({ tipo: 'exito', texto: `Subasta "${creada.title}" publicada correctamente.` });
    }
    cerrarPaneles();
  }

  async function manejarEnvioCorreccion(datosAviso) {
    await enviarNotificacion(datosAviso);
    const vendedor = buscarPorId(usuarios, datosAviso.idUsuario);
    setAviso({
      tipo: 'exito',
      texto: `Solicitud de corrección enviada a ${vendedor?.name || 'vendedor'}.`,
    });
    setIdSubastaCorrigiendo(null);
  }

  async function manejarCierreInmediato(subasta) {
    if (!window.confirm(`¿Confirmas finalizar y adjudicar ahora "${subasta.title}"?`)) return;
    try {
      await cerrarSubastaAhora(subasta.id);
      setAviso({ tipo: 'exito', texto: `Subasta "${subasta.title}" finalizada y adjudicada.` });
      cerrarPaneles();
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    }
  }

  async function manejarEliminacion(subasta) {
    if (!window.confirm(`¿Confirmas eliminar la subasta "${subasta.title}"?`)) return;
    try {
      await eliminarSubasta(subasta.id);
      setAviso({ tipo: 'exito', texto: `Subasta "${subasta.title}" eliminada.` });
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    }
  }

  const tituloPanel = esAdmin && vistaAdmin === 'todas' ? 'Subastas de la Plataforma' : 'Mis Subastas';
  const subtituloPanel =
    esAdmin && vistaAdmin === 'todas'
      ? `Moderación global (${subastas.length} lotes). Edita los tuyos o solicita correcciones al vendedor en lotes ajenos.`
      : `Administra tus publicaciones (${misSubastas.length} creadas con tu cuenta).`;
  const mensajeVacio =
    (!esAdmin || vistaAdmin === 'mias') && misSubastas.length === 0
      ? 'Todavía no publicaste subastas. Toca "Publicar Subasta" para crear tu primer lote.'
      : 'No hay subastas que coincidan con los filtros actuales.';

  return (
    <div className="space-y-5">
      <CabeceraSeccionPanel
        titulo={tituloPanel}
        subtitulo={subtituloPanel}
        botonPrincipal={
          <BotonPanel icono={<Plus className="w-3.5 h-3.5" />} alHacerClic={() => { cerrarPaneles(); setFormularioAbierto(true); setAviso(null); }}>
            Publicar Subasta
          </BotonPanel>
        }
      />

      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {formularioAbierto && (
        <ContenedorFormularioPanel titulo={subastaEditando ? `Editar Mi Subasta #${subastaEditando.id}` : 'Publicar Nueva Subasta'} alCerrar={cerrarPaneles}>
          <FormularioSubasta
            key={subastaEditando ? `${subastaEditando.id}-${subastaEditando.updatedAt || subastaEditando.endTime}` : 'nueva-subasta'}
            subasta={subastaEditando}
            tienePujas={subastaEditandoTienePujas}
            esAdmin={esAdmin}
            alEnviarFormulario={guardarFormulario}
            alCerrarAhora={subastaEditando ? () => manejarCierreInmediato(subastaEditando) : null}
            alCancelar={cerrarPaneles}
          />
        </ContenedorFormularioPanel>
      )}

      {subastaACorregir && (
        <ContenedorFormularioPanel titulo={`Solicitar corrección · Lote #${subastaACorregir.id}`} alCerrar={() => setIdSubastaCorrigiendo(null)}>
          <PanelSolicitudCorreccion
            key={subastaACorregir.id}
            subasta={subastaACorregir}
            nombreVendedor={buscarPorId(usuarios, subastaACorregir.sellerId)?.name || subastaACorregir.sellerName || 'Vendedor'}
            alEnviarAviso={manejarEnvioCorreccion}
            alCancelar={() => setIdSubastaCorrigiendo(null)}
          />
        </ContenedorFormularioPanel>
      )}

      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 space-y-3 shadow-2xs">
        {esAdmin && (
          <FiltrosBotones opciones={VISTAS_SUBASTA_ADMIN} valorActual={vistaAdmin} alElegir={setVistaAdmin} />
        )}
        <FiltrosBotones opciones={CATEGORIAS_PANEL} valorActual={categoria} alElegir={setCategoria} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none">
            {OPCIONES_ESTADO_SALA.map((op) => <option key={op.valor} value={op.valor}>Estado: {op.etiqueta}</option>)}
          </select>
          <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)} className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none">
            {OPCIONES_ORDEN_SUBASTA.map((op) => <option key={op.valor} value={op.valor}>Orden: {op.etiqueta}</option>)}
          </select>
        </div>
      </div>

      {subastasFiltradas.length === 0 ? (
        <EstadoVacioPanel mensaje={mensajeVacio} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {subastasFiltradas.map((subasta) => {
            const conteoLocal = pujas.filter((p) => mismoId(p.auctionId, subasta.id)).length;
            return (
              <TarjetaSubastaPanel
                key={subasta.id}
                subasta={subasta}
                vendedor={buscarPorId(usuarios, subasta.sellerId)}
                cantidadPujas={Number(subasta.bidCount ?? conteoLocal)}
                ahoraMs={ahoraMs}
                esPropia={mismoId(usuarioActual?.id, subasta.sellerId)}
                esAdmin={esAdmin}
                alEditar={(s) => { cerrarPaneles(); setIdSubastaEditando(s.id); setFormularioAbierto(true); setAviso(null); }}
                alSolicitarCorreccion={(s) => { cerrarPaneles(); setIdSubastaCorrigiendo(s.id); setAviso(null); }}
                alEliminar={manejarEliminacion}
                alAbrirDetalle={(id) => navegar(`/auctions/${id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
