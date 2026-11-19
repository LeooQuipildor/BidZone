import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { usarTiendaSubastas } from '../estado/tiendaSubastas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { filtrarYOrdenarSubastas } from '../utilidades/filtrosSubasta';
import { TarjetaSubasta } from './TarjetaSubasta';
import { PaginacionCatalogo } from './PaginacionCatalogo';
import { PanelSolicitudCorreccion } from './PanelSolicitudCorreccion';
import {
  CATEGORIAS_FILTRO_SUBASTA,
  OPCIONES_ESTADO_SALA,
  OPCIONES_ORDEN_SUBASTA,
} from '../../nucleo/utilidades/formatos';
import { mismoId, paginarLista, useRelojSegundo } from '../../nucleo/utilidades/ayudas';
import { Button, Input, Select, Card } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import {
  CabeceraPagina,
  FiltrosBotones,
  TarjetaCtaCatalogo,
} from '../../nucleo/diseno/componentesBloques';

// Constante de paginación para el catálogo
const SUBASTAS_POR_PAGINA = 20;

export function VistaListaSubastas() {
  const navegar = useNavigate();

  // Reloj de cuenta regresiva sincronizado cada segundo
  const ahoraMs = useRelojSegundo();

  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const errorSubastas = usarTiendaSubastas((estado) => estado.error);
  const filtros = usarTiendaSubastas((estado) => estado.filtros);
  const paginaCatalogo = usarTiendaSubastas((estado) => estado.paginaCatalogo);
  const actualizarFiltros = usarTiendaSubastas((estado) => estado.actualizarFiltros);
  const cambiarPaginaCatalogo = usarTiendaSubastas((estado) => estado.cambiarPaginaCatalogo);
  const obtenerSubastas = usarTiendaSubastas((estado) => estado.obtenerSubastas);
  const eliminarSubasta = usarTiendaSubastas((estado) => estado.eliminarSubasta);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);

  // Estados locales para mensajes de éxito y subasta seleccionada para revisión disciplinaria
  const [aviso, setAviso] = useState(null);
  const [subastaSolicitada, setSubastaSolicitada] = useState(null);

  useEffect(() => {
    obtenerSubastas();
  }, [obtenerSubastas]);

  // Asegura que el valor del filtro de estado sea coherente
  const estadoSala = OPCIONES_ESTADO_SALA.some((opcion) => opcion.valor === filtros.estado)
    ? filtros.estado
    : 'activa';

  // Procesamiento y ordenamiento de las subastas según filtros activos
  const subastasFiltradas = filtrarYOrdenarSubastas(
    subastas,
    filtros.busqueda,
    filtros.categoria,
    estadoSala,
    filtros.ordenarPor,
    ahoraMs
  );

  // Paginación segura de los resultados filtrados
  const {
    elementosPagina: subastasPaginadas,
    paginaActual: paginaSegura,
    totalPaginas,
  } = paginarLista(subastasFiltradas, paginaCatalogo, SUBASTAS_POR_PAGINA);

  // Permiso de administrador para moderación
  const esAdmin = usuarioActual?.rol === 'admin';

  function manejarCambioPagina(nuevaPagina) {
    cambiarPaginaCatalogo(nuevaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function manejarEliminacion(subasta) {
    if (!window.confirm(`¿Confirmas la eliminación de la subasta "${subasta.titulo}"?`)) {
      return;
    }
    setAviso(null);
    try {
      await eliminarSubasta(subasta.id);
      setAviso({ tipo: 'success', texto: `Subasta "${subasta.titulo}" eliminada exitosamente.` });
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    }
  }

  return (
    <div className="space-y-8">
      {/* Cabecera con título y botón de publicación directa */}
      <CabeceraPagina
        titulo="Elige tu lote en subasta"
        subtitulo="Explora artículos en vivo, realiza ofertas vinculantes o administra tus publicaciones."
        accion={
          usuarioActual && (
            <Button onClick={() => navegar('/subastas/nueva')}>
              <PlusCircle className="w-4 h-4" />
              Publicar Subasta
            </Button>
          )
        }
      />

      {/* Alertas de error o éxito */}
      {(aviso || errorSubastas) && (
        <Alert type={aviso?.tipo || 'error'} onClose={() => setAviso(null)}>
          {aviso?.texto || errorSubastas}
        </Alert>
      )}

      {/* Barra de filtros por categoría y caja de búsqueda */}
      <div className="space-y-4">
        <FiltrosBotones
          opciones={CATEGORIAS_FILTRO_SUBASTA}
          valorActual={filtros.categoria}
          alElegir={(categoria) => actualizarFiltros({ categoria })}
          claseInactivo="bg-white/80 text-[#0D0D0D]/75 hover:bg-white border border-[#224F10]/12"
        />

        <Card className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="buscar-subastas"
              label="Buscar artículo"
              placeholder="MacBook, PS5, Silla..."
              value={filtros.busqueda}
              onChange={(evento) => actualizarFiltros({ busqueda: evento.target.value })}
            />
            <Select
              id="filtro-estado"
              label="Estado de sala"
              value={estadoSala}
              onChange={(evento) => actualizarFiltros({ estado: evento.target.value })}
              options={OPCIONES_ESTADO_SALA}
            />
            <Select
              id="filtro-orden"
              label="Ordenar por"
              value={filtros.ordenarPor}
              onChange={(evento) => actualizarFiltros({ ordenarPor: evento.target.value })}
              options={OPCIONES_ORDEN_SUBASTA}
            />
          </div>
        </Card>
      </div>

      {/* Cuadrícula de tarjetas o estado vacío */}
      {subastasFiltradas.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm text-[#0D0D0D]/65">
            No se encontraron subastas con los criterios seleccionados.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subastasPaginadas.map((subasta) => {
              const esVendedor = mismoId(usuarioActual?.id, subasta.vendedorId);
              return (
                <TarjetaSubasta
                  key={subasta.id}
                  subasta={subasta}
                  ahoraMs={ahoraMs}
                  esPropietario={Boolean(usuarioActual && esVendedor)}
                  esAdmin={Boolean(usuarioActual && esAdmin)}
                  alSolicitarRevision={setSubastaSolicitada}
                  alEliminar={manejarEliminacion}
                />
              );
            })}

            {/* En la última página mostramos la tarjeta CTA para invitar a publicar */}
            {paginaSegura === totalPaginas && (
              <TarjetaCtaCatalogo
                titulo="¿Tienes un artículo para subastar?"
                descripcion="Publica tu lote con precio base e incremento mínimo. Al cerrar la subasta coordinas directamente con el ganador."
                textoBoton="Crear nueva subasta"
                alHacerClic={() => navegar('/subastas/nueva')}
              />
            )}
          </div>

          {/* Barra de paginación */}
          <PaginacionCatalogo
            paginaActual={paginaSegura}
            totalPaginas={totalPaginas}
            totalElementos={subastasFiltradas.length}
            elementosPorPagina={SUBASTAS_POR_PAGINA}
            alCambiarPagina={manejarCambioPagina}
          />
        </div>
      )}

      {/* Modal de moderación disciplinaria para Administradores */}
      <PanelSolicitudCorreccion
        enModal
        subasta={subastaSolicitada}
        alExito={(texto) => {
          setAviso({ tipo: 'success', texto });
          setSubastaSolicitada(null);
        }}
        alCancelar={() => setSubastaSolicitada(null)}
      />
    </div>
  );
}
