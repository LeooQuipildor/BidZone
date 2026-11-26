import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useStoreBids } from '../../../pujas/estado/storeBids';
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

export function TabPujasPanel({ usuarioActual, subastas, pujas, textoBusqueda }) {
  const navegar = useNavigate();

  // Acciones asíncronas del store de Zustand `storeBids.js`
  const crearPuja = useStoreBids((estado) => estado.crearPuja);
  const actualizarPuja = useStoreBids((estado) => estado.actualizarPuja);

  // Estados locales para filtrado y edición
  const [filtroSubasta, setFiltroSubasta] = useState('todas');
  const [aviso, setAviso] = useState(null);
  const [idPujaEditando, setIdPujaEditando] = useState(null);

  // Filtrado de pujas pertenecientes estrictamente a la sesión actual
  const misPujas = pujas.filter((puja) => mismoId(puja.postorId, usuarioActual?.id));
  const pujaEditando = idPujaEditando ? buscarPorId(misPujas, idPujaEditando) : null;

  // Obtención de IDs únicos de subastas en las cuales el usuario ha participado
  const idsSubastasConPujas = [...new Set(misPujas.map((puja) => String(puja.subastaId)))];

  // Filtro compuesto: por subasta elegida en el select y por texto de búsqueda
  const pujasFiltradas = misPujas.filter((puja) => {
    const subasta = buscarPorId(subastas, puja.subastaId);
    const coincideSubasta = filtroSubasta === 'todas' || mismoId(puja.subastaId, filtroSubasta);
    const coincideTexto = coincideConBusqueda(
      [subasta?.titulo || puja.tituloSubasta, puja.nota],
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

  // Generación de opciones para el selector de subastas
  const opcionesFiltroSubastas = [
    { valor: 'todas', etiqueta: `Todas mis subastas (${misPujas.length})` },
    ...idsSubastasConPujas.map((idSubasta) => {
      const subasta = buscarPorId(subastas, idSubasta);
      return {
        valor: idSubasta,
        etiqueta: `#${idSubasta} — ${subasta?.titulo || `Subasta #${idSubasta}`}`,
      };
    }),
  ];

  return (
    <div className="space-y-5">
      {/* Cabecera con recordatorio de compromiso legal RN04 y botón de exploración */}
      <CabeceraSeccionPanel
        titulo="Mis Pujas"
        subtitulo={`Historial de tus ${misPujas.length} ofertas vinculantes. Para ofertar ve a Explorar.`}
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
            const subasta = buscarPorId(subastas, puja.subastaId);
            return (
              <FilaPujaPanel
                key={puja.id}
                puja={puja}
                tituloSubasta={subasta?.titulo || puja.tituloSubasta || `Subasta #${puja.subastaId}`}
                nombrePostor={usuarioActual?.nombre || puja.nombrePostor || 'Tú'}
                esOfertaLider={Boolean(subasta && Number(subasta.precioActual) === Number(puja.monto))}
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
