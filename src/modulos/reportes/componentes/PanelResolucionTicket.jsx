/**
 * ==============================================================================
 * ARCHIVO: src/modulos/reportes/componentes/PanelResolucionTicket.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de interfaz para que los administradores dictaminen y resuelvan reportes
 * disciplinarios tipo mesa de ayuda (Helpdesk/Ticket System), aplicando la Regla de Negocio RN06.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Presenta 4 tarjetas de resolución rápida (`OPCIONES_DECISION`):
 *    - Solucionar sin sanción (desestima el ticket sin penalidad).
 *    - Suspender infractor (marca el ticket con sanción y pasa la cuenta del denunciado a 'suspended').
 *    - Cerrar cuenta (inhabilitación permanente y estado de cuenta 'closed').
 *    - Rehabilitar cuenta (restituye la cuenta sancionada previamente a estado 'active').
 * 2. Si el administrador elige una tarjeta, autocompleta el campo de dictamen con un texto sugerido
 *    a menos que el administrador ya haya editado manualmente el texto (`editadoManual`).
 * 3. Ejecuta la actualización atómica en el backend a través de `alActualizarReporte`.
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * Son pasadas desde `VistaEditarReporte.jsx` o desde `TabReportesPanel.jsx`:
 * - `reporte`: Objeto de la denuncia (`id`, `title`, `status`, `sanctionApplied`, etc.).
 * - `nombreDenunciado`: String con el nombre del usuario denunciado.
 * - `estadoDenunciado`: Estado actual de la cuenta del denunciado (`active`, `suspended`, `closed`).
 * - `alActualizarReporte`: Función inyectada de la tienda `usarTiendaReportes` que efectúa el PATCH/PUT.
 * - `alGuardar`, `alCancelar`: Callbacks para notificar éxito o cerrar el panel.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Sincronización Inteligente de Sugerencias con bandera (`editadoManual`):
 *   Al cambiar entre opciones, el texto sugerido solo se sobreescribe si el usuario no ha tipeado
 *   un texto personalizado propio, respetando el trabajo del operador humano.
 * - Sanción en Cascada:
 *   Al resolver el reporte con `accionCuenta: 'suspend'`, la tienda de reportes no solo actualiza el ticket,
 *   sino que actualiza el estado del usuario en la tienda de autenticación y notifica al infractor.
 */

import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatearEstadoCuenta } from '../../nucleo/utilidades/formatos';
import { Input } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import { AccionesFormulario } from '../../nucleo/diseno/componentesBloques';

/**
 * Matriz de decisiones administrativas con su impacto en el ticket y en la cuenta del usuario.
 */
const OPCIONES_DECISION = [
  {
    clave: 'solucionar',
    titulo: 'Solucionar sin sanción',
    detalle: 'Cierra el ticket sin sancionar cuentas.',
    estado: 'desestimado',
    accionCuenta: 'none',
    sugerencia: 'Caso solucionado entre las partes sin sanción disciplinaria.',
  },
  {
    clave: 'suspender',
    titulo: 'Suspender infractor',
    detalle: 'Suspende la cuenta reportada y le envía aviso.',
    estado: 'resuelto_sancion',
    accionCuenta: 'suspend',
    sugerencia: 'Suspensión temporal de cuenta por incumplimiento RN06.',
  },
  {
    clave: 'cerrar',
    titulo: 'Cerrar cuenta',
    detalle: 'Bloqueo definitivo de la cuenta infractora.',
    estado: 'resuelto_sancion',
    accionCuenta: 'close',
    sugerencia: 'Cierre definitivo de cuenta por falta grave RN06.',
  },
  {
    clave: 'rehabilitar',
    titulo: 'Rehabilitar cuenta',
    detalle: 'Restituye la cuenta a estado activo y cierra el ticket.',
    estado: 'desestimado',
    accionCuenta: 'activate',
    sugerencia: 'Cuenta rehabilitada tras regularización del expediente.',
  },
];

