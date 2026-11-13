/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/TabSubastasPanel.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE COMPONENTE?
 * Es la pestaña de gestión de subastas del Panel de Control de BidZone.
 *
 * ¿POR QUÉ EXISTE Y CUÁL ES SU PROPÓSITO?
 * Permite a los usuarios administrar sus publicaciones y a los administradores
 * auditar y moderar el catálogo global de lotes.
 *
 * Características clave:
 * 1. Separación de Roles:
 *    - Un Socio solo puede ver y gestionar las subastas de las cuales es propietario (`sellerId`).
 *    - Un Administrador puede alternar entre "Todas las Subastas" (modo moderación de catálogo)
 *      y "Mis Subastas" (sus publicaciones particulares).
 * 2. Publicación y Edición (RN01, RN02, RN03):
 *    - Permite crear nuevas subastas con fecha futura e incremento de puja mínimo.
 *    - Al editar, si la subasta ya recibió pujas (`subastaEditandoTienePujas`), se bloquean
 *      los campos críticos (precio base, fecha de cierre) para proteger a los postores activos.
 * 3. Moderación y Solicitud de Corrección:
 *    - Si un administrador detecta un lote con infracciones o datos confusos, puede
 *      desplegar el `PanelSolicitudCorreccion` para notificar al vendedor formalmente.
 * 4. Filtrado, Ordenamiento y Paginación:
 *    - Filtro por categoría temática.
 *    - Filtro por estado ('activa', 'finalizada', etc.).
 *    - Ordenamiento por proximidad de cierre o precio.
 *    - Paginación local de 12 elementos por página con scroll automático arriba.
 *
 * ¿DE DÓNDE PROVIENEN LAS PROPS?
 * - `usuarioActual`: Sesión activa de `tiendaAutenticacion.js`.
 * - `usuarios`: Lista completa de usuarios para resolver el nombre del vendedor.
 * - `subastas`: Array completo de lotes provenientes de `tiendaSubastas.js`.
 * - `pujas`: Array de pujas de `tiendaPujas.js` (para comprobar si un lote tiene ofertas).
 * - `textoBusqueda`: Filtro de texto libre del Header superior.
 * - `ahoraMs`: Timestamp en milisegundos para calcular tiempos restantes con precisión.
 * - `paginaActual`: Número de página administrado por el estado de `VistaPanelControl.jsx`.
 * - `alCambiarPagina`: Callback para actualizar la página en el contenedor padre.
 * - `abrirDesdeAccesoExterno`: Booleano para forzar la apertura del formulario de creación.
 * - `alLimpiarNuevo`: Callback para resetear el flag de apertura externa.
 * ==============================================================================
 */

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

/** Cantidad máxima de subastas mostradas por página dentro del panel */
const SUBASTAS_POR_PAGINA_PANEL = 12;

/**
 * Componente principal: TabSubastasPanel
 * ----------------------------------------------------------------------------
 * Gestiona el ciclo completo de vida de las subastas en el panel (listado, filtrado,
 * creación, edición, corrección y eliminación).
 */
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
  // Acciones asíncronas del store de Zustand `tiendaSubastas.js`
  const crearSubasta = usarTiendaSubastas((estado) => estado.crearSubasta);
  const actualizarSubasta = usarTiendaSubastas((estado) => estado.actualizarSubasta);
  const eliminarSubasta = usarTiendaSubastas((estado) => estado.eliminarSubasta);

  // Estados locales de filtrado y control de formularios
  const esAdmin = usuarioActual?.role === 'admin';
  const [vistaAdmin, setVistaAdmin] = useState('todas');
  const [categoria, setCategoria] = useState('Todas');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [ordenarPor, setOrdenarPor] = useState('proximasACerrar');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [idSubastaEditando, setIdSubastaEditando] = useState(null);
  const [idSubastaCorrigiendo, setIdSubastaCorrigiendo] = useState(null);

  // Filtrado por propiedad: socio solo ve las suyas; admin puede ver todas o las suyas
  const misSubastas = subastas.filter((s) => mismoId(s.sellerId, usuarioActual?.id));
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
      (Number(subastaEditando.bidCount ?? 0) > 0 ||
        pujas.some((p) => mismoId(p.auctionId, subastaEditando.id)))
  );

  /** Cambia un criterio de filtro y reinicia la paginación a la primera página */
  function cambiarFiltro(aplicarCambio, valor) {
    aplicarCambio(valor);
    alCambiarPagina(1);
  }

  /** Cambia la página y desplaza la ventana suavemente hacia el inicio */
  function cambiarPagina(nuevaPagina) {
    alCambiarPagina(nuevaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Cierra todos los paneles flotantes y resetea las variables de selección */
  function cerrarPaneles() {
    setFormularioAbierto(false);
    setIdSubastaEditando(null);
    setIdSubastaCorrigiendo(null);
    alLimpiarNuevo?.();
  }

  /** Maneja el guardado de una subasta nueva o la actualización de una existente */
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

  /** Maneja la eliminación de una subasta previa confirmación del usuario */
  async function manejarEliminacion(subasta) {
    if (!window.confirm(`¿Confirmas eliminar la subasta "${subasta.title}"?`)) return;
    try {
      await eliminarSubasta(subasta.id);
      setAviso({ tipo: 'exito', texto: `Subasta "${subasta.title}" eliminada.` });
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
