/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/TabPujasPanel.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE COMPONENTE?
 * Es la pestaña "Mis Pujas" del Panel de Control, destinada a que el usuario
 * conectado audite y realice el seguimiento de todas sus ofertas realizadas.
 *
 * ¿POR QUÉ EXISTE Y CUÁL ES SU PROPÓSITO?
 * Cumple con la Regla de Negocio RN04: "Ofertas Vinculantes e Irrevocables".
 * En una plataforma de subastas justa, un postor no puede borrar ofertas ni
 * reducir su monto a discreción, ya que alteraría la expectativa del vendedor
 * y de otros postores que compitieron legítimamente.
 *
 * Características del panel:
 * 1. Muestra exclusivamente las pujas realizadas por el usuario conectado (`bidderId === usuarioActual.id`).
 * 2. Identifica en tiempo real si su oferta es la "Oferta Líder" de la subasta.
 * 3. Permite filtrar por una subasta específica mediante un selector desplegable (`filtroSubasta`).
 * 4. Permite editar la "Nota de coordinación" a través del `FormularioPuja` (el monto ofertado
 *    permanece inmutable en la interfaz por RN04).
 * 5. Si no tiene ofertas, ofrece un acceso directo a la vista de exploración (`/subastas`).
 *
 * ¿DE DÓNDE PROVIENEN LAS PROPS?
 * - `usuarioActual`: Sesión activa de `tiendaAutenticacion.js`.
 * - `subastas`: Catálogo general de subastas de `tiendaSubastas.js` (para obtener títulos y precios actuales).
 * - `pujas`: Registro global de ofertas de `tiendaPujas.js`.
 * - `textoBusqueda`: Filtro de texto ingresado en la barra superior.
 * ==============================================================================
 */

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

/**
 * Componente principal: TabPujasPanel
 * ----------------------------------------------------------------------------
 * Renderiza el listado de ofertas personales, filtros por subasta y modal de edición de notas.
 */
export function TabPujasPanel({ usuarioActual, subastas, pujas, textoBusqueda }) {
  const navegar = useNavigate();

  // Acciones asíncronas de la tienda de Zustand `tiendaPujas.js`
  const crearPuja = usarTiendaPujas((estado) => estado.crearPuja);
  const actualizarPuja = usarTiendaPujas((estado) => estado.actualizarPuja);

  // Estados locales para filtrado y edición
  const [filtroSubasta, setFiltroSubasta] = useState('todas');
  const [aviso, setAviso] = useState(null);
  const [idPujaEditando, setIdPujaEditando] = useState(null);

  // Filtrado de pujas pertenecientes estrictamente a la sesión actual
  const misPujas = pujas.filter((puja) => mismoId(puja.bidderId, usuarioActual?.id));
  const pujaEditando = idPujaEditando ? buscarPorId(misPujas, idPujaEditando) : null;

  // Obtención de IDs únicos de subastas en las cuales el usuario ha participado
  const idsSubastasConPujas = [...new Set(misPujas.map((puja) => String(puja.auctionId)))];

  // Filtro compuesto: por subasta elegida en el select y por texto de búsqueda
  const pujasFiltradas = misPujas.filter((puja) => {
    const subasta = buscarPorId(subastas, puja.auctionId);
    const coincideSubasta = filtroSubasta === 'todas' || mismoId(puja.auctionId, filtroSubasta);
    const coincideTexto = coincideConBusqueda(
      [subasta?.title || puja.auctionTitle, puja.note],
      textoBusqueda
    );
    return coincideSubasta && coincideTexto;
  });

  /** Maneja el guardado exitoso de la nota de coordinación */
  function manejarGuardado(registro) {
    const idPuja = registro?.id || idPujaEditando;
    setAviso({
      tipo: 'exito',
      texto: `Nota de la puja #${idPuja} actualizada correctamente.`,
    });
    setIdPujaEditando(null);
  }

  // Generación de opciones para el selector de subastas
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
      {/* Cabecera con recordatorio de compromiso legal RN04 y botón de exploración */}
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

      {/* Banner de mensajes y notificaciones */}
      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {/* Formulario modal para editar la nota de coordinación */}
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

      {/* Selector para aislar las ofertas de una subasta específica */}
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

      {/* Lista de filas de puja o estado vacío */}
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
