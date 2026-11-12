import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';
import { usarTiendaSubastas } from '../estado/tiendaSubastas';
import { usarTiendaPujas } from '../../pujas/estado/tiendaPujas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { prepararDatosDetalleSubasta } from '../utilidades/filtrosSubasta';
import { FichaProductoSubasta } from './FichaProductoSubasta';
import { PanelContactoSubasta } from './PanelContactoSubasta';
import { PanelPujasSubasta } from './PanelPujasSubasta';
import { PanelSolicitudCorreccion } from './PanelSolicitudCorreccion';
import { Button } from '../../nucleo/diseno/ui';
import { Alert, Loading, ErrorCard } from '../../nucleo/diseno/uiFeedback';
import { buscarPorId, mismoId, useRelojSegundo } from '../../nucleo/utilidades/ayudas';

export function VistaDetalleSubasta() {
  const { id } = useParams();
  const navegar = useNavigate();

  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const detalleSubastaActual = usarTiendaSubastas((estado) => estado.detalleSubastaActual);
  const cargandoDetalle = usarTiendaSubastas((estado) => estado.cargandoDetalle);
  const errorTienda = usarTiendaSubastas((estado) => estado.error);
  const obtenerSubastaPorId = usarTiendaSubastas((estado) => estado.obtenerSubastaPorId);
  const eliminarSubasta = usarTiendaSubastas((estado) => estado.eliminarSubasta);

  const pujas = usarTiendaPujas((estado) => estado.pujas);
  const crearPuja = usarTiendaPujas((estado) => estado.crearPuja);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);
  const usuarios = usarTiendaAutenticacion((estado) => estado.usuarios);

  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [solicitandoEdicion, setSolicitandoEdicion] = useState(false);

  useEffect(() => {
    obtenerSubastaPorId(id);
  }, [id, usuarioActual?.id, obtenerSubastaPorId]);

  const detalleEncontrado =
    detalleSubastaActual && mismoId(detalleSubastaActual.id, id) ? detalleSubastaActual : null;
  const subasta = detalleEncontrado || buscarPorId(subastas, id);
  const ahoraMs = useRelojSegundo(Boolean(subasta?.endTime && subasta?.status === 'activa'));

  if (cargandoDetalle && !subasta) return <Loading text="Cargando subasta..." />;

  if (!subasta) {
    return (
      <ErrorCard
        title="Subasta no encontrada"
        message={errorTienda || 'El artículo que buscas no existe o fue eliminado.'}
        backLabel="Volver al catálogo"
        onBack={() => navegar('/subastas')}
      />
    );
  }

  const { pujasSubasta, vendedor, ganador, esVendedor, esAdmin, puedeVerContactoDesbloqueado } =
    prepararDatosDetalleSubasta({
      subasta,
      detalleEncontrado,
      pujas,
      usuarios,
      usuarioActual,
    });

  async function manejarEliminacionAdmin() {
    if (!window.confirm(`¿Confirmas cancelar y eliminar la subasta "${subasta.title}"?`)) {
      return;
    }
    setMensajeError('');
    try {
      await eliminarSubasta(subasta.id);
      navegar('/subastas');
    } catch (error) {
      setMensajeError(error.message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <Button variant="outline" size="sm" onClick={() => navegar('/subastas')}>
          <ArrowLeft className="w-4 h-4" />
          Volver al Catálogo
        </Button>

        {(esVendedor || esAdmin) && (
          <div className="flex items-center gap-2">
            {esVendedor ? (
              <Link to={`/subastas/${subasta.id}/editar`}>
                <Button variant="outline" size="sm">Editar Subasta</Button>
              </Link>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setSolicitandoEdicion(true)}>
                  <AlertTriangle className="w-4 h-4" />
                  Solicitar revisión
                </Button>
                <Button variant="danger" size="sm" onClick={manejarEliminacionAdmin}>
                  <Trash2 className="w-4 h-4" />
                  Cancelar subasta
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <PanelSolicitudCorreccion
        enModal
        subasta={solicitandoEdicion ? subasta : null}
        alExito={(texto) => {
          setMensajeExito(texto);
          setSolicitandoEdicion(false);
        }}
        alCancelar={() => setSolicitandoEdicion(false)}
      />

      {mensajeError && (
        <Alert type="error" onClose={() => setMensajeError('')}>{mensajeError}</Alert>
      )}
      {mensajeExito && (
        <Alert type="success" onClose={() => setMensajeExito('')}>{mensajeExito}</Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <FichaProductoSubasta key={subasta.id} subasta={subasta} vendedor={vendedor} />
          <PanelContactoSubasta
            subasta={subasta}
            vendedor={vendedor}
            ganador={ganador}
            puedeVerContactoDesbloqueado={puedeVerContactoDesbloqueado}
            esVendedor={esVendedor}
          />
        </div>

        <PanelPujasSubasta
          key={subasta.id}
          subasta={subasta}
          pujasSubasta={pujasSubasta}
          usuarios={usuarios}
          usuarioActual={usuarioActual}
          ahoraMs={ahoraMs}
          esVendedor={esVendedor}
          alCrearPuja={crearPuja}
          alExito={setMensajeExito}
          alError={setMensajeError}
        />
      </div>
    </div>
  );
}
