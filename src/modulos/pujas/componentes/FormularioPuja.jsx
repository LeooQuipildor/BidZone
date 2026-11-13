/**
 * ==============================================================================
 * ARCHIVO: src/modulos/pujas/componentes/FormularioPuja.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de formulario para ofertar en una subasta o editar la nota de una puja existente.
 * Aplica rigurosamente la Regla de Negocio RN04 sobre la irrevocabilidad económica de las ofertas.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. En modo Creación:
 *    - Filtra únicamente subastas activas (`subastas.filter(s => s.status === 'activa')`).
 *    - Permite al usuario elegir un lote desde un `<Select>`.
 *    - Sugiere el importe mínimo válido con `obtenerMontoPujaSugerido` (RN01).
 *    - Exige tildar la casilla de aceptación vinculante `CasillaCompromisoPuja`.
 *    - Abre el modal de confirmación `ModalConfirmarPuja` antes de enviar la oferta.
 * 2. En modo Edición (Regla RN04):
 *    - Congela permanentemente el selector de subasta y el campo de monto (`disabled={estaEditando}`).
 *    - Solo permite editar la nota o comentario de coordinación (`nota`), impidiendo alterar
 *      o retirar el importe económico comprometido.
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * - `puja`: Objeto de la puja a modificar (o `null` para crear).
 * - `subastas`: Lista de subastas disponibles (de `tiendaSubastas`).
 * - `alCrearPuja`: Función asíncrona de creación de la tienda.
 * - `alActualizarPuja`: Función asíncrona de actualización de nota.
 * - `alGuardar`: Callback para notificar éxito al componente padre.
 * - `alCancelar`: Callback para volver atrás.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Inmutabilidad Parcial de un Formulario:
 *   Demuestra cómo un mismo formulario puede operar en dos modos diferentes (Crear vs Editar)
 *   inhabilitando selectivamente campos críticos para salvaguardar la confianza de la plataforma.
 * - Cálculo de Sugerido Dinámico:
 *   Al cambiar la subasta seleccionada en el dropdown (`manejarCambioSubasta`), el input del monto
 *   se recalcula al instante con el precio actual + incremento mínimo del nuevo artículo elegido.
 */

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

export function FormularioPuja({
  puja = null,
  subastas = [],
  alCrearPuja,
  alActualizarPuja,
  alGuardar,
  alCancelar,
}) {
  const estaEditando = Boolean(puja);

  // Subastas que admiten ofertas actualmente
  const subastasActivas = subastas.filter((subasta) => subasta.status === 'activa');

  // Identificador de la subasta seleccionada en el formulario
  const [idSubastaElegida, setIdSubastaElegida] = useState(puja ? String(puja.auctionId) : '');
  const idSubastaEfectiva = estaEditando
    ? String(puja.auctionId)
    : elegirIdValido(subastasActivas, idSubastaElegida);

  // Subasta activa en el formulario
  const subastaSeleccionada = buscarPorId(
    estaEditando ? subastas : subastasActivas,
    idSubastaEfectiva
  );
  const montoSugerido = obtenerMontoPujaSugerido(subastaSeleccionada);
  const maximoPermitido = obtenerMontoPujaMaximo(subastaSeleccionada);

  // Estados locales para los campos
  const [monto, setMonto] = useState(() => (puja ? String(puja.amount ?? '') : montoSugerido));
  const [nota, setNota] = useState(puja?.note || '');
  const [compromisoAceptado, setCompromisoAceptado] = useState(true);
  const [mensajeError, setMensajeError] = useState('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Caso límite: Al intentar crear una puja si no hay subastas abiertas
  if (!estaEditando && subastasActivas.length === 0) {
    return (
      <Alert type="info" title="Sin subastas activas">
        Actualmente no hay subastas activas disponibles para ofertar. Puedes publicar una o esperar nuevos lotes.
      </Alert>
    );
  }

  /**
   * Al cambiar de subasta en el selector, recalculamos el monto mínimo sugerido.
   */
  function manejarCambioSubasta(evento) {
    const nuevoId = evento.target.value;
    setIdSubastaElegida(nuevoId);
    const nuevaSubasta = buscarPorId(subastasActivas, nuevoId);
    setMonto(obtenerMontoPujaSugerido(nuevaSubasta));
  }

  /**
   * Manejador de envío: En edición solo guarda nota; en creación abre el modal de confirmación.
   */
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

  /**
   * Envía la nueva puja al servidor tras confirmar en el modal.
   */
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

  // Mapeo de subastas a opciones para el componente Select
  const opcionesSubastas = (estaEditando ? subastas : subastasActivas).map((subasta) => ({
    valor: String(subasta.id),
    etiqueta: `${subasta.title} (Actual: ${formatearMoneda(subasta.currentPrice)})`,
  }));

  // Texto explicativo del monto según el modo
  let textoAyudaMonto;
  if (estaEditando) {
    textoAyudaMonto = 'RN04: El monto ofertado es vinculante e irrevocable.';
  } else if (maximoPermitido) {
    textoAyudaMonto = `Máximo permitido (10x precio inicial): ${formatearMoneda(maximoPermitido)}`;
  }

  return (
    <>
      <form onSubmit={manejarEnvio} className="space-y-4">
        {/* Alerta explicativa de inmutabilidad RN04 en modo edición */}
        {estaEditando && (
          <Alert type="info" title="Regla de Negocio RN04 (Irrevocabilidad del Monto)">
            Puedes actualizar tu nota de coordinación, pero el importe ofertado no se modifica.
          </Alert>
        )}

        {mensajeError && (
          <Alert type="error" onClose={() => setMensajeError('')}>{mensajeError}</Alert>
        )}

        {/* Fila 1: Selector de subasta y monto (bloqueados en edición) */}
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

        {/* Resumen de números de la subasta seleccionada */}
        {!estaEditando && (
          <ResumenOfertaSubasta subasta={subastaSeleccionada} montoSugerido={montoSugerido} />
        )}

        {/* Campo de nota o mensaje del postor */}
        <Input
          id="nota"
          label="Nota de Coordinación / Observación"
          placeholder="Ej: Pago por transferencia inmediata al liberarse el contacto."
          value={nota}
          onChange={(evento) => setNota(evento.target.value)}
        />

        {/* Casilla legal obligatoria RN04 */}
        {!estaEditando && (
          <CasillaCompromisoPuja aceptado={compromisoAceptado} alCambiar={setCompromisoAceptado} />
        )}

        {/* Botones de acción */}
        <AccionesFormulario
          alCancelar={alCancelar}
          textoGuardar={estaEditando ? 'Guardar Cambios' : 'Confirmar Puja'}
          iconoGuardar={estaEditando ? <Save className="w-4 h-4" /> : <Gavel className="w-4 h-4" />}
        />
      </form>

      {/* Modal flotante de verificación antes del envío */}
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
