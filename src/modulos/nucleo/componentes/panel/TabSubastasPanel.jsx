import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStoreAuctions } from '../../../subastas/estado/storeAuctions';
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
  // Acciones asíncronas del store de Zustand `storeAuctions.js`
  const crearSubasta = useStoreAuctions((estado) => estado.crearSubasta);
  const actualizarSubasta = useStoreAuctions((estado) => estado.actualizarSubasta);
  const eliminarSubasta = useStoreAuctions((estado) => estado.eliminarSubasta);

  // Estados locales de filtrado y control de formularios
  const esAdmin = usuarioActual?.rol === 'admin';
  const [vistaAdmin, setVistaAdmin] = useState('todas');
  const [categoria, setCategoria] = useState('Todas');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [ordenarPor, setOrdenarPor] = useState('proximasACerrar');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [idSubastaEditando, setIdSubastaEditando] = useState(null);
  const [idSubastaCorrigiendo, setIdSubastaCorrigiendo] = useState(null);

  // Filtrado por propiedad: socio solo ve las suyas; admin puede ver todas o las suyas
  const misSubastas = subastas.filter((s) => mismoId(s.vendedorId, usuarioActual?.id));
  const subastasVisibles = esAdmin && vistaAdmin === 'todas' ? subastas : misSubastas;

  // Aplicación de búsqueda, categoría, estado y ordenamiento
  const subastasFiltradas = filtrarYOrdenarSubastas(
    subastasVisibles,
    textoBusqueda,
    categoria,
    filtroEstado,
    ordenarPor,
    ahoraMs
  );

  // Paginación matemática con ayuda utilitaria
  const { elementosPagina: subastasPagina, paginaActual: paginaSegura, totalPaginas } =
    paginarLista(subastasFiltradas, paginaActual, SUBASTAS_POR_PAGINA_PANEL);

  // Detección de subasta en edición o corrección
  const mostrarFormulario = formularioAbierto || abrirDesdeAccesoExterno;
  const subastaEditando = !abrirDesdeAccesoExterno && idSubastaEditando
    ? buscarPorId(subastas, idSubastaEditando)
    : null;
  const subastaACorregir = !abrirDesdeAccesoExterno && idSubastaCorrigiendo
    ? buscarPorId(subastas, idSubastaCorrigiendo)
    : null;

  // Verificación de existencia de pujas activas para aplicar restricciones de edición (RN03)
  const subastaEditandoTienePujas = Boolean(
    subastaEditando &&
      (Number(subastaEditando.cantidadPujas ?? 0) > 0 ||
        pujas.some((p) => mismoId(p.subastaId, subastaEditando.id)))
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
      setAviso({ tipo: 'exito', texto: `Subasta "${creada.titulo}" publicada correctamente.` });
    }
    cerrarPaneles();
  }

  async function manejarEliminacion(subasta) {
    if (!window.confirm(`¿Confirmas eliminar la subasta "${subasta.titulo}"?`)) return;
    try {
      await eliminarSubasta(subasta.id);
      setAviso({ tipo: 'exito', texto: `Subasta "${subasta.titulo}" eliminada.` });
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    }
  }

  // Generación de textos de cabecera según el modo de visualización y rol
  const textos = obtenerTextosTabSubastas(esAdmin, vistaAdmin, subastas.length, misSubastas.length);

  return (
    <div className="space-y-5">
      {/* Cabecera con título dinámico y botón para publicar nueva subasta */}
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

      {/* Banner de mensajes de éxito o error */}
      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {/* Formulario modal inline para crear o editar subasta */}
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

      {/* Panel para que un administrador solicite correcciones de datos al vendedor */}
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

      {/* Barra de filtros: selector de vista (solo admin), categorías, estado y orden */}
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

      {/* Listado de tarjetas de subasta o mensaje de estado vacío */}
      {subastasFiltradas.length === 0 ? (
        <EstadoVacioPanel mensaje={textos.vacio} />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {subastasPagina.map((subasta) => {
              const conteoLocal = pujas.filter((p) => mismoId(p.subastaId, subasta.id)).length;
              return (
                <TarjetaSubasta
                  key={subasta.id}
                  subasta={subasta}
                  vendedor={buscarPorId(usuarios, subasta.vendedorId) || { nombre: subasta.nombreVendedor  }}
                  cantidadOfertas={Number(subasta.cantidadPujas ?? conteoLocal)}
                  ahoraMs={ahoraMs}
                  esPropietario={mismoId(usuarioActual?.id, subasta.vendedorId)}
                  esAdmin={esAdmin}
                  alEditar={(s) => { cerrarPaneles(); setIdSubastaEditando(s.id); setFormularioAbierto(true); setAviso(null); }}
                  alSolicitarRevision={(s) => { cerrarPaneles(); setIdSubastaCorrigiendo(s.id); setAviso(null); }}
                  alEliminar={manejarEliminacion}
                />
              );
            })}
          </div>

          {/* Componente de paginación con controles numéricos */}
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
