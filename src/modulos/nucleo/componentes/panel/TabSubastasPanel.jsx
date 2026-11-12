import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usarTiendaSubastas } from '../../../subastas/estado/tiendaSubastas';
import { filtrarYOrdenarSubastas } from '../../../subastas/utilidades/filtrosSubasta';
import { FormularioSubasta } from '../../../subastas/componentes/FormularioSubasta';
import { PanelSolicitudCorreccion } from '../../../subastas/componentes/PanelSolicitudCorreccion';
import { PaginacionCatalogo } from '../../../subastas/componentes/PaginacionCatalogo';
import { TarjetaSubasta } from '../../../subastas/componentes/TarjetaSubasta';
import { buscarPorId, mismoId, paginarLista } from '../../utilidades/ayudas';
import { CATEGORIAS_FILTRO_SUBASTA } from '../../utilidades/formatos';
import {
  OPCIONES_ESTADO_PANEL,
  OPCIONES_ORDEN_PANEL,
  VISTAS_SUBASTA_ADMIN,
  obtenerTextosTabSubastas,
} from './ayudasPanel';
import {
  AvisoPanel,
  BotonPanel,
  CabeceraSeccionPanel,
  ContenedorFormularioPanel,
  EstadoVacioPanel,
  SelectPanel,
} from './PanelCompartido';
import { FiltrosBotones } from '../../diseno/componentesBloques';

const SUBASTAS_POR_PAGINA_PANEL = 12;

