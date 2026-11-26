import React, { useState } from 'react';
import { Save } from 'lucide-react';
import {
  IMAGEN_SUBASTA_POR_DEFECTO,
  fechaParaInputLocal,
  inputLocalAFechaIso,
} from '../../nucleo/utilidades/formatos';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import { AccionesFormulario } from '../../nucleo/diseno/componentesBloques';
import { CamposSubasta } from './CamposSubasta';

export function FormularioSubasta({
  subasta = null,
  tienePujas = false,
  esAdmin = false,
  alEnviarFormulario,
  alCancelar,
  textoBotonGuardar,
}) {
  // `true` si estamos editando un lote existente, `false` si es alta nueva
  const estaEditando = Boolean(subasta);

  // Formateo inicial de fecha local para el input HTML
  const fechaFinInicial = fechaParaInputLocal(subasta?.fechaFin);

  const [datosFormulario, setDatosFormulario] = useState(() => ({
    titulo: subasta?.titulo || '',
    descripcion: subasta?.descripcion || '',
    categoria: subasta?.categoria || 'Tecnología',
    urlImagen: subasta?.urlImagen || '',
    precioInicial: subasta ? String(subasta.precioBase ?? '') : '',
    incrementoMinimo: subasta ? String(subasta.incrementoMinimo ?? '') : '',
    estado: subasta?.estado || 'activa',
    fechaFin: fechaFinInicial,
  }));

  // Estado para alertas y errores de validación
  const [mensajeError, setMensajeError] = useState('');

  const bloquearCamposFinancieros = Boolean(estaEditando && tienePujas && !esAdmin);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setDatosFormulario((previo) => ({ ...previo, [name]: value }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError('');

    // Validación 1: Campos de texto obligatorios
    if (!datosFormulario.titulo.trim() || !datosFormulario.descripcion.trim()) {
      setMensajeError('Por favor completa el título y la descripción del artículo.');
      return;
    }

    // Validación 2: Fecha de cierre futura al crear
    if (!estaEditando) {
      const marcaTiempoFin = new Date(datosFormulario.fechaFin).getTime();
      if (Number.isNaN(marcaTiempoFin) || marcaTiempoFin <= Date.now()) {
        setMensajeError('La fecha y hora de cierre debe ser posterior al momento actual.');
        return;
      }
    }

    // Construcción del payload con datos limpios
    const datosEnvio = {
      titulo: datosFormulario.titulo.trim(),
      descripcion: datosFormulario.descripcion.trim(),
      categoria: datosFormulario.categoria,
      urlImagen: datosFormulario.urlImagen.trim() || IMAGEN_SUBASTA_POR_DEFECTO,
    };

    // Si los campos financieros no están bloqueados, se incluyen en el payload
    if (!bloquearCamposFinancieros) {
      datosEnvio.precioInicial = datosFormulario.precioInicial;
      datosEnvio.incrementoMinimo = datosFormulario.incrementoMinimo;
      if (!estaEditando) {
        datosEnvio.fechaFin = inputLocalAFechaIso(datosFormulario.fechaFin);
      }
    }

    // Si cambió el estado en modo edición, se envía la actualización
    if (estaEditando && datosFormulario.estado !== subasta.estado) {
      datosEnvio.estado = datosFormulario.estado;
    }

    try {
      await alEnviarFormulario(datosEnvio);
    } catch (error) {
      setMensajeError(error.message);
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      {/* Alerta explicativa de la Regla de Negocio RN08 */}
      {bloquearCamposFinancieros && (
        <Alert type="warning" title="Inmutabilidad por Oferta">
          Esta subasta ya cuenta con ofertas registradas. El precio base, incremento mínimo y cierre quedan bloqueados para proteger a los postores.
        </Alert>
      )}

      {/* Alerta de error en caso de fallo de validación o del servidor */}
      {mensajeError && (
        <Alert type="error" onClose={() => setMensajeError('')}>{mensajeError}</Alert>
      )}

      {/* Subcomponente con los campos de entrada */}
      <CamposSubasta
        datosFormulario={datosFormulario}
        estaEditando={estaEditando}
        subasta={subasta}
        bloquearCamposFinancieros={bloquearCamposFinancieros}
        alCambiar={manejarCambio}
      />

      {/* Botones de Guardar / Publicar y Cancelar */}
      <AccionesFormulario
        alCancelar={alCancelar}
        textoGuardar={textoBotonGuardar || (estaEditando ? 'Guardar Cambios' : 'Publicar Subasta')}
        iconoGuardar={<Save className="w-4 h-4" />}
      />
    </form>
  );
}
