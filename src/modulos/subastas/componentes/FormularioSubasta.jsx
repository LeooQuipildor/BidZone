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

// Formulario único reutilizado para publicar o editar una subasta (Panel y vistas /new y /edit)
export function FormularioSubasta({
  subasta = null,
  tienePujas = false,
  esAdmin = false,
  alEnviarFormulario,
  alCancelar,
  textoBotonGuardar,
}) {
  const estaEditando = Boolean(subasta);
  const fechaFinInicial = fechaParaInputLocal(subasta?.endTime);

  const [datosFormulario, setDatosFormulario] = useState(() => ({
    titulo: subasta?.title || '',
    descripcion: subasta?.description || '',
    categoria: subasta?.category || 'Tecnología',
    urlImagen: subasta?.imageUrl || '',
    precioInicial: subasta ? String(subasta.basePrice ?? '') : '',
    incrementoMinimo: subasta ? String(subasta.minIncrement ?? '') : '',
    estado: subasta?.status || 'activa',
    fechaFin: fechaFinInicial,
  }));
  const [mensajeError, setMensajeError] = useState('');

  // RN08: si ya recibió ofertas, solo un administrador puede cambiar precios o fecha de cierre
  const bloquearCamposFinancieros = Boolean(estaEditando && tienePujas && !esAdmin);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setDatosFormulario((previo) => ({ ...previo, [name]: value }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError('');

    if (!datosFormulario.titulo.trim() || !datosFormulario.descripcion.trim()) {
      setMensajeError('Por favor completa el título y la descripción del artículo.');
      return;
    }

    if (!estaEditando) {
      const marcaTiempoFin = new Date(datosFormulario.fechaFin).getTime();
      if (Number.isNaN(marcaTiempoFin) || marcaTiempoFin <= Date.now()) {
        setMensajeError('La fecha y hora de cierre debe ser posterior al momento actual.');
        return;
      }
    }

    const datosEnvio = {
      titulo: datosFormulario.titulo.trim(),
      descripcion: datosFormulario.descripcion.trim(),
      categoria: datosFormulario.categoria,
      urlImagen: datosFormulario.urlImagen.trim() || IMAGEN_SUBASTA_POR_DEFECTO,
    };

    if (!bloquearCamposFinancieros) {
      datosEnvio.precioInicial = datosFormulario.precioInicial;
      datosEnvio.incrementoMinimo = datosFormulario.incrementoMinimo;
      if (!estaEditando || (datosFormulario.fechaFin && datosFormulario.fechaFin !== fechaFinInicial)) {
        datosEnvio.fechaFin = inputLocalAFechaIso(datosFormulario.fechaFin);
      }
    }

    if (estaEditando && datosFormulario.estado !== subasta.status) {
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
      {bloquearCamposFinancieros && (
        <Alert type="warning" title="Regla de Negocio RN08 (Inmutabilidad por Oferta)">
          Esta subasta ya cuenta con ofertas registradas. El precio base, incremento mínimo y cierre quedan bloqueados para proteger a los postores.
        </Alert>
      )}

      {mensajeError && (
        <Alert type="error" onClose={() => setMensajeError('')}>{mensajeError}</Alert>
      )}

      <CamposSubasta
        datosFormulario={datosFormulario}
        estaEditando={estaEditando}
        subasta={subasta}
        bloquearCamposFinancieros={bloquearCamposFinancieros}
        alCambiar={manejarCambio}
      />

      <AccionesFormulario
        alCancelar={alCancelar}
        textoGuardar={textoBotonGuardar || (estaEditando ? 'Guardar Cambios' : 'Publicar Subasta')}
        iconoGuardar={<Save className="w-4 h-4" />}
      />
    </form>
  );
}
