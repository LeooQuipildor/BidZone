import React, { useState } from 'react';
import { Save, Star } from 'lucide-react';
import { buscarPorId, mismoId } from '../../nucleo/utilidades/ayudas';
import { obtenerValoresPorDefectoResena } from '../utilidades/ayudasResena';
import { Textarea } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import { AccionesFormulario } from '../../nucleo/diseno/componentesBloques';
import { CamposSeleccionResena, SelectorEstrellas } from './CamposResena';

export function FormularioResena({
  resena = null,
  subastasElegibles = [],
  otrosUsuarios = [],
  resenas = [],
  idUsuarioActual,
  idSubastaInicial = '',
  idUsuarioCalificadoInicial = '',
  alCrearResena,
  alActualizarResena,
  alGuardar,
  alCancelar,
}) {
  const estaEditando = Boolean(resena);

  const [datosFormulario, setDatosFormulario] = useState(() => ({
    idSubasta: idSubastaInicial,
    idUsuarioCalificado: idUsuarioCalificadoInicial,
    calificacion: resena ? String(resena.puntaje ?? '5') : '5',
    contextoRol: resena?.contextoRol || '',
    comentario: resena?.comentario || '',
  }));
  const [mensajeError, setMensajeError] = useState('');

  // Caso límite: El usuario no tiene transacciones concluidas para calificar
  if (!estaEditando && subastasElegibles.length === 0) {
    return (
      <Alert type="info" title="Sin operaciones calificables aún">
        Solo puedes calificar subastas finalizadas con ganador adjudicado en las que hayas participado.
      </Alert>
    );
  }

  // Subasta activa seleccionada para la reseña
  const subastaSeleccionada = !estaEditando
    ? buscarPorId(subastasElegibles, datosFormulario.idSubasta) || subastasElegibles[0] || null
    : null;

  // Cálculo de valores por defecto (contraparte y rol)
  const valoresDefecto = obtenerValoresPorDefectoResena(subastaSeleccionada, idUsuarioActual, otrosUsuarios);

  const idSubastaEfectiva = subastaSeleccionada ? String(subastaSeleccionada.id) : '';
  const idCalificadoEfectivo = datosFormulario.idUsuarioCalificado || valoresDefecto.idUsuarioCalificado;
  const rolEfectivo = datosFormulario.contextoRol || valoresDefecto.contextoRol;

  // Booleano que indica si el usuario logueado es parte de la subasta (vendedor o ganador)
  const esParticipante = Boolean(
    subastaSeleccionada &&
      (mismoId(subastaSeleccionada.ganadorId, idUsuarioActual) ||
        mismoId(subastaSeleccionada.vendedorId, idUsuarioActual))
  );

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    if (name === 'idSubasta') {
      const subastaNueva = buscarPorId(subastasElegibles, value);
      const nuevosDefecto = obtenerValoresPorDefectoResena(subastaNueva, idUsuarioActual, otrosUsuarios);
      setDatosFormulario((previo) => ({
        ...previo,
        idSubasta: value,
        idUsuarioCalificado: nuevosDefecto.idUsuarioCalificado,
        contextoRol: nuevosDefecto.contextoRol,
      }));
      return;
    }
    setDatosFormulario((previo) => ({ ...previo, [name]: value }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError('');

    if (!datosFormulario.comentario.trim()) {
      setMensajeError('Por favor escribe un breve comentario sobre la experiencia.');
      return;
    }

    try {
      if (estaEditando) {
        const actualizada = await alActualizarResena(resena.id, {
          calificacion: Number(datosFormulario.calificacion),
          comentario: datosFormulario.comentario.trim(),
        });
        alGuardar?.(actualizada);
      } else {
        if (!idSubastaEfectiva) {
          setMensajeError('Debes seleccionar una subasta finalizada elegible.');
          return;
        }
        const creada = await alCrearResena({
          idSubasta: idSubastaEfectiva,
          idUsuarioCalificado: idCalificadoEfectivo,
          calificacion: Number(datosFormulario.calificacion),
          contextoRol: rolEfectivo,
          comentario: datosFormulario.comentario.trim(),
        });
        alGuardar?.(creada);
      }
    } catch (error) {
      setMensajeError(error.message);
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      {mensajeError && (
        <Alert type="error" onClose={() => setMensajeError('')}>{mensajeError}</Alert>
      )}

      {/* Selectores de subasta, contraparte y rol (solo al crear) */}
      {!estaEditando && (
        <CamposSeleccionResena
          subastasElegibles={subastasElegibles}
          otrosUsuarios={otrosUsuarios}
          resenas={resenas}
          idUsuarioActual={idUsuarioActual}
          idSubastaEfectiva={idSubastaEfectiva}
          idCalificadoEfectivo={idCalificadoEfectivo}
          rolEfectivo={rolEfectivo}
          bloquearContraparte={esParticipante}
          alCambiar={manejarCambio}
        />
      )}

      {/* Botonera de 1 a 5 estrellas */}
      <SelectorEstrellas
        valorActual={datosFormulario.calificacion}
        alElegir={(valor) => setDatosFormulario((previo) => ({ ...previo, calificacion: valor }))}
      />

      {/* Área de texto para la opinión y detalles del cumplimiento */}
      <Textarea
        id="comentario"
        name="comentario"
        label="Comentario de la Experiencia *"
        placeholder="Describe el cumplimiento de entrega, comunicación y estado del artículo..."
        value={datosFormulario.comentario}
        onChange={manejarCambio}
      />

      {/* Botones de acción */}
      <AccionesFormulario
        alCancelar={alCancelar}
        textoGuardar={estaEditando ? 'Guardar Cambios' : 'Publicar Reseña'}
        iconoGuardar={estaEditando ? <Save className="w-4 h-4" /> : <Star className="w-4 h-4" />}
      />
    </form>
  );
}
