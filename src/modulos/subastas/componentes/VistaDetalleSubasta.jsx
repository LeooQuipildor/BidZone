import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Trash2, Trophy } from 'lucide-react';
import { useStoreAuctions } from '../estado/storeAuctions';
import { useStoreBids } from '../../pujas/estado/storeBids';
import { useStoreAuthentication } from '../../autenticacion/estado/storeAuthentication';
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

  const subastas = useStoreAuctions((estado) => estado.subastas);
  const detalleSubastaActual = useStoreAuctions((estado) => estado.detalleSubastaActual);
  const cargandoDetalle = useStoreAuctions((estado) => estado.cargandoDetalle);
  const errorStore = useStoreAuctions((estado) => estado.error);
  const obtenerSubastaPorId = useStoreAuctions((estado) => estado.obtenerSubastaPorId);
  const eliminarSubasta = useStoreAuctions((estado) => estado.eliminarSubasta);

  const pujas = useStoreBids((estado) => estado.pujas);
  const crearPuja = useStoreBids((estado) => estado.crearPuja);
  const usuarioActual = useStoreAuthentication((estado) => estado.usuarioActual);
  const usuarios = useStoreAuthentication((estado) => estado.usuarios);

  // Estados locales para mensajes y modal de moderación
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [solicitandoEdicion, setSolicitandoEdicion] = useState(false);

  useEffect(() => {
    obtenerSubastaPorId(id);

    // Sondeo periódico cada 3 segundos para que si finaliza o hay nuevas pujas
    // aparezcan los datos en tiempo real sin tener que recargar la página
    const intervalo = setInterval(() => {
      obtenerSubastaPorId(id);
    }, 3000);

    return () => clearInterval(intervalo);
  }, [id, usuarioActual?.id, obtenerSubastaPorId]);

  // Resolución de la subasta a partir del caché o del detalle cargado
  const detalleEncontrado =
    detalleSubastaActual && mismoId(detalleSubastaActual.id, id) ? detalleSubastaActual : null;
  const subasta = detalleEncontrado || buscarPorId(subastas, id);

  const ahoraMs = useRelojSegundo(Boolean(subasta?.fechaFin && subasta?.estado === 'activa'));

  // Estado de carga inicial
  if (cargandoDetalle && !subasta) return <Loading text="Cargando subasta..." />;

  // Estado de error si el ID no corresponde a ninguna subasta existente
  if (!subasta) {
    return (
      <ErrorCard
        title="Subasta no encontrada"
        message={errorStore || 'El artículo que buscas no existe o fue eliminado.'}
        backLabel="Volver al catálogo"
        onBack={() => navegar('/subastas')}
      />
    );
  }

  const {
    pujasSubasta,
    vendedor,
    ganador,
    esVendedor,
    esAdmin,
    esGanador,
    esFinalizada,
    puedeVerContactoDesbloqueado,
  } = prepararDatosDetalleSubasta({
    subasta,
    detalleEncontrado,
    pujas,
    usuarios,
    usuarioActual,
    ahoraMs,
  });

  async function manejarEliminacionAdmin() {
    if (!window.confirm(`¿Confirmas cancelar y eliminar la subasta "${subasta.titulo}"?`)) {
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
      {/* Barra superior de navegación y acciones rápidas según el rol */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <Button variant="outline" size="sm" onClick={() => navegar('/subastas')}>
          <ArrowLeft className="w-4 h-4" />
          Volver al Catálogo
        </Button>

        {/* Acciones de Propietario o Administrador */}
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

      {/* Modal de moderación disciplinaria si el administrador solicita revisión */}
      <PanelSolicitudCorreccion
        enModal
        subasta={solicitandoEdicion ? subasta : null}
        alExito={(texto) => {
          setMensajeExito(texto);
          setSolicitandoEdicion(false);
        }}
        alCancelar={() => setSolicitandoEdicion(false)}
      />

      {/* Alertas de error o éxito en pantalla */}
      {mensajeError && (
        <Alert type="error" onClose={() => setMensajeError('')}>{mensajeError}</Alert>
      )}
      {mensajeExito && (
        <Alert type="success" onClose={() => setMensajeExito('')}>{mensajeExito}</Alert>
      )}

      {/* Banner destacado de felicitación al ganador cuando la subasta finaliza */}
      {esGanador && esFinalizada && (
        <div className="rounded-3xl bg-gradient-to-r from-[#224F10] via-[#1a3d0c] to-[#0D0D0D] text-[#EAFFD0] p-6 sm:p-8 border-2 border-[#B0E454] shadow-xl flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#B0E454] text-[#0D0D0D] flex items-center justify-center shrink-0 shadow-md">
            <Trophy className="w-8 h-8 text-[#224F10]" />
          </div>
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#B0E454] bg-[#B0E454]/15 px-3 py-0.5 rounded-full inline-block">
              ¡Adjudicación Confirmada!
            </span>
            <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#EAFFD0]">
              ¡Felicidades, eres el ganador de la subasta!
            </h2>
            <p className="text-xs sm:text-sm text-[#EAFFD0]/90 leading-relaxed max-w-2xl">
              Has ganado este artículo con la oferta líder. A continuación tienes habilitados los datos de contacto oficiales del vendedor para coordinar el pago y la entrega directa.
            </p>
          </div>
        </div>
      )}

      {/* Cuadrícula de 12 columnas: 7 para producto/contacto y 5 para pujas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna Izquierda: Ficha del Producto y Panel de Contacto Directo RN05 */}
        <div className="lg:col-span-7 space-y-6">
          <FichaProductoSubasta key={subasta.id} subasta={subasta} vendedor={vendedor} />
          <PanelContactoSubasta
            subasta={subasta}
            vendedor={vendedor}
            ganador={ganador}
            puedeVerContactoDesbloqueado={puedeVerContactoDesbloqueado}
            esVendedor={esVendedor}
            esGanador={esGanador}
            esFinalizada={esFinalizada}
          />
        </div>

        {/* Columna Derecha: Consola de Ofertas e Historial Auditable de Pujas */}
        <PanelPujasSubasta
          key={subasta.id}
          subasta={subasta}
          pujasSubasta={pujasSubasta}
          usuarios={usuarios}
          usuarioActual={usuarioActual}
          ahoraMs={ahoraMs}
          esVendedor={esVendedor}
          esGanador={esGanador}
          esFinalizada={esFinalizada}
          alCrearPuja={crearPuja}
          alExito={setMensajeExito}
          alError={setMensajeError}
        />
      </div>
    </div>
  );
}
