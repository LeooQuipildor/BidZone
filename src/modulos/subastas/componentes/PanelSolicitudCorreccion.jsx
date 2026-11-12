import React, { useState } from 'react';
import { BellRing, Send } from 'lucide-react';
import { Input, Select, Textarea } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import { AccionesFormulario } from '../../nucleo/diseno/componentesBloques';

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

// Panel administrativo para pedir al vendedor que corrija una subasta sin editarla por él
export function PanelSolicitudCorreccion({
  subasta,
  nombreVendedor,
  alEnviarAviso,
  alCancelar,
}) {
  const [motivoClave, setMotivoClave] = useState(MOTIVOS_CORRECCION[0].valor);
  const [tituloAviso, setTituloAviso] = useState(`Corrección requerida en "${subasta.title}"`);
  const [mensaje, setMensaje] = useState(MOTIVOS_CORRECCION[0].sugerencia);
  const [mensajeError, setMensajeError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function manejarCambioMotivo(evento) {
    const nuevaClave = evento.target.value;
    setMotivoClave(nuevaClave);
    const encontrado = MOTIVOS_CORRECCION.find((item) => item.valor === nuevaClave);
    if (encontrado && encontrado.sugerencia) {
      setMensaje(encontrado.sugerencia);
    }
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError('');

    if (!tituloAviso.trim() || !mensaje.trim()) {
      setMensajeError('Debes completar el asunto y el detalle de corrección para el vendedor.');
      return;
    }

    setEnviando(true);
    try {
      await alEnviarAviso({
        idUsuario: subasta.sellerId,
        idSubasta: subasta.id,
        titulo: tituloAviso.trim(),
        mensaje: mensaje.trim(),
        tipo: 'system',
      });
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
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

      <Textarea
        id="mensajeCorreccion"
        label="Detalle de la corrección solicitada *"
        placeholder="Explica qué debe corregir el vendedor en su publicación..."
        value={mensaje}
        onChange={(evento) => setMensaje(evento.target.value)}
      />

      <AccionesFormulario
        alCancelar={alCancelar}
        enviando={enviando}
        textoGuardar={enviando ? 'Enviando...' : 'Enviar Solicitud al Vendedor'}
        iconoGuardar={<Send className="w-3.5 h-3.5" />}
      />
    </form>
  );
}

