import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { usarTiendaSubastas } from '../estado/tiendaSubastas';
import { usarTiendaPujas } from '../../pujas/estado/tiendaPujas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { FichaProductoSubasta } from './FichaProductoSubasta';
import { PanelContactoSubasta } from './PanelContactoSubasta';
import { PanelPujasSubasta } from './PanelPujasSubasta';
import { Button } from '../../nucleo/diseno/ui';
import { Alert, Loading, ErrorCard } from '../../nucleo/diseno/uiFeedback';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';

export function VistaDetalleSubasta() {
  const { id } = useParams();
  const navegar = useNavigate();

  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const detalleSubastaActual = usarTiendaSubastas((estado) => estado.detalleSubastaActual);
  const cargandoDetalle = usarTiendaSubastas((estado) => estado.cargandoDetalle);
  const errorTienda = usarTiendaSubastas((estado) => estado.error);
  const obtenerSubastaPorId = usarTiendaSubastas((estado) => estado.obtenerSubastaPorId);
  const cerrarSubastaAhora = usarTiendaSubastas((estado) => estado.cerrarSubastaAhora);

  const pujas = usarTiendaPujas((estado) => estado.pujas);
  const crearPuja = usarTiendaPujas((estado) => estado.crearPuja);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);
  const usuarios = usarTiendaAutenticacion((estado) => estado.usuarios);

  const [ahoraMs, setAhoraMs] = useState(() => Date.now());
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  useEffect(() => {
    obtenerSubastaPorId(id);
  }, [id, usuarioActual?.id, obtenerSubastaPorId]);

  const detalleEncontrado =
    detalleSubastaActual && mismoId(detalleSubastaActual.id, id) ? detalleSubastaActual : null;
  const subasta = detalleEncontrado || buscarPorId(subastas, id);

  useEffect(() => {
    if (!subasta?.endTime || subasta?.status !== 'activa') return;
    const reloj = setInterval(() => setAhoraMs(Date.now()), 1000);
    return () => clearInterval(reloj);
  }, [subasta?.endTime, subasta?.status]);

  if (cargandoDetalle && !subasta) return <Loading text="Cargando subasta..." />;

  if (!subasta) {
    return (
      <ErrorCard
        title="Subasta no encontrada"
        message={errorTienda || 'El artículo que buscas no existe o fue eliminado.'}
        backLabel="Volver al catálogo"
        onBack={() => navegar('/auctions')}
      />
    );
  }

  const pujasSinOrdenar = Array.isArray(detalleEncontrado?.bids)
    ? detalleEncontrado.bids
    : pujas.filter((puja) => mismoId(puja.auctionId, subasta.id));
  const pujasSubasta = [...pujasSinOrdenar].sort(
    (pujaA, pujaB) => Number(pujaB.amount) - Number(pujaA.amount)
  );

  const vendedor = detalleEncontrado?.seller ||
    buscarPorId(usuarios, subasta.sellerId) || {
      id: subasta.sellerId,
      name: subasta.sellerName || 'Vendedor',
      reputation: subasta.sellerReputation || 5.0,
    };

  let ganador = detalleEncontrado?.winner || null;
  if (!ganador && subasta.winnerId) {
    ganador = buscarPorId(usuarios, subasta.winnerId) || {
      id: subasta.winnerId,
      name: subasta.winnerName || 'Ganador',
    };
  }

  const esVendedor = Boolean(usuarioActual && mismoId(usuarioActual.id, subasta.sellerId));
  const esAdmin = usuarioActual?.role === 'admin';
  const puedeVerContactoDesbloqueado = detalleEncontrado
    ? Boolean(detalleEncontrado.contactUnlocked)
    : Boolean(
        subasta.status === 'finalizada' &&
          ganador &&
          usuarioActual &&
          (esVendedor || esAdmin || mismoId(usuarioActual.id, ganador.id))
      );

  async function manejarCierreInmediato() {
    if (
      !window.confirm(
        '¿Deseas finalizar la subasta ahora? Se adjudicará al postor líder y se liberarán los contactos.'
      )
    ) {
      return;
    }
    setMensajeError('');
    setMensajeExito('');
    try {
      await cerrarSubastaAhora(subasta.id);
      setMensajeExito('Subasta finalizada. Se han liberado los datos de contacto entre el vendedor y el ganador.');
    } catch (error) {
      setMensajeError(error.message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <Button variant="outline" size="sm" onClick={() => navegar('/auctions')}>
          <ArrowLeft className="w-4 h-4" />
          Volver al Catálogo
        </Button>

        {(esVendedor || esAdmin) && (
          <div className="flex items-center gap-2">
            {subasta.status === 'activa' && (
              <Button variant="secondary" size="sm" onClick={manejarCierreInmediato}>
                <CheckCircle2 className="w-4 h-4" />
                Finalizar y Adjudicar Ahora
              </Button>
            )}
            {esVendedor && (
              <Link to={`/auctions/${subasta.id}/edit`}>
                <Button variant="outline" size="sm">Editar Subasta</Button>
              </Link>
            )}
          </div>
        )}
      </div>

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
