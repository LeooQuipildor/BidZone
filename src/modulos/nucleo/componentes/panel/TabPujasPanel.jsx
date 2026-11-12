import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { usarTiendaPujas } from '../../../pujas/estado/tiendaPujas';
import { FormularioPuja } from '../../../pujas/componentes/FormularioPuja';
import { buscarPorId, coincideConBusqueda, mismoId } from '../../utilidades/ayudas';
import {
  AvisoPanel,
  BotonPanel,
  CabeceraSeccionPanel,
  ContenedorFormularioPanel,
  EstadoVacioPanel,
  SelectPanel,
} from './PanelCompartido';
import { FilaPujaPanel } from './FilaPujaPanel';

// Pestaña personal de pujas: muestra únicamente las ofertas realizadas por el usuario conectado (RN04)
export function TabPujasPanel({ usuarioActual, subastas, pujas, textoBusqueda }) {
  const navegar = useNavigate();
  const crearPuja = usarTiendaPujas((estado) => estado.crearPuja);
  const actualizarPuja = usarTiendaPujas((estado) => estado.actualizarPuja);

  const [filtroSubasta, setFiltroSubasta] = useState('todas');
  const [aviso, setAviso] = useState(null);
  const [idPujaEditando, setIdPujaEditando] = useState(null);

  const misPujas = pujas.filter((puja) => mismoId(puja.bidderId, usuarioActual?.id));
  const pujaEditando = idPujaEditando ? buscarPorId(misPujas, idPujaEditando) : null;
  const idsSubastasConPujas = [...new Set(misPujas.map((puja) => String(puja.auctionId)))];

  const pujasFiltradas = misPujas.filter((puja) => {
    const subasta = buscarPorId(subastas, puja.auctionId);
    const coincideSubasta = filtroSubasta === 'todas' || mismoId(puja.auctionId, filtroSubasta);
    const coincideTexto = coincideConBusqueda(
      [subasta?.title || puja.auctionTitle, puja.note],
      textoBusqueda
    );
    return coincideSubasta && coincideTexto;
  });

  function manejarGuardado(registro) {
    const idPuja = registro?.id || idPujaEditando;
    setAviso({
      tipo: 'exito',
      texto: `Nota de la puja #${idPuja} actualizada correctamente.`,
    });
    setIdPujaEditando(null);
  }

  const opcionesFiltroSubastas = [
    { valor: 'todas', etiqueta: `Todas mis subastas (${misPujas.length})` },
    ...idsSubastasConPujas.map((idSubasta) => {
      const subasta = buscarPorId(subastas, idSubasta);
      return {
        valor: idSubasta,
        etiqueta: `#${idSubasta} — ${subasta?.title || `Subasta #${idSubasta}`}`,
      };
    }),
  ];

  return (
    <div className="space-y-5">
      <CabeceraSeccionPanel
        titulo="Mis Pujas"
        subtitulo={`Historial de tus ${misPujas.length} ofertas vinculantes (RN04). Para ofertar ve a Explorar.`}
        botonPrincipal={
          <BotonPanel
            variante="secundario"
            icono={<Compass className="w-3.5 h-3.5" />}
            alHacerClic={() => navegar('/subastas')}
          >
            Explorar Subastas
          </BotonPanel>
        }
      />

      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {pujaEditando && (
        <ContenedorFormularioPanel
          titulo={`Editar Nota de Puja #${pujaEditando.id}`}
          alCerrar={() => setIdPujaEditando(null)}
        >
          <FormularioPuja
            key={pujaEditando.id}
            puja={pujaEditando}
            subastas={subastas}
            alCrearPuja={crearPuja}
            alActualizarPuja={actualizarPuja}
            alGuardar={manejarGuardado}
            alCancelar={() => setIdPujaEditando(null)}
          />
        </ContenedorFormularioPanel>
      )}

      {idsSubastasConPujas.length > 0 && (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 shadow-2xs">
          <div className="sm:max-w-sm">
            <SelectPanel
              valor={filtroSubasta}
              alCambiar={setFiltroSubasta}
              opciones={opcionesFiltroSubastas}
            />
          </div>
        </div>
      )}

      {pujasFiltradas.length === 0 ? (
        <EstadoVacioPanel
          mensaje={
            misPujas.length === 0
              ? 'Todavía no realizaste ninguna oferta. Visita Explorar para pujar en una subasta activa.'
              : 'No hay pujas que coincidan con el filtro aplicado.'
          }
        />
      ) : (
        <div className="rounded-2xl bg-white border border-[#224F10]/10 divide-y divide-[#224F10]/8 shadow-2xs overflow-hidden">
          {pujasFiltradas.map((puja) => {
            const subasta = buscarPorId(subastas, puja.auctionId);
            return (
              <FilaPujaPanel
                key={puja.id}
                puja={puja}
                tituloSubasta={subasta?.title || puja.auctionTitle || `Subasta #${puja.auctionId}`}
                nombrePostor={usuarioActual?.name || puja.bidderName || 'Tú'}
                esOfertaLider={Boolean(subasta && Number(subasta.currentPrice) === Number(puja.amount))}
                alEditar={() => {
                  setIdPujaEditando(puja.id);
                  setAviso(null);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
