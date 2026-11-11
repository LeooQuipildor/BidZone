import React, { useState } from 'react';
import { AlertOctagon, Save } from 'lucide-react';
import { elegirIdValido } from '../../nucleo/utilidades/ayudas';
import { Input, Select, Textarea } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import { AccionesFormulario } from '../../nucleo/diseno/componentesBloques';
import { SeccionResolucionAdmin } from './SeccionResolucionAdmin';

const OPCIONES_MOTIVO = [
  { valor: 'Incumplimiento de pago en plazo acordado', etiqueta: 'El ganador no realizó el pago acordado' },
  { valor: 'Negativa del vendedor a entregar el artículo', etiqueta: 'El dueño del artículo se niega a entregarlo' },
  { valor: 'Falta de respuesta tras liberación de datos', etiqueta: 'No responde teléfono ni correo tras ganar' },
  { valor: 'Artículo distinto a la descripción publicada', etiqueta: 'El producto no coincide con lo publicado' },
];

// Formulario único para denunciar incumplimientos o resolver expedientes RN06
export function FormularioReporte({
  reporte = null,
  subastas = [],
  otrosUsuarios = [],
  esAdmin = false,
  idSubastaInicial = '',
  idUsuarioReportadoInicial = '',
  alCrearReporte,
  alActualizarReporte,
  alGuardar,
  alCancelar,
}) {
  const estaEditando = Boolean(reporte);
  const bloqueadoParaDenunciante = Boolean(estaEditando && !esAdmin && reporte.status !== 'en_revision');

  const [datosFormulario, setDatosFormulario] = useState(() => ({
    idSubasta: reporte ? String(reporte.auctionId) : idSubastaInicial,
    idUsuarioReportado: reporte ? String(reporte.reportedUserId) : idUsuarioReportadoInicial,
    motivo: reporte ? reporte.reason || '' : 'Incumplimiento de pago en plazo acordado',
    descripcion: reporte?.description || '',
    urlEvidencia: reporte?.evidenceUrl || '',
    estado: reporte?.status || 'en_revision',
    sancionAplicada: reporte?.sanctionApplied || '',
    accionCuenta: 'none',
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
        const cambios = esAdmin
          ? datosFormulario
          : {
              motivo: datosFormulario.motivo.trim(),
              descripcion: datosFormulario.descripcion.trim(),
              urlEvidencia: datosFormulario.urlEvidencia.trim(),
            };
        const actualizado = await alActualizarReporte(reporte.id, cambios);
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
      {bloqueadoParaDenunciante && (
        <Alert type="warning" title="Expediente cerrado para edición">
          Este expediente ya fue resuelto por moderación y no admite cambios del denunciante.
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
            disabled={bloqueadoParaDenunciante}
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
          disabled={bloqueadoParaDenunciante}
          value={datosFormulario.urlEvidencia}
          onChange={manejarCambio}
        />
      </div>

      <Textarea
        id="descripcion"
        name="descripcion"
        label="Descripción Detallada de los Hechos *"
        placeholder="Explica los hechos y plazos incumplidos..."
        disabled={bloqueadoParaDenunciante}
        value={datosFormulario.descripcion}
        onChange={manejarCambio}
      />

      {estaEditando && esAdmin && (
        <SeccionResolucionAdmin datosFormulario={datosFormulario} alCambiar={manejarCambio} />
      )}

      <AccionesFormulario
        alCancelar={alCancelar}
        mostrarGuardar={!bloqueadoParaDenunciante}
        textoGuardar={estaEditando ? 'Guardar Resolución' : 'Radicar Reporte'}
        iconoGuardar={estaEditando ? <Save className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
      />
    </form>
  );
}
