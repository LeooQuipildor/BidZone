/**
 * ==============================================================================
 * ARCHIVO: src/modulos/resenas/componentes/FormularioResena.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de formulario reutilizable para emitir o modificar una calificación
 * mutua de 1 a 5 estrellas con comentario, regulada por la Regla de Negocio RN07.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. En modo Creación:
 *    - Verifica si el usuario cuenta con operaciones elegibles (`subastasElegibles.length > 0`).
 *    - Si no tiene operaciones válidas, muestra una alerta explicativa sobre las condiciones de la RN07.
 *    - Determina automáticamente la contraparte y el rol (`comprador_a_vendedor` o `vendedor_a_comprador`)
 *      utilizando `obtenerValoresPorDefectoResena`.
 *    - Si el usuario fue postor ganador o vendedor de esa subasta (`esParticipante`), bloquea el selector
 *      de contraparte para asegurar que la calificación vaya dirigida estrictamente a quien corresponde.
 * 2. En modo Edición:
 *    - Permite actualizar el puntaje de estrellas (`SelectorEstrellas`) y el comentario explicativo.
 * 3. Ejecuta la llamada asíncrona correspondiente (`alCrearResena` o `alActualizarResena`) y notifica al padre.
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * Son pasadas por `VistaCrearResena.jsx`, `VistaEditarResena.jsx` o modales del panel:
 * - `resena`: Objeto de reseña existente (o `null`).
 * - `subastasElegibles`: Lista de subastas cerradas con ganador donde intervino el usuario.
 * - `otrosUsuarios`: Lista de usuarios del sistema.
 * - `resenas`: Lista histórica para marcar subastas ya calificadas.
 * - `idUsuarioActual`: ID del evaluador en sesión.
 * - `idSubastaInicial`, `idUsuarioCalificadoInicial`: Parámetros de URL opcionales.
 * - Callbacks: `alCrearResena`, `alActualizarResena`, `alGuardar`, `alCancelar`.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Deducción Automatizada de Roles:
 *   Al cambiar la subasta seleccionada en el evento `onChange`, el formulario consulta
 *   `obtenerValoresPorDefectoResena` para deducir de inmediato si soy el comprador calificando al vendedor,
 *   o el vendedor calificando al comprador ganador.
 */

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

  /**
   * Estado de los campos del formulario con inicialización perezosa (Lazy state).
   */
  const [datosFormulario, setDatosFormulario] = useState(() => ({
    idSubasta: idSubastaInicial,
    idUsuarioCalificado: idUsuarioCalificadoInicial,
    calificacion: resena ? String(resena.rating ?? '5') : '5',
    contextoRol: resena?.roleContext || '',
    comentario: resena?.comment || '',
  }));
  const [mensajeError, setMensajeError] = useState('');

  // Caso límite: El usuario no tiene transacciones concluidas para calificar
  if (!estaEditando && subastasElegibles.length === 0) {
    return (
      <Alert type="info" title="Sin operaciones calificables aún">
        Solo puedes calificar subastas finalizadas con ganador adjudicado en las que hayas participado (RN07).
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
      (mismoId(subastaSeleccionada.winnerId, idUsuarioActual) ||
        mismoId(subastaSeleccionada.sellerId, idUsuarioActual))
  );

  /**
   * Manejador de cambios: Si cambia la subasta, recalcula la contraparte sugerida.
   */
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

  /**
   * Manejador de envío: Valida comentario no vacío y persiste la calificación.
   */
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
