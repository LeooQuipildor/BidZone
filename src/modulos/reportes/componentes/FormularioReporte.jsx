/**
 * ==============================================================================
 * ARCHIVO: src/modulos/reportes/componentes/FormularioReporte.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de formulario para abrir una nueva denuncia disciplinaria (ticket)
 * o para que el denunciante actualice sus fundamentos mientras el ticket siga abierto.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. En modo Creación:
 *    - Permite seleccionar la subasta involucrada y la persona denunciada.
 *    - Ofrece un catálogo de motivos tipificados según el reglamento (`OPCIONES_MOTIVO`).
 *    - Recibe el enlace a la evidencia (capturas, comprobantes) y el relato de los hechos.
 * 2. En modo Edición:
 *    - Comprueba el estado del ticket: Si ya no está `en_revision` (es decir, ya fue dictaminado),
 *      se activa `bloqueado = true`, inhabilitando todos los campos y ocultando el botón de guardado.
 *    - Si aún está en revisión, permite actualizar el relato o agregar más pruebas.
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * Son pasadas por `VistaCrearReporte.jsx` o `VistaEditarReporte.jsx`:
 * - `reporte`: Objeto del ticket (o `null` para crear).
 * - `subastas`: Lista de subastas donde el usuario participó.
 * - `otrosUsuarios`: Lista de posibles contrapartes a reportar.
 * - `idSubastaInicial`, `idUsuarioReportadoInicial`: Valores predeterminados provenientes de la URL (Query params).
 * - Callbacks: `alCrearReporte`, `alActualizarReporte`, `alGuardar`, `alCancelar`.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Parámetros de Consulta Iniciales (Query Params):
 *   Al venir desde el botón "Informar Incumplimiento" de `PanelContactoSubasta`, la URL ya trae
 *   `?subasta=1&reportado=2`, precargando los selectores sin obligar al usuario a buscarlos manualmente.
 * - Bloqueo de Formularios Resueltos:
 *   `const bloqueado = Boolean(estaEditando && reporte.status !== 'en_revision')` garantiza la inmutabilidad
 *   del reclamo una vez que la administración emitió una sentencia.
 */

import React, { useState } from 'react';
import { AlertOctagon, Save } from 'lucide-react';
import { elegirIdValido } from '../../nucleo/utilidades/ayudas';
import { Input, Select, Textarea } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import { AccionesFormulario } from '../../nucleo/diseno/componentesBloques';

/**
 * Motivos tipificados para radicar una denuncia en la plataforma (RN06).
 */
const OPCIONES_MOTIVO = [
  { valor: 'Incumplimiento de pago en plazo acordado', etiqueta: 'El ganador no realizó el pago acordado' },
  { valor: 'Negativa del vendedor a entregar el artículo', etiqueta: 'El dueño del artículo se niega a entregarlo' },
  { valor: 'Falta de respuesta tras liberación de datos', etiqueta: 'No responde teléfono ni correo tras ganar' },
  { valor: 'Artículo distinto a la descripción publicada', etiqueta: 'El producto no coincide con lo publicado' },
];