// Pestaña de subastas: separa Moderación y Mis Subastas en Admin; en ajenas solicita corrección o elimina
export function TabSubastasPanel({
  usuarioActual,
  usuarios,
  subastas,
  pujas,
  textoBusqueda,
  ahoraMs,
  paginaActual,
  alCambiarPagina,
  abrirDesdeAccesoExterno = false,
  alLimpiarNuevo,
}) {
  const crearSubasta = usarTiendaSubastas((estado) => estado.crearSubasta);
  const actualizarSubasta = usarTiendaSubastas((estado) => estado.actualizarSubasta);
  const eliminarSubasta = usarTiendaSubastas((estado) => estado.eliminarSubasta);

  const esAdmin = usuarioActual?.role === 'admin';
  const [vistaAdmin, setVistaAdmin] = useState('todas');
  const [categoria, setCategoria] = useState('Todas');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [ordenarPor, setOrdenarPor] = useState('proximasACerrar');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [idSubastaEditando, setIdSubastaEditando] = useState(null);
  const [idSubastaCorrigiendo, setIdSubastaCorrigiendo] = useState(null);

  const misSubastas = subastas.filter((s) => mismoId(s.sellerId, usuarioActual?.id));
  const subastasVisibles = esAdmin && vistaAdmin === 'todas' ? subastas : misSubastas;
  const subastasFiltradas = filtrarYOrdenarSubastas(
    subastasVisibles,
    textoBusqueda,
    categoria,
    filtroEstado,
    ordenarPor,
    ahoraMs
  );

  const { elementosPagina: subastasPagina, paginaActual: paginaSegura, totalPaginas } =
    paginarLista(subastasFiltradas, paginaActual, SUBASTAS_POR_PAGINA_PANEL);

  const mostrarFormulario = formularioAbierto || abrirDesdeAccesoExterno;
  const subastaEditando = !abrirDesdeAccesoExterno && idSubastaEditando
    ? buscarPorId(subastas, idSubastaEditando)
    : null;
  const subastaACorregir = !abrirDesdeAccesoExterno && idSubastaCorrigiendo
    ? buscarPorId(subastas, idSubastaCorrigiendo)
    : null;
  const subastaEditandoTienePujas = Boolean(
    subastaEditando &&
      (Number(subastaEditando.bidCount ?? 0) > 0 ||
        pujas.some((p) => mismoId(p.auctionId, subastaEditando.id)))
  );

  function cambiarFiltro(aplicarCambio, valor) {
    aplicarCambio(valor);
    alCambiarPagina(1);
  }

  function cambiarPagina(nuevaPagina) {
    alCambiarPagina(nuevaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cerrarPaneles() {
    setFormularioAbierto(false);
    setIdSubastaEditando(null);
    setIdSubastaCorrigiendo(null);
    alLimpiarNuevo?.();
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

  async function manejarEliminacion(subasta) {
    if (!window.confirm(`¿Confirmas eliminar la subasta "${subasta.title}"?`)) return;
    try {
      await eliminarSubasta(subasta.id);
      setAviso({ tipo: 'exito', texto: `Subasta "${subasta.title}" eliminada.` });
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    }
  }

  const textos = obtenerTextosTabSubastas(esAdmin, vistaAdmin, subastas.length, misSubastas.length);

  return (
    <div className="space-y-5">
      <CabeceraSeccionPanel
        titulo={textos.titulo}
        subtitulo={textos.subtitulo}
        botonPrincipal={
          <BotonPanel
            icono={<Plus className="w-3.5 h-3.5" />}
            alHacerClic={() => { cerrarPaneles(); setFormularioAbierto(true); setAviso(null); }}
          >
            Publicar Subasta
          </BotonPanel>
        }
      />

      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {mostrarFormulario && (
        <ContenedorFormularioPanel
          titulo={subastaEditando ? `Editar Mi Subasta #${subastaEditando.id}` : 'Publicar Nueva Subasta'}
          alCerrar={cerrarPaneles}
        >
          <FormularioSubasta
            key={subastaEditando ? subastaEditando.id : 'nueva-subasta'}
            subasta={subastaEditando}
            tienePujas={subastaEditandoTienePujas}
            esAdmin={esAdmin}
            alEnviarFormulario={guardarFormulario}
            alCancelar={cerrarPaneles}
          />
        </ContenedorFormularioPanel>
      )}

      {subastaACorregir && (
        <ContenedorFormularioPanel
          titulo={`Solicitar revisión · Lote #${subastaACorregir.id}`}
          alCerrar={() => setIdSubastaCorrigiendo(null)}
        >
          <PanelSolicitudCorreccion
            subasta={subastaACorregir}
            alExito={(texto) => { setAviso({ tipo: 'exito', texto }); setIdSubastaCorrigiendo(null); }}
            alCancelar={() => setIdSubastaCorrigiendo(null)}
          />
        </ContenedorFormularioPanel>
      )}

      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 space-y-3 shadow-2xs">
        {esAdmin && (
          <FiltrosBotones opciones={VISTAS_SUBASTA_ADMIN} valorActual={vistaAdmin} alElegir={(v) => cambiarFiltro(setVistaAdmin, v)} />
        )}
        <FiltrosBotones opciones={CATEGORIAS_FILTRO_SUBASTA} valorActual={categoria} alElegir={(c) => cambiarFiltro(setCategoria, c)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <SelectPanel valor={filtroEstado} alCambiar={(e) => cambiarFiltro(setFiltroEstado, e)} opciones={OPCIONES_ESTADO_PANEL} />
          <SelectPanel valor={ordenarPor} alCambiar={(o) => cambiarFiltro(setOrdenarPor, o)} opciones={OPCIONES_ORDEN_PANEL} />
        </div>
      </div>

      {subastasFiltradas.length === 0 ? (
        <EstadoVacioPanel mensaje={textos.vacio} />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {subastasPagina.map((subasta) => {
              const conteoLocal = pujas.filter((p) => mismoId(p.auctionId, subasta.id)).length;
              return (
                <TarjetaSubasta
                  key={subasta.id}
                  subasta={subasta}
                  vendedor={buscarPorId(usuarios, subasta.sellerId) || { name: subasta.sellerName }}
                  cantidadOfertas={Number(subasta.bidCount ?? conteoLocal)}
                  ahoraMs={ahoraMs}
                  esPropietario={mismoId(usuarioActual?.id, subasta.sellerId)}
                  esAdmin={esAdmin}
                  alEditar={(s) => { cerrarPaneles(); setIdSubastaEditando(s.id); setFormularioAbierto(true); setAviso(null); }}
                  alSolicitarRevision={(s) => { cerrarPaneles(); setIdSubastaCorrigiendo(s.id); setAviso(null); }}
                  alEliminar={manejarEliminacion}
                />
              );
            })}
          </div>
          <PaginacionCatalogo
            paginaActual={paginaSegura}
            totalPaginas={totalPaginas}
            totalElementos={subastasFiltradas.length}
            elementosPorPagina={SUBASTAS_POR_PAGINA_PANEL}
            alCambiarPagina={cambiarPagina}
          />
        </div>
      )}
    </div>
  );
}
