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

// Formulario único para crear o editar la nota de una puja vinculante (RN04: el monto nunca se edita)
export function FormularioPuja({
  puja = null,
  subastas = [],
  alCrearPuja,
  alActualizarPuja,
  alGuardar,
  alCancelar,
}) {
  const estaEditando = Boolean(puja);
  const subastasActivas = subastas.filter((subasta) => subasta.status === 'activa');

  const [idSubastaElegida, setIdSubastaElegida] = useState(puja ? String(puja.auctionId) : '');
  const idSubastaEfectiva = estaEditando
    ? String(puja.auctionId)
    : elegirIdValido(subastasActivas, idSubastaElegida);

  const subastaSeleccionada = buscarPorId(
    estaEditando ? subastas : subastasActivas,
    idSubastaEfectiva
  );
  const montoSugerido = obtenerMontoPujaSugerido(subastaSeleccionada);
  const maximoPermitido = obtenerMontoPujaMaximo(subastaSeleccionada);

  const [monto, setMonto] = useState(() => (puja ? String(puja.amount ?? '') : montoSugerido));
  const [nota, setNota] = useState(puja?.note || '');
  const [compromisoAceptado, setCompromisoAceptado] = useState(true);
  const [mensajeError, setMensajeError] = useState('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!estaEditando && subastasActivas.length === 0) {
    return (
      <Alert type="info" title="Sin subastas activas">
        Actualmente no hay subastas activas disponibles para ofertar. Puedes publicar una o esperar nuevos lotes.
      </Alert>
    );
  }

  function manejarCambioSubasta(evento) {
    const nuevoId = evento.target.value;
    setIdSubastaElegida(nuevoId);
    const nuevaSubasta = buscarPorId(subastasActivas, nuevoId);
    setMonto(obtenerMontoPujaSugerido(nuevaSubasta));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError('');

    if (estaEditando) {
      try {
        const actualizada = await alActualizarPuja(puja.id, { nota: nota.trim() });
        alGuardar?.(actualizada, monto);
      } catch (error) {
        setMensajeError(error.message);
      }
      return;
    }

    const errorValidacion = validarDatosPuja({
      subasta: subastaSeleccionada,
      monto,
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
        monto,
        nota,
        compromisoAceptado,
      });
      setMostrarConfirmacion(false);
      alGuardar?.(creada, monto);
    } catch (error) {
      setMostrarConfirmacion(false);
      setMensajeError(error.message);
    } finally {
      setEnviando(false);
    }
  }

  const opcionesSubastas = (estaEditando ? subastas : subastasActivas).map((subasta) => ({
    valor: String(subasta.id),
    etiqueta: `${subasta.title} (Actual: ${formatearMoneda(subasta.currentPrice)})`,
  }));

  let textoAyudaMonto;
  if (estaEditando) {
    textoAyudaMonto = 'RN04: El monto ofertado es vinculante e irrevocable.';
  } else if (maximoPermitido) {
    textoAyudaMonto = `Máximo permitido (10x precio inicial): ${formatearMoneda(maximoPermitido)}`;
  }

  return (
    <>
      <form onSubmit={manejarEnvio} className="space-y-4">
        {estaEditando && (
          <Alert type="info" title="Regla de Negocio RN04 (Irrevocabilidad del Monto)">
            Puedes actualizar tu nota de coordinación, pero el importe ofertado no se modifica.
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
            disabled={estaEditando}
            max={maximoPermitido}
            helperText={textoAyudaMonto}
            value={monto}
            onChange={(evento) => setMonto(evento.target.value)}
          />
        </div>

        {!estaEditando && (
          <ResumenOfertaSubasta subasta={subastaSeleccionada} montoSugerido={montoSugerido} />
        )}

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
        montoPuja={monto}
        notaPuja={nota}
      />
    </>
  );
}
