import React, { useState } from 'react';
import { AlertOctagon, Save } from 'lucide-react';
import { elegirIdValido } from '../../nucleo/utilidades/ayudas';
import { Input, Select, Textarea } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import { AccionesFormulario } from '../../nucleo/diseno/componentesBloques';

const OPCIONES_MOTIVO = [
  { valor: 'Incumplimiento de pago en plazo acordado', etiqueta: 'El ganador no realizó el pago acordado' },
  { valor: 'Negativa del vendedor a entregar el artículo', etiqueta: 'El dueño del artículo se niega a entregarlo' },
  { valor: 'Falta de respuesta tras liberación de datos', etiqueta: 'No responde teléfono ni correo tras ganar' },
  { valor: 'Artículo distinto a la descripción publicada', etiqueta: 'El producto no coincide con lo publicado' },
];

// Formulario para que el socio abra un nuevo ticket de reclamo o edite el suyo mientras siga abierto
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
  const bloqueado = Boolean(estaEditando && reporte.status !== 'en_revision');

  const [datosFormulario, setDatosFormulario] = useState(() => ({
    idSubasta: reporte ? String(reporte.auctionId) : idSubastaInicial,
    idUsuarioReportado: reporte ? String(reporte.reportedUserId) : idUsuarioReportadoInicial,
    motivo: reporte ? reporte.reason || '' : 'Incumplimiento de pago en plazo acordado',
    descripcion: reporte?.description || '',
    urlEvidencia: reporte?.evidenceUrl || '',
  }));
  const [mensajeError, setMensajeError] = useState('');

  const idSubastaEfectiva = estaEditando
    ? datosFormulario.idSubasta
    : elegirIdValido(subastas, datosFormulario.idSubasta, idSubastaInicial);
  const idUsuarioEfectivo = estaEditando
    ? datosFormulario.idUsuarioReportado
    : elegirIdValido(otrosUsuarios, datosFormulario.idUsuarioReportado, idUsuarioReportadoInicial);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setDatosFormulario((previo) => ({ ...previo, [name]: value }));
  }

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

  const opcionesSubastas =
    subastas.length > 0
      ? subastas.map((subasta) => ({ valor: String(subasta.id), etiqueta: `#${subasta.id} — ${subasta.title}` }))
      : [{ valor: '', etiqueta: 'Sin subastas registradas' }];

  const opcionesUsuarios =
    otrosUsuarios.length > 0
      ? otrosUsuarios.map((usuario) => ({
          valor: String(usuario.id),
          etiqueta: usuario.email ? `${usuario.name} (${usuario.email})` : `${usuario.name} (${usuario.city || 'Socio BidZone'})`,
        }))
      : [{ valor: '', etiqueta: 'Sin usuarios disponibles' }];

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      {bloqueado && (
        <Alert type="warning" title="Ticket cerrado para edición">
          Este ticket ya fue resuelto por moderación y no admite cambios del denunciante.
        </Alert>
      )}
      {mensajeError && (
        <Alert type="error" onClose={() => setMensajeError('')}>{mensajeError}</Alert>
      )}

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

      <Textarea
        id="descripcion"
        name="descripcion"
        label="Descripción Detallada de los Hechos *"
        placeholder="Explica los hechos y plazos incumplidos..."
        disabled={bloqueado}
        value={datosFormulario.descripcion}
        onChange={manejarCambio}
      />

      <AccionesFormulario
        alCancelar={alCancelar}
        mostrarGuardar={!bloqueado}
        textoGuardar={estaEditando ? 'Guardar Reclamo' : 'Abrir Ticket'}
        iconoGuardar={estaEditando ? <Save className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
      />
    </form>
  );
}
