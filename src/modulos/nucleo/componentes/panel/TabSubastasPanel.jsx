import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Gavel, Plus } from 'lucide-react';
import { usarTiendaSubastas } from '../../../subastas/estado/tiendaSubastas';
import { FormularioSubasta } from '../../../subastas/componentes/FormularioSubasta';
import { buscarPorId, mismoId } from '../../utilidades/ayudas';
import {
  OPCIONES_ESTADO_SALA,
  OPCIONES_ORDEN_SUBASTA,
} from '../../utilidades/formatos';
import { CATEGORIAS_PANEL, filtrarYOrdenarSubastas } from './ayudasPanel';
import {
  AvisoPanel,
  BotonPanel,
  CabeceraSeccionPanel,
  ContenedorFormularioPanel,
  EstadoVacioPanel,
  GridEstadisticasPanel,
} from './PanelCompartido';
import { FiltrosBotones } from '../../diseno/componentesBloques';
import { TarjetaSubastaPanel } from './TarjetaSubastaPanel';

export function TabSubastasPanel({
  usuarioActual,
  usuarios,
  subastas,
  pujas,
  textoBusqueda,
  ahoraMs,
  datosIniciales,
}) {
  const navegar = useNavigate();
  const crearSubasta = usarTiendaSubastas((estado) => estado.crearSubasta);
  const actualizarSubasta = usarTiendaSubastas((estado) => estado.actualizarSubasta);
  const cerrarSubastaAhora = usarTiendaSubastas((estado) => estado.cerrarSubastaAhora);
  const eliminarSubasta = usarTiendaSubastas((estado) => estado.eliminarSubasta);

  const esAdmin = usuarioActual?.role === 'admin';
  const [categoria, setCategoria] = useState('Todas');
  const [filtroEstado, setFiltroEstado] = useState(datosIniciales?.estado || 'todas');
  const [ordenarPor, setOrdenarPor] = useState('proximasACerrar');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(Boolean(datosIniciales?.abrirFormulario));
  const [idSubastaEditando, setIdSubastaEditando] = useState(null);

  const subastasActivas = subastas.filter((subasta) => subasta.status === 'activa');
  const subastasAdjudicadas = subastas.filter((subasta) => subasta.status === 'finalizada' && subasta.winnerId);
  const misSubastas = subastas.filter((subasta) => mismoId(subasta.sellerId, usuarioActual?.id));
  const subastasFiltradas = filtrarYOrdenarSubastas(subastas, textoBusqueda, categoria, filtroEstado, ordenarPor);

  const subastaEditando = idSubastaEditando ? buscarPorId(subastas, idSubastaEditando) : null;
  const subastaEditandoTienePujas = Boolean(
    subastaEditando &&
      (Number(subastaEditando.bidCount ?? 0) > 0 || pujas.some((puja) => mismoId(puja.auctionId, subastaEditando.id)))
  );

  function cerrarFormulario() {
    setFormularioAbierto(false);
    setIdSubastaEditando(null);
  }

  async function guardarFormulario(datosEnvio) {
    if (subastaEditando) {
      await actualizarSubasta(subastaEditando.id, datosEnvio);
      setAviso({ tipo: 'exito', texto: `Subasta #${subastaEditando.id} actualizada correctamente.` });
    } else {
      const creada = await crearSubasta(datosEnvio);
      setAviso({ tipo: 'exito', texto: `Subasta "${creada.title}" publicada en el panel sin salir de la vista.` });
    }
    cerrarFormulario();
  }

  async function manejarCierreInmediato(subasta) {
    const mensajeConfirmacion = `¿Confirmas cerrar y adjudicar ahora la subasta "${subasta.title}"? Si hay postores se adjudicará al mejor postor (RN05).`;
    if (!window.confirm(mensajeConfirmacion)) return;
    try {
      await cerrarSubastaAhora(subasta.id);
      setAviso({ tipo: 'exito', texto: `Subasta "${subasta.title}" finalizada y adjudicada.` });
      cerrarFormulario();
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    }
  }

  async function manejarEliminacion(subasta) {
    if (!window.confirm(`¿Confirmas eliminar la subasta "${subasta.title}"?`)) return;
    try {
      await eliminarSubasta(subasta.id);
      setAviso({ tipo: 'exito', texto: `Subasta "${subasta.title}" eliminada exitosamente.` });
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    }
  }

  const tarjetasResumen = [
    { destacada: true, titulo: 'Total Publicadas', icono: <Gavel className="w-3.5 h-3.5" />, valor: subastas.length, subtitulo: `${subastasFiltradas.length} visibles` },
    { titulo: 'Salas en Vivo', valor: subastasActivas.length, subtitulo: 'Abiertas a pujas RN01', claseSubtitulo: 'text-[#224F10] font-semibold' },
    { titulo: 'Adjudicadas', valor: subastasAdjudicadas.length, subtitulo: 'Cierre con trato directo RN05' },
    { titulo: 'Mis Publicaciones', valor: misSubastas.length, subtitulo: 'Creadas con tu cuenta' },
  ];

  return (
    <div className="space-y-6">
      <CabeceraSeccionPanel
        titulo="Subastas y Lotes"
        subtitulo="Explora salas en vivo, publica nuevos artículos y administra tus publicaciones."
        botonPrincipal={
          <div className="flex flex-wrap items-center gap-2.5">
            <BotonPanel
              icono={<Plus className="w-3.5 h-3.5" />}
              alHacerClic={() => { setIdSubastaEditando(null); setFormularioAbierto(true); setAviso(null); }}
            >
              Publicar Subasta
            </BotonPanel>
            <BotonPanel variante="secundario" alHacerClic={() => navegar('/auctions')}>
              <span className="inline-flex items-center gap-1.5">
                Vista Catálogo
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </BotonPanel>
          </div>
        }
      />

      <GridEstadisticasPanel tarjetas={tarjetasResumen} />

      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {formularioAbierto && (
        <ContenedorFormularioPanel
          titulo={subastaEditando ? `Editar Subasta #${subastaEditando.id}` : 'Publicar Nueva Subasta'}
          alCerrar={cerrarFormulario}
        >
          <FormularioSubasta
            key={subastaEditando ? `${subastaEditando.id}-${subastaEditando.updatedAt || subastaEditando.endTime}` : 'nueva-subasta'}
            subasta={subastaEditando}
            tienePujas={subastaEditandoTienePujas}
            esAdmin={esAdmin}
            alEnviarFormulario={guardarFormulario}
            alCerrarAhora={subastaEditando ? () => manejarCierreInmediato(subastaEditando) : null}
            alCancelar={cerrarFormulario}
          />
        </ContenedorFormularioPanel>
      )}

      {/* Filtros de categoría, estado y ordenamiento */}
      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 space-y-3 shadow-2xs">
        <FiltrosBotones opciones={CATEGORIAS_PANEL} valorActual={categoria} alElegir={setCategoria} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <select
            value={filtroEstado}
            onChange={(evento) => setFiltroEstado(evento.target.value)}
            className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none"
          >
            {OPCIONES_ESTADO_SALA.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>Estado: {opcion.etiqueta}</option>
            ))}
          </select>

          <select
            value={ordenarPor}
            onChange={(evento) => setOrdenarPor(evento.target.value)}
            className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none"
          >
            {OPCIONES_ORDEN_SUBASTA.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>Orden: {opcion.etiqueta}</option>
            ))}
          </select>
        </div>
      </div>

      {subastasFiltradas.length === 0 ? (
        <EstadoVacioPanel mensaje="No hay subastas que coincidan con la búsqueda actual." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {subastasFiltradas.map((subasta) => {
            const conteoLocal = pujas.filter((puja) => mismoId(puja.auctionId, subasta.id)).length;
            return (
              <TarjetaSubastaPanel
                key={subasta.id}
                subasta={subasta}
                vendedor={buscarPorId(usuarios, subasta.sellerId)}
                cantidadPujas={Number(subasta.bidCount ?? conteoLocal)}
                ahoraMs={ahoraMs}
                puedeAdministrar={esAdmin || mismoId(usuarioActual?.id, subasta.sellerId)}
                alEditar={(seleccionada) => { setIdSubastaEditando(seleccionada.id); setFormularioAbierto(true); setAviso(null); }}
                alEliminar={manejarEliminacion}
                alAbrirDetalle={(idSubasta) => navegar(`/auctions/${idSubasta}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
