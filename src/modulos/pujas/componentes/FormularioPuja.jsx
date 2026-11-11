import React, { useState } from 'react';
import { Gavel, Save } from 'lucide-react';
import { ModalConfirmarPuja } from './ModalConfirmarPuja';
import { CasillaCompromisoPuja, ResumenOfertaSubasta } from './BloquesPuja';
import {
  buscarPorId,
  elegirIdValido,
  obtenerMontoPujaMaximo,
  obtenerMontoPujaSugerido,
  validarDatosPuja,
} from '../../nucleo/utilidades/ayudas';
import { formatearMoneda } from '../../nucleo/utilidades/formatos';
import { Input, Select } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import { AccionesFormulario } from '../../nucleo/diseno/componentesBloques';

// Formulario único para crear o editar una puja vinculante (Panel y vistas /new y /edit)
export function FormularioPuja({
  puja = null,
  subastas = [],
  esAdmin = false,
  alCrearPuja,
  alActualizarPuja,
  alGuardar,
  alCancelar,
}) {
  const estaEditando = Boolean(puja);
  const subastasActivas = subastas.filter((subasta) => subasta.status === 'activa');

  const [idSubastaElegida, setIdSubastaElegida] = useState(puja ? String(puja.auctionId) : '');
  const [montoIngresado, setMontoIngresado] = useState(puja ? String(puja.amount ?? '') : null);
  const [nota, setNota] = useState(puja?.note || '');
  const [compromisoAceptado, setCompromisoAceptado] = useState(true);
  const [mensajeError, setMensajeError] = useState('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const idSubastaEfectiva = estaEditando
    ? String(puja.auctionId)
    : elegirIdValido(subastasActivas, idSubastaElegida);
  const subastaSeleccionada = buscarPorId(
    estaEditando ? subastas : subastasActivas,
    idSubastaEfectiva
  );
  const montoSugerido = obtenerMontoPujaSugerido(subastaSeleccionada);
  const maximoPermitido = obtenerMontoPujaMaximo(subastaSeleccionada);
  const montoActualInput = montoIngresado !== null ? montoIngresado : montoSugerido;

  if (!estaEditando && subastasActivas.length === 0) {
    return (
      <Alert type="info" title="Sin subastas activas">
        Actualmente no hay subastas activas disponibles para ofertar. Puedes publicar una o esperar nuevos lotes.
      </Alert>
    );
  }

  function manejarCambioSubasta(evento) {
    setIdSubastaElegida(evento.target.value);
    if (!estaEditando) setMontoIngresado(null);
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError('');

    if (estaEditando) {
      const cambios = esAdmin ? { monto: Number(montoActualInput), nota: nota.trim() } : { nota: nota.trim() };
      try {
        const actualizada = await alActualizarPuja(puja.id, cambios);
        alGuardar?.(actualizada, montoActualInput);
      } catch (error) {
        setMensajeError(error.message);
      }
      return;
    }

    const errorValidacion = validarDatosPuja({
      subasta: subastaSeleccionada,
      monto: montoActualInput,
      compromisoAceptado,
    });
    if (errorValidacion) {
      setMensajeError(errorValidacion);
      return;
    }
    setMostrarConfirmacion(true);
  }

  async function confirmarEnvioPuja() {
    setEnviando(true);
    setMensajeError('');
    try {
      const creada = await alCrearPuja({
        idSubasta: idSubastaEfectiva,
        monto: montoActualInput,
        nota,
        compromisoAceptado,
      });
      setMostrarConfirmacion(false);
      alGuardar?.(creada, montoActualInput);
    } catch (error) {
      setMostrarConfirmacion(false);
      setMensajeError(error.message);
    } finally {
      setEnviando(false);
    }
  }

  const opcionesSubastas = (estaEditando ? subastas : subastasActivas).map((subasta) => ({
    value: String(subasta.id),
    label: `${subasta.title} (Actual: ${formatearMoneda(subasta.currentPrice)})`,
  }));

  let textoAyudaMonto;
  if (estaEditando && !esAdmin) {
    textoAyudaMonto = 'RN04: El monto ofertado es vinculante e irrevocable.';
  } else if (maximoPermitido) {
    textoAyudaMonto = `Máximo permitido (10x precio inicial): ${formatearMoneda(maximoPermitido)}`;
  }

  return (
    <>
      <form onSubmit={manejarEnvio} className="space-y-4">
        {estaEditando && !esAdmin && (
          <Alert type="info" title="Regla de Negocio RN04 (Irrevocabilidad del Monto)">
            Como postor puedes actualizar tu nota de coordinación, pero el importe ofertado es irrevocable.
          </Alert>
        )}

        {mensajeError && (
          <Alert type="error" onClose={() => setMensajeError('')}>{mensajeError}</Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            id="idSubasta"
            label={estaEditando ? 'Subasta Asociada' : 'Seleccionar Subasta Activa *'}
            disabled={estaEditando}
            value={idSubastaEfectiva}
            onChange={manejarCambioSubasta}
            options={opcionesSubastas}
          />
          <Input
            id="monto"
            type="number"
            label="Monto de la Oferta (ARS) *"
            disabled={estaEditando && !esAdmin}
            max={maximoPermitido}
            helperText={textoAyudaMonto}
            value={montoActualInput}
            onChange={(evento) => setMontoIngresado(evento.target.value)}
          />
        </div>

        {!estaEditando && <ResumenOfertaSubasta subasta={subastaSeleccionada} montoSugerido={montoSugerido} />}

        <Input
          id="nota"
          label="Nota de Coordinación / Observación"
          placeholder="Ej: Pago por transferencia inmediata al liberarse el contacto."
          value={nota}
          onChange={(evento) => setNota(evento.target.value)}
        />

        {!estaEditando && (
          <CasillaCompromisoPuja aceptado={compromisoAceptado} alCambiar={setCompromisoAceptado} />
        )}

        <AccionesFormulario
          alCancelar={alCancelar}
          textoGuardar={estaEditando ? 'Guardar Cambios' : 'Confirmar Puja'}
          iconoGuardar={estaEditando ? <Save className="w-4 h-4" /> : <Gavel className="w-4 h-4" />}
        />
      </form>

      <ModalConfirmarPuja
        estaAbierto={mostrarConfirmacion}
        alCerrar={() => setMostrarConfirmacion(false)}
        alConfirmar={confirmarEnvioPuja}
        enviando={enviando}
        subasta={subastaSeleccionada}
        montoPuja={montoActualInput}
        notaPuja={nota}
      />
    </>
  );
}
