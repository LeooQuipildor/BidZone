/**
 * ==============================================================================
 * ARCHIVO: src/modulos/subastas/componentes/PanelSolicitudCorreccion.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de moderación y auditoría que permite a los Administradores de BidZone
 * solicitar correcciones a los vendedores sobre publicaciones con imágenes deficientes,
 * descripciones incompletas o inconsistencias, cumpliendo con la mediación preventiva de la Regla RN06.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Provee un conjunto de motivos predefinidos (`MOTIVOS_CORRECCION`: foto borrosa, descripción confusa, datos erróneos).
 * 2. Al cambiar el motivo, autocompleta el asunto y el mensaje sugerido en el área de texto.
 * 3. Al enviar, despacha una notificación oficial de tipo `system` a la bandeja del vendedor
 *    usando `enviarNotificacion` de `usarTiendaNotificaciones`.
 * 4. Soporta renderizarse de dos formas según la prop `enModal`:
 *    - Dentro de una ventana emergente `<Modal>` (por ejemplo, desde el catálogo o tarjetas).
 *    - Integrado en línea dentro del layout del panel administrativo.
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * - `subasta`: Objeto con los datos del lote observado.
 * - `enModal`: Booleano (por defecto `false`) que activa el contenedor emergente.
 * - `alExito`: Callback invocado con el mensaje de confirmación tras emitir la notificación.
 * - `alCancelar`: Callback para cerrar el diálogo o volver atrás.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Autocompletado inteligente de texto:
 *   Al detectar un cambio en el `<Select>`, buscamos el objeto en el arreglo con `Array.find`
 *   y actualizamos el estado del `<Textarea>` con una redacción modelo recomendada.
 * - Patrón Componente Embebido vs Modal:
 *   Un solo componente puede reutilizarse en una página completa o en un diálogo flotante
 *   condicionando simplemente el retorno con `if (enModal) return <Modal>...</Modal>`.
 */

import React, { useState } from 'react';
import { BellRing, Send } from 'lucide-react';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { usarTiendaNotificaciones } from '../../notificaciones/estado/tiendaNotificaciones';
import { buscarPorId } from '../../nucleo/utilidades/ayudas';
import { Input, Select, Textarea } from '../../nucleo/diseno/ui';
import { Alert, Modal } from '../../nucleo/diseno/uiFeedback';
import { AccionesFormulario } from '../../nucleo/diseno/componentesBloques';

/**
 * Catálogo de motivos predefinidos de moderación con mensajes sugeridos para el vendedor.
 */
const MOTIVOS_CORRECCION = [
  {
    valor: 'foto',
    etiqueta: 'Imagen borrosa, incompleta o que no coincide con el producto',
    sugerencia: 'Por favor actualiza las imágenes de tu subasta para mostrar el producto completo y nítido.',
  },
  {
    valor: 'descripcion',
    etiqueta: 'Descripción incompleta o información confusa',
    sugerencia: 'Amplía la descripción indicando estado real, accesorios incluidos y condiciones de entrega.',
  },
  {
    valor: 'datos',
    etiqueta: 'Título, categoría o precio inconsistentes',
    sugerencia: 'Revisa el título, categoría o datos iniciales de tu publicación para evitar confusiones.',
  },
  {
    valor: 'otro',
    etiqueta: 'Otro ajuste requerido por reglamento',
    sugerencia: '',
  },
];

/**
 * Componente interno con el formulario de solicitud de revisión.
 */
