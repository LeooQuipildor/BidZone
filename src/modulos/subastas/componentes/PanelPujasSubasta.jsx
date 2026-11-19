import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Gavel } from 'lucide-react';
import { ModalConfirmarPuja } from '../../pujas/componentes/ModalConfirmarPuja';
import { CasillaCompromisoPuja } from '../../pujas/componentes/BloquesPuja';
import { HistorialPujasSubasta } from './HistorialPujasSubasta';
import { Button, Input, Badge, Card } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import { calcularTiempoRestante, formatearMoneda } from '../../nucleo/utilidades/formatos';
import {
  mismoId,
  obtenerMontoPujaMaximo,
  obtenerMontoPujaSugerido,
  validarDatosPuja,
} from '../../nucleo/utilidades/ayudas';

export function PanelPujasSubasta({
  subasta,
  pujasSubasta,
  usuarios,
  usuarioActual,
  ahoraMs,
  esVendedor,
  esGanador = false,
  esFinalizada = false,
  alCrearPuja,
  alExito,
  alError,
}) {
  const navegar = useNavigate();

  const [montoIngresado, setMontoIngresado] = useState(() => obtenerMontoPujaSugerido(subasta));
  const [notaPuja, setNotaPuja] = useState('');
  const [compromisoAceptado, setCompromisoAceptado] = useState(true);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const fechaFinMs = new Date(subasta.fechaFin).getTime();
  const tiempoExpirado = !Number.isNaN(fechaFinMs) && fechaFinMs <= ahoraMs;
  const esActiva = subasta.estado === 'activa' && !tiempoExpirado && !esFinalizada;
  const tiempoRestante = subasta.fechaFin
    ? calcularTiempoRestante(subasta.fechaFin, ahoraMs)
    : { textoFormateado: '—' };
  const montoSugerido = obtenerMontoPujaSugerido(subasta);
  const montoMaximoPermitido = obtenerMontoPujaMaximo(subasta);

  // Verificación de liderazgo en las ofertas
  const mejorPuja = pujasSubasta[0] || null;
  const esPostorLider = Boolean(
    usuarioActual && mejorPuja && mismoId(mejorPuja.postorId, usuarioActual.id)
  );
  const yaParticipo = Boolean(
    usuarioActual && pujasSubasta.some((puja) => mismoId(puja.postorId, usuarioActual.id))
  );

  function abrirConfirmacion(evento) {
    evento.preventDefault();
    alError('');
    alExito('');

    // Si no inició sesión, lo enviamos al login
    if (!usuarioActual) {
      navegar('/iniciar-sesion');
      return;
    }

    // Validación completa mediante la función de negocio
    const errorValidacion = validarDatosPuja({
      subasta,
      monto: montoIngresado,
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
    const montoConfirmado = montoIngresado;

    try {
      await alCrearPuja({
        idSubasta: subasta.id,
        monto: montoConfirmado,
        nota: notaPuja,
        compromisoAceptado,
      });
      setMostrarConfirmacion(false);

      // Preparamos el siguiente monto sugerido para la próxima puja
      const siguienteSugerido = Number(montoConfirmado) + Number(subasta.incrementoMinimo);
      setMontoIngresado(String(siguienteSugerido));
      setNotaPuja('');
      alExito(
        `¡Tu oferta de ${formatearMoneda(montoConfirmado)} fue registrada exitosamente! Ahora eres el postor líder.`
      );
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
        {/* Cabecera de la consola: Oferta líder y cronómetro */}
        <div className="flex items-center justify-between border-b border-[#224F10]/15 pb-4">
          <div>
            <span className="text-[11px] text-[#0D0D0D]/60 block">Oferta Líder Actual</span>
            <p className="font-serif-display text-4xl font-semibold text-[#224F10]">
              {formatearMoneda(subasta.precioActual)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#0D0D0D]/60 block">Tiempo Restante</span>
            <p className="text-sm font-mono font-bold text-[#0D0D0D] flex items-center justify-end gap-1.5 mt-1">
              <Clock className="w-4 h-4 text-[#224F10]" />
              {esActiva ? tiempoRestante.textoFormateado : 'Finalizada'}
            </p>
          </div>
        </div>

        {/* Insignias reactivas de estado del postor */}
        {esGanador && (
          <Badge variant="lime" className="w-full justify-center py-2.5 font-bold text-xs">
            🏆 ¡Felicidades! Eres el ganador de esta subasta
          </Badge>
        )}
        {usuarioActual && esActiva && esPostorLider && (
          <Badge variant="lime" className="w-full justify-center py-2">
            ★ Eres el postor líder actual en esta subasta
          </Badge>
        )}
        {usuarioActual && esActiva && !esPostorLider && yaParticipo && (
          <Badge variant="success" className="w-full justify-center py-2">
            ⚠ Tu oferta fue superada — Puja nuevamente para liderar
          </Badge>
        )}

        {/* Mensaje de cierre definitivo si la subasta terminó (RN03) */}
        {!esActiva && (
          <div className="bg-[#0D0D0D] text-[#EAFFD0] p-4 rounded-2xl text-center text-xs font-medium">
            Esta subasta se encuentra cerrada y ya no admite nuevas pujas (RN03).
          </div>
        )}

        {/* Bloqueo por auto-puja para el vendedor del artículo (RN02) */}
        {esActiva && esVendedor && (
          <Alert type="info" title="Eres el dueño de este artículo (RN02)">
            Como vendedor no puedes realizar auto-pujas sobre tu propia publicación. Al cumplirse la fecha de cierre se adjudicará automáticamente al mejor postor.
          </Alert>
        )}

        {/* Formulario de puja para postores compradores */}
        {esActiva && !esVendedor && (
          <form onSubmit={abrirConfirmacion} className="space-y-4">
            <Input
              id="montoPuja"
              type="number"
              label={`Tu Oferta en ARS (Mínimo ${formatearMoneda(montoSugerido)})`}
              helperText={`Máximo permitido: ${formatearMoneda(montoMaximoPermitido)} (10 veces el precio inicial)`}
              max={montoMaximoPermitido}
              value={montoIngresado}
              onChange={(evento) => setMontoIngresado(evento.target.value)}
            />
            <Input
              id="notaPuja"
              label="Nota de coordinación (Opcional)"
              placeholder="Ej: Pago en efectivo o transferencia y retiro en el día"
              value={notaPuja}
              onChange={(evento) => setNotaPuja(evento.target.value)}
            />

            {/* Casilla de aceptación del compromiso vinculante (RN04) */}
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
        )}
      </Card>

      {/* Historial público de todas las ofertas recibidas */}
      <HistorialPujasSubasta pujas={pujasSubasta} usuarios={usuarios} />

      {/* Modal flotante de confirmación previa al despacho de la puja */}
      <ModalConfirmarPuja
        estaAbierto={mostrarConfirmacion}
        alCerrar={() => setMostrarConfirmacion(false)}
        alConfirmar={confirmarEnvioPuja}
        enviando={enviando}
        subasta={subasta}
        montoPuja={montoIngresado}
        notaPuja={notaPuja}
      />
    </div>
  );
}
