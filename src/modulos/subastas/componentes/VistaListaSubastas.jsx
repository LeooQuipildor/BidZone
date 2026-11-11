import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { usarTiendaSubastas } from '../estado/tiendaSubastas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { TarjetaSubasta } from './TarjetaSubasta';
import {
  CATEGORIAS_FILTRO_SUBASTA,
  OPCIONES_ESTADO_SALA,
  OPCIONES_ORDEN_SUBASTA,
} from '../../nucleo/utilidades/formatos';
import { mismoId } from '../../nucleo/utilidades/ayudas';
import { filtrarYOrdenarSubastas } from '../../nucleo/componentes/panel/ayudasPanel';
import { Button, Input, Select, Card } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import {
  CabeceraPagina,
  FiltrosBotones,
  TarjetaCtaCatalogo,
} from '../../nucleo/diseno/componentesBloques';

export function VistaListaSubastas() {
  const navegar = useNavigate();
  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const errorSubastas = usarTiendaSubastas((estado) => estado.error);
  const filtros = usarTiendaSubastas((estado) => estado.filtros);
  const actualizarFiltros = usarTiendaSubastas((estado) => estado.actualizarFiltros);
  const obtenerSubastas = usarTiendaSubastas((estado) => estado.obtenerSubastas);
  const eliminarSubasta = usarTiendaSubastas((estado) => estado.eliminarSubasta);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    obtenerSubastas();
  }, [obtenerSubastas]);

  const subastasFiltradas = filtrarYOrdenarSubastas(
    subastas,
    filtros.busqueda,
    filtros.categoria,
    filtros.estado,
    filtros.ordenarPor
  );

  async function manejarEliminacion(subasta) {
    if (!window.confirm(`¿Confirmas la eliminación de la subasta "${subasta.title}"?`)) {
      return;
    }
    setAviso(null);
    try {
      await eliminarSubasta(subasta.id);
      setAviso({ type: 'success', text: `Subasta "${subasta.title}" eliminada exitosamente.` });
    } catch (error) {
      setAviso({ type: 'error', text: error.message });
    }
  }

  return (
    <div className="space-y-8">
      <CabeceraPagina
        titulo="Elige tu lote en subasta"
        subtitulo="Explora artículos en vivo, realiza ofertas vinculantes o administra tus publicaciones."
        accion={
          usuarioActual && (
            <Button onClick={() => navegar('/auctions/new')}>
              <PlusCircle className="w-4 h-4" />
              Publicar Subasta
            </Button>
          )
        }
      />

      {(aviso || errorSubastas) && (
        <Alert type={aviso?.type || 'error'} onClose={() => setAviso(null)}>
          {aviso?.text || errorSubastas}
        </Alert>
      )}

      {/* Filtros por categoría, búsqueda y ordenamiento */}
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
              value={filtros.estado}
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

      {subastasFiltradas.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm text-[#0D0D0D]/65">
            No se encontraron subastas con los criterios seleccionados.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subastasFiltradas.map((subasta) => {
            const esAdmin = usuarioActual?.role === 'admin';
            const esVendedor = mismoId(usuarioActual?.id, subasta.sellerId);
            return (
              <TarjetaSubasta
                key={subasta.id}
                subasta={subasta}
                puedeAdministrar={Boolean(usuarioActual && (esAdmin || esVendedor))}
                alEliminar={manejarEliminacion}
              />
            );
          })}

          <TarjetaCtaCatalogo
            titulo="¿Tienes un artículo para subastar?"
            descripcion="Publica tu lote con precio base e incremento mínimo. Al cerrar la subasta coordinas directamente con el ganador."
            textoBoton="Crear nueva subasta"
            alHacerClic={() => navegar('/auctions/new')}
          />
        </div>
      )}
    </div>
  );
}