function FormularioSolicitudCorreccion({ subasta, alExito, alCancelar }) {
  // Suscripción a tiendas de autenticación y notificaciones
  const usuarios = usarTiendaAutenticacion((estado) => estado.usuarios);
  const enviarNotificacion = usarTiendaNotificaciones((estado) => estado.enviarNotificacion);

  // Identificación del vendedor receptor de la notificación
  const vendedor = buscarPorId(usuarios, subasta.sellerId);
  const nombreVendedor = vendedor?.name || subasta.sellerName || 'Vendedor';

  // Estados locales del formulario
  const [motivoClave, setMotivoClave] = useState(MOTIVOS_CORRECCION[0].valor);
  const [tituloAviso, setTituloAviso] = useState(`Revisión requerida en "${subasta.title}"`);
  const [mensaje, setMensaje] = useState(MOTIVOS_CORRECCION[0].sugerencia);
  const [mensajeError, setMensajeError] = useState('');
  const [enviando, setEnviando] = useState(false);

  /**
   * Manejador de cambio de motivo: Actualiza el texto sugerido automáticamente.
   */
  function manejarCambioMotivo(evento) {
    const nuevaClave = evento.target.value;
    setMotivoClave(nuevaClave);
    const encontrado = MOTIVOS_CORRECCION.find((item) => item.valor === nuevaClave);
    if (encontrado && encontrado.sugerencia) setMensaje(encontrado.sugerencia);
  }

  /**
   * Manejador de envío: Emite la notificación al vendedor en el backend.
   */
  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError('');

    if (!tituloAviso.trim() || !mensaje.trim()) {
      setMensajeError('Debes completar el asunto y el detalle de revisión para el vendedor.');
      return;
    }

    setEnviando(true);
    try {
      await enviarNotificacion({
        idUsuario: subasta.sellerId,
        idSubasta: subasta.id,
        titulo: tituloAviso.trim(),
        mensaje: mensaje.trim(),
        tipo: 'system',
      });
      alExito?.(`Solicitud de revisión enviada a ${nombreVendedor}.`);
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      {/* Resumen del destinatario y recordatorio de moderación ética */}
      <div className="rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 p-3.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#0D0D0D]/55 block">
            Destinatario del aviso (notificación directa)
          </span>
          <strong className="text-[#0D0D0D]">{nombreVendedor}</strong> · Lote #{subasta.id}
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
          <BellRing className="w-3.5 h-3.5" />
          No modifica el lote automáticamente
        </span>
      </div>

      {mensajeError && (
        <Alert type="error" onClose={() => setMensajeError('')}>{mensajeError}</Alert>
      )}

      {/* Select de motivo y campo de asunto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="motivoCorreccion"
          label="Motivo sugerido"
          value={motivoClave}
          onChange={manejarCambioMotivo}
          options={MOTIVOS_CORRECCION.map((item) => ({ valor: item.valor, etiqueta: item.etiqueta }))}
        />
        <Input
          id="tituloAviso"
          label="Asunto del aviso *"
          value={tituloAviso}
          onChange={(evento) => setTituloAviso(evento.target.value)}
        />
      </div>

      {/* Área de texto con el detalle de lo solicitado */}
      <Textarea
        id="mensajeCorreccion"
        label="Detalle de la revisión solicitada *"
        placeholder="Explica qué debe revisar o corregir el vendedor en su publicación..."
        value={mensaje}
        onChange={(evento) => setMensaje(evento.target.value)}
      />

      {/* Botones de acción */}
      <AccionesFormulario
        alCancelar={alCancelar}
        enviando={enviando}
        textoGuardar={enviando ? 'Enviando...' : 'Enviar Solicitud al Vendedor'}
        iconoGuardar={<Send className="w-3.5 h-3.5" />}
      />
    </form>
  );
}

export function PanelSolicitudCorreccion({ subasta, enModal = false, alExito, alCancelar }) {
  if (!subasta) return null;

  const formulario = (
    <FormularioSolicitudCorreccion
      key={subasta.id}
      subasta={subasta}
      alExito={alExito}
      alCancelar={alCancelar}
    />
  );

  // Renderizado condicional en ventana emergente o en bloque directo
  if (enModal) {
    return (
      <Modal isOpen onClose={alCancelar} title={`Solicitar revisión · Lote #${subasta.id}`}>
        {formulario}
      </Modal>
    );
  }

  return formulario;
}