export function FormularioReporte({
  reporte = null,
  subastas = [],
  otrosUsuarios = [],
  idSubastaInicial = '',
  idUsuarioReportadoInicial = '',
  alCrearReporte,
  alActualizarReporte,
  alGuardar,
  alCancelar,
}) {
  const estaEditando = Boolean(reporte);

  // Si el ticket ya fue dictaminado por moderación, queda congelado para edición
  const bloqueado = Boolean(estaEditando && reporte.status !== 'en_revision');

  /**
   * Estado de los campos del formulario con inicialización perezosa (lazy initial state).
   */
  const [datosFormulario, setDatosFormulario] = useState(() => ({
    idSubasta: reporte ? String(reporte.auctionId) : idSubastaInicial,
    idUsuarioReportado: reporte ? String(reporte.reportedUserId) : idUsuarioReportadoInicial,
    motivo: reporte ? reporte.reason || '' : 'Incumplimiento de pago en plazo acordado',
    descripcion: reporte?.description || '',
    urlEvidencia: reporte?.evidenceUrl || '',
  }));
  const [mensajeError, setMensajeError] = useState('');

  // Resolución segura de identificadores válidos
  const idSubastaEfectiva = estaEditando
    ? datosFormulario.idSubasta
    : elegirIdValido(subastas, datosFormulario.idSubasta, idSubastaInicial);
  const idUsuarioEfectivo = estaEditando
    ? datosFormulario.idUsuarioReportado
    : elegirIdValido(otrosUsuarios, datosFormulario.idUsuarioReportado, idUsuarioReportadoInicial);

  /**
   * Manejador de cambio genérico para inputs, selects y textarea.
   */
  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setDatosFormulario((previo) => ({ ...previo, [name]: value }));
  }

  /**
   * Manejador de envío: Valida campos y llama a creación o actualización.
   */
  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError('');

    if (!datosFormulario.motivo.trim() || !datosFormulario.descripcion.trim()) {
      setMensajeError('El motivo y la descripción detallada del caso son obligatorios.');
      return;
    }

    try {
      if (estaEditando) {
        const actualizado = await alActualizarReporte(reporte.id, {
          motivo: datosFormulario.motivo.trim(),
          descripcion: datosFormulario.descripcion.trim(),
          urlEvidencia: datosFormulario.urlEvidencia.trim(),
        });
        alGuardar?.(actualizado);
      } else {
        if (!idSubastaEfectiva || !idUsuarioEfectivo) {
          setMensajeError('Debes seleccionar una subasta y el usuario denunciado.');
          return;
        }
        const creado = await alCrearReporte({
          idSubasta: idSubastaEfectiva,
          idUsuarioReportado: idUsuarioEfectivo,
          motivo: datosFormulario.motivo.trim(),
          descripcion: datosFormulario.descripcion.trim(),
          urlEvidencia: datosFormulario.urlEvidencia.trim(),
        });
        alGuardar?.(creado);
      }
    } catch (error) {
      setMensajeError(error.message);
    }
  }

  // Opciones de subastas para el componente Select
  const opcionesSubastas =
    subastas.length > 0
      ? subastas.map((subasta) => ({ valor: String(subasta.id), etiqueta: `#${subasta.id} — ${subasta.title}` }))
      : [{ valor: '', etiqueta: 'Sin subastas registradas' }];

  // Opciones de usuarios para el componente Select
  const opcionesUsuarios =
    otrosUsuarios.length > 0
      ? otrosUsuarios.map((usuario) => ({
          valor: String(usuario.id),
          etiqueta: usuario.email ? `${usuario.name} (${usuario.email})` : `${usuario.name} (${usuario.city || 'Socio BidZone'})`,
        }))
      : [{ valor: '', etiqueta: 'Sin usuarios disponibles' }];

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      {/* Alerta de bloqueo si el ticket ya no está en revisión */}
      {bloqueado && (
        <Alert type="warning" title="Ticket cerrado para edición">
          Este ticket ya fue resuelto por moderación y no admite cambios del denunciante.
        </Alert>
      )}

      {mensajeError && (
        <Alert type="error" onClose={() => setMensajeError('')}>{mensajeError}</Alert>
      )}

      {/* Selectores de Subasta y Usuario Denunciado (solo al crear) */}
      {!estaEditando && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            id="idSubasta"
            name="idSubasta"
            label="Subasta Involucrada *"
            value={idSubastaEfectiva}
            onChange={manejarCambio}
            options={opcionesSubastas}
          />
          <Select
            id="idUsuarioReportado"
            name="idUsuarioReportado"
            label="Usuario Denunciado *"
            value={idUsuarioEfectivo}
            onChange={manejarCambio}
            options={opcionesUsuarios}
          />
        </div>
      )}

      {/* Motivo de la denuncia y enlace a pruebas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {estaEditando ? (
          <Input
            id="motivo"
            name="motivo"
            label="Motivo del Reclamo *"
            disabled={bloqueado}
            value={datosFormulario.motivo}
            onChange={manejarCambio}
          />
        ) : (
          <Select
            id="motivo"
            name="motivo"
            label="Motivo Principal del Reclamo *"
            value={datosFormulario.motivo}
            onChange={manejarCambio}
            options={OPCIONES_MOTIVO}
          />
        )}
        <Input
          id="urlEvidencia"
          name="urlEvidencia"
          label="Enlace de Evidencia (Opcional)"
          placeholder="https://..."
          disabled={bloqueado}
          value={datosFormulario.urlEvidencia}
          onChange={manejarCambio}
        />
      </div>

      {/* Relato detallado de los hechos */}
      <Textarea
        id="descripcion"
        name="descripcion"
        label="Descripción Detallada de los Hechos *"
        placeholder="Explica los hechos y plazos incumplidos..."
        disabled={bloqueado}
        value={datosFormulario.descripcion}
        onChange={manejarCambio}
      />

      {/* Botones de acción */}
      <AccionesFormulario
        alCancelar={alCancelar}
        mostrarGuardar={!bloqueado}
        textoGuardar={estaEditando ? 'Guardar Reclamo' : 'Abrir Ticket'}
        iconoGuardar={estaEditando ? <Save className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
      />
    </form>
  );
}
