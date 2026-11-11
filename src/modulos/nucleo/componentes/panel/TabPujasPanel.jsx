import React, { useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import { usarTiendaPujas } from '../../../pujas/estado/tiendaPujas';
import { FormularioPuja } from '../../../pujas/componentes/FormularioPuja';
import { formatearMoneda } from '../../utilidades/formatos';
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
import { FilaPujaPanel } from './FilaPujaPanel';

const OPCIONES_ALCANCE = [
  { valor: 'todas', etiqueta: 'Todas las ofertas' },
  { valor: 'mias', etiqueta: 'Solo mis pujas' },
];

export function TabPujasPanel({ usuarioActual, usuarios, subastas, pujas, textoBusqueda }) {
  const crearPuja = usarTiendaPujas((estado) => estado.crearPuja);
  const actualizarPuja = usarTiendaPujas((estado) => estado.actualizarPuja);
  const eliminarPuja = usarTiendaPujas((estado) => estado.eliminarPuja);

  const esAdmin = usuarioActual?.role === 'admin';
  const [filtroAlcance, setFiltroAlcance] = useState('todas');
  const [filtroSubasta, setFiltroSubasta] = useState('todas');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [idPujaEditando, setIdPujaEditando] = useState(null);

  const pujaEditando = idPujaEditando ? buscarPorId(pujas, idPujaEditando) : null;
  const misPujas = pujas.filter((puja) => mismoId(puja.bidderId, usuarioActual?.id));
  const cantidadOfertasLideres = pujas.filter((puja) => {
    const subasta = buscarPorId(subastas, puja.auctionId);
    return subasta && Number(subasta.currentPrice) === Number(puja.amount);
  }).length;

  let pujaMasAlta = 0;
  for (const puja of pujas) {
    if (Number(puja.amount) > pujaMasAlta) pujaMasAlta = Number(puja.amount);
  }

  const pujasFiltradas = pujas.filter((puja) => {
    const subasta = buscarPorId(subastas, puja.auctionId);
    const postor = buscarPorId(usuarios, puja.bidderId);
    const coincideAlcance = filtroAlcance === 'todas' || mismoId(puja.bidderId, usuarioActual?.id);
    const coincideSubasta = filtroSubasta === 'todas' || mismoId(puja.auctionId, filtroSubasta);
    const coincideTexto = coincideConBusqueda(
      [subasta?.title || puja.auctionTitle, postor?.name || puja.bidderName, puja.note],
      textoBusqueda
    );
    return coincideAlcance && coincideSubasta && coincideTexto;
  });

  function cerrarFormulario() {
    setFormularioAbierto(false);
    setIdPujaEditando(null);
  }

  function manejarGuardado(_registro, montoGuardado) {
    setAviso({
      tipo: 'exito',
      texto: pujaEditando
        ? `Registro de puja #${pujaEditando.id} actualizado.`
        : `Oferta vinculante de ${formatearMoneda(montoGuardado)} registrada correctamente.`,
    });
    cerrarFormulario();
  }

  async function manejarEliminacion(puja) {
    if (!window.confirm(`¿Confirmas eliminar el registro de puja #${puja.id} por ${formatearMoneda(puja.amount)}?`)) {
      return;
    }
    try {
      await eliminarPuja(puja.id);
      setAviso({ tipo: 'exito', texto: `Puja #${puja.id} eliminada y precio de subasta recalculado.` });
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    }
  }

  const tarjetasResumen = [
    { destacada: true, titulo: 'Total de Pujas', icono: <TrendingUp className="w-3.5 h-3.5" />, valor: pujas.length, subtitulo: 'Ofertas registradas en sala' },
    { titulo: 'Mis Pujas', valor: misPujas.length, subtitulo: 'Con compromiso RN04', claseSubtitulo: 'text-[#224F10] font-semibold' },
    { titulo: 'Ofertas Líderes', valor: cantidadOfertasLideres, subtitulo: 'Encabezando subastas' },
    { titulo: 'Puja Más Alta', valor: formatearMoneda(pujaMasAlta), claseValor: 'text-2xl sm:text-3xl text-[#224F10] truncate tabular-nums', subtitulo: 'Récord de la plataforma' },
  ];

  return (
    <div className="space-y-6">
      <CabeceraSeccionPanel
        titulo="Historial de Pujas"
        subtitulo="Registro auditable de ofertas vinculantes (RN01 a RN04) actualizado en vivo."
        botonPrincipal={
          <BotonPanel
            icono={<Plus className="w-3.5 h-3.5" />}
            alHacerClic={() => { setIdPujaEditando(null); setFormularioAbierto(true); setAviso(null); }}
          >
            Registrar Puja
          </BotonPanel>
        }
      />

      <GridEstadisticasPanel tarjetas={tarjetasResumen} />

      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {formularioAbierto && (
        <ContenedorFormularioPanel
          titulo={pujaEditando ? `Editar Puja #${pujaEditando.id}` : 'Registrar Nueva Puja Vinculante'}
          alCerrar={cerrarFormulario}
        >
          <FormularioPuja
            key={pujaEditando ? pujaEditando.id : 'nueva-puja'}
            puja={pujaEditando}
            subastas={subastas}
            esAdmin={esAdmin}
            alCrearPuja={crearPuja}
            alActualizarPuja={actualizarPuja}
            alGuardar={manejarGuardado}
            alCancelar={cerrarFormulario}
          />
        </ContenedorFormularioPanel>
      )}

      {/* Filtros por alcance y subasta */}
      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <FiltrosBotones opciones={OPCIONES_ALCANCE} valorActual={filtroAlcance} alElegir={setFiltroAlcance} />

        <select
          value={filtroSubasta}
          onChange={(evento) => setFiltroSubasta(evento.target.value)}
          className="sm:max-w-xs w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none"
        >
          <option value="todas">Todas las subastas</option>
          {subastas.map((subasta) => (
            <option key={subasta.id} value={String(subasta.id)}>#{subasta.id} — {subasta.title}</option>
          ))}
        </select>
      </div>

      {pujasFiltradas.length === 0 ? (
        <EstadoVacioPanel mensaje="No hay pujas registradas para el filtro actual." />
      ) : (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 divide-y divide-[#224F10]/8 shadow-2xs overflow-hidden">
          {pujasFiltradas.map((puja) => {
            const subasta = buscarPorId(subastas, puja.auctionId);
            const postor = buscarPorId(usuarios, puja.bidderId);
            return (
              <FilaPujaPanel
                key={puja.id}
                puja={puja}
                tituloSubasta={subasta?.title || puja.auctionTitle || `Subasta #${puja.auctionId}`}
                nombrePostor={postor?.name || puja.bidderName || `Usuario #${puja.bidderId}`}
                esOfertaLider={Boolean(subasta && Number(subasta.currentPrice) === Number(puja.amount))}
                puedeEditar={esAdmin || mismoId(usuarioActual?.id, puja.bidderId)}
                esAdmin={esAdmin}
                alEditar={() => { setIdPujaEditando(puja.id); setFormularioAbierto(true); setAviso(null); }}
                alEliminar={() => manejarEliminacion(puja)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
