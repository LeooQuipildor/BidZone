import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Gavel } from 'lucide-react';
import { ModalConfirmarPuja } from '../../pujas/componentes/ModalConfirmarPuja';
import { CasillaCompromisoPuja } from '../../pujas/componentes/BloquesPuja';
import { HistorialPujasSubasta } from './HistorialPujasSubasta';
import { Button, Input, Badge, Card } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import {
  calcularTiempoRestante,
  formatearMoneda,
} from '../../nucleo/utilidades/formatos';
import {
  mismoId,
  obtenerMontoPujaMaximo,
  obtenerMontoPujaSugerido,
  validarDatosPuja,
} from '../../nucleo/utilidades/ayudas';

// Columna derecha del detalle de subasta: formulario para ofertar en vivo e historial auditable
export function PanelPujasSubasta({
  subasta,
  pujasSubasta,
  usuarios,
  usuarioActual,
  ahoraMs,
  esVendedor,
  alCrearPuja,
  alExito,
  alError,
}) {
  const navegar = useNavigate();
  const [montoPersonalizado, setMontoPersonalizado] = useState(null);
  const [notaPuja, setNotaPuja] = useState('');
  const [compromisoAceptado, setCompromisoAceptado] = useState(true);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const tiempoRestante = subasta.endTime
    ? calcularTiempoRestante(subasta.endTime, ahoraMs)
    : { textoFormateado: '—' };
  const montoSugerido = obtenerMontoPujaSugerido(subasta);
  const montoMaximoPermitido = obtenerMontoPujaMaximo(subasta);
  const montoActualInput = montoPersonalizado !== null ? montoPersonalizado : montoSugerido;

  const mejorPuja = pujasSubasta[0] || null;
  const esPostorLider = Boolean(
    usuarioActual && mejorPuja && mismoId(mejorPuja.bidderId, usuarioActual.id)
  );
  const yaParticipo = Boolean(
    usuarioActual && pujasSubasta.some((puja) => mismoId(puja.bidderId, usuarioActual.id))
  );

  function abrirConfirmacion(evento) {
    evento.preventDefault();
    alError('');
    alExito('');

    if (!usuarioActual) {
      navegar('/login');
      return;
    }

    const errorValidacion = validarDatosPuja({
      subasta,
      monto: montoActualInput,
      compromisoAceptado,
    });
    if (errorValidacion) {
      alError(errorValidacion);
      return;
    }
    setMostrarConfirmacion(true);
  }

  async function confirmarEnvioPuja() {
    setEnviando(true);
    alError('');
    alExito('');
    const montoConfirmado = montoActualInput;

    try {
      await alCrearPuja({
        idSubasta: subasta.id,
        monto: montoConfirmado,
        nota: notaPuja,
        compromisoAceptado,
      });
      setMostrarConfirmacion(false);
      alExito(
        `¡Tu oferta de ${formatearMoneda(montoConfirmado)} fue registrada exitosamente! Ahora eres el postor líder.`
      );
      setMontoPersonalizado(null);
      setNotaPuja('');
    } catch (error) {
      setMostrarConfirmacion(false);
      alError(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="lg:col-span-5 space-y-6">
      <Card className="space-y-5">
        <div className="flex items-center justify-between border-b border-[#224F10]/15 pb-4">
          <div>
            <span className="text-[11px] text-[#0D0D0D]/60 block">Oferta Líder Actual</span>
            <p className="font-serif-display text-4xl font-semibold text-[#224F10]">
              {formatearMoneda(subasta.currentPrice)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#0D0D0D]/60 block">Tiempo Restante</span>
            <p className="text-sm font-mono font-bold text-[#0D0D0D] flex items-center justify-end gap-1.5 mt-1">
              <Clock className="w-4 h-4 text-[#224F10]" />
              {subasta.status === 'activa' ? tiempoRestante.textoFormateado : 'Finalizada'}
            </p>
          </div>
        </div>

        {usuarioActual && subasta.status === 'activa' && esPostorLider && (
          <Badge variant="lime" className="w-full justify-center py-2">
            ★ Eres el postor líder actual en esta subasta
          </Badge>
        )}
        {usuarioActual && subasta.status === 'activa' && !esPostorLider && yaParticipo && (
          <Badge variant="success" className="w-full justify-center py-2">
            ⚠ Tu oferta fue superada — Puja nuevamente para liderar
          </Badge>
        )}

        {subasta.status === 'activa' ? (
          esVendedor ? (
            <Alert type="info" title="Eres el dueño de este artículo (RN02)">
              Como vendedor no puedes realizar auto-pujas sobre tu propia publicación. Puedes finalizar y adjudicar la subasta desde el botón superior.
            </Alert>
          ) : (
            <form onSubmit={abrirConfirmacion} className="space-y-4">
              <Input
                id="montoPuja"
                type="number"
                label={`Tu Oferta en ARS (Mínimo ${formatearMoneda(montoSugerido)})`}
                helperText={`Máximo permitido: ${formatearMoneda(montoMaximoPermitido)} (10 veces el precio inicial)`}
                max={montoMaximoPermitido}
                value={montoActualInput}
                onChange={(evento) => setMontoPersonalizado(evento.target.value)}
              />
              <Input
                id="notaPuja"
                label="Nota de coordinación (Opcional)"
                placeholder="Ej: Pago en efectivo o transferencia y retiro en el día"
                value={notaPuja}
                onChange={(evento) => setNotaPuja(evento.target.value)}
              />

              <CasillaCompromisoPuja
                aceptado={compromisoAceptado}
                alCambiar={setCompromisoAceptado}
                textoDetallado
              />

              <Button type="submit" size="lg" className="w-full">
                <Gavel className="w-4 h-4" />
                Enviar Oferta Vinculante
              </Button>
            </form>
          )
        ) : (
          <div className="bg-[#0D0D0D] text-[#EAFFD0] p-4 rounded-2xl text-center text-xs font-medium">
            Esta subasta se encuentra cerrada y ya no admite nuevas pujas (RN03).
          </div>
        )}
      </Card>

      <HistorialPujasSubasta pujas={pujasSubasta} usuarios={usuarios} />

      <ModalConfirmarPuja
        estaAbierto={mostrarConfirmacion}
        alCerrar={() => setMostrarConfirmacion(false)}
        alConfirmar={confirmarEnvioPuja}
        enviando={enviando}
        subasta={subasta}
        montoPuja={montoActualInput}
        notaPuja={notaPuja}
      />
    </div>
  );
}