export function PanelResolucionTicket({
  reporte,
  nombreDenunciado,
  estadoDenunciado,
  alActualizarReporte,
  alGuardar,
  alCancelar,
}) {
  // Determinación de la opción inicial según el estado previo del ticket
  const claveInicial = reporte.status === 'resuelto_sancion' ? 'suspender' : 'solucionar';
  const opcionInicial = OPCIONES_DECISION.find((op) => op.clave === claveInicial);
  const textoGuardado = reporte.sanctionApplied && reporte.sanctionApplied !== 'Pendiente de evaluación'
    ? reporte.sanctionApplied
    : opcionInicial.sugerencia;

  // Estados locales para la decisión, el dictamen y las alertas
  const [claveDecision, setClaveDecision] = useState(claveInicial);
  const [dictamen, setDictamen] = useState(textoGuardado);
  const [editadoManual, setEditadoManual] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Opción activa seleccionada actualmente
  const decisionActual = OPCIONES_DECISION.find((op) => op.clave === claveDecision) || OPCIONES_DECISION[0];

  /**
   * Cambia la decisión seleccionada y actualiza la sugerencia de texto.
   *
   * @param {typeof OPCIONES_DECISION[0]} opcion
   */
  function elegirDecision(opcion) {
    setClaveDecision(opcion.clave);
    if (!editadoManual) {
      setDictamen(opcion.sugerencia);
    }
  }

  /**
   * Manejador de envío de la resolución.
   */
  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError('');

    if (!dictamen.trim()) {
      setMensajeError('Escribe una breve respuesta o dictamen para cerrar el ticket.');
      return;
    }

    setEnviando(true);
    try {
      const actualizado = await alActualizarReporte(reporte.id, {
        estado: decisionActual.estado,
        accionCuenta: decisionActual.accionCuenta,
        sancionAplicada: dictamen.trim(),
      });
      alGuardar?.(actualizado);
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setEnviando(false);
    }
  }

  const etiquetaEstadoCuenta = formatearEstadoCuenta(estadoDenunciado);

  return (
    <form onSubmit={manejarEnvio} className="space-y-4 bg-[#F7FBF3] border border-[#224F10]/15 rounded-2xl p-4 sm:p-5">
      {/* Cabecera del ticket con el denunciado y su estado disciplinario actual */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#224F10]">
          <ShieldAlert className="w-4 h-4" />
          <span>Resolver Ticket #{reporte.id}</span>
        </div>
        <span className="text-[11px] font-medium text-[#0D0D0D]/70">
          Cuenta denunciada: <strong>{nombreDenunciado}</strong> ({etiquetaEstadoCuenta})
        </span>
      </div>

      {mensajeError && (
        <Alert type="error" onClose={() => setMensajeError('')}>{mensajeError}</Alert>
      )}

      {/* Selector en tarjetas de las 4 decisiones disponibles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {OPCIONES_DECISION.map((opcion) => {
          const activa = opcion.clave === claveDecision;
          const estilo = activa
            ? 'bg-[#224F10] text-[#EAFFD0] border-[#224F10] shadow-xs'
            : 'bg-white text-[#0D0D0D] border-[#224F10]/15 hover:bg-[#EAFFD0]/50';

          return (
            <button
              key={opcion.clave}
              type="button"
              onClick={() => elegirDecision(opcion)}
              className={`text-left rounded-xl p-3 border transition-colors cursor-pointer space-y-1 ${estilo}`}
            >
              <p className="text-xs font-bold leading-snug">{opcion.titulo}</p>
              <p className={`text-[10px] leading-snug ${activa ? 'text-[#EAFFD0]/80' : 'text-[#0D0D0D]/60'}`}>
                {opcion.detalle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Dictamen o respuesta oficial escrita que quedará registrada */}
      <Input
        id={`dictamen-${reporte.id}`}
        label="Respuesta / Dictamen visible en el Ticket *"
        placeholder="Explica brevemente qué se resolvió..."
        value={dictamen}
        onChange={(evento) => {
          setEditadoManual(true);
          setDictamen(evento.target.value);
        }}
      />

      {/* Botones de acción */}
      <AccionesFormulario
        alCancelar={alCancelar}
        enviando={enviando}
        textoGuardar={enviando ? 'Aplicando...' : 'Aplicar Resolución'}
        iconoGuardar={<CheckCircle2 className="w-4 h-4" />}
      />
    </form>
  );
}

