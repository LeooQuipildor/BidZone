/**
 * ==============================================================================
 * ARCHIVO: src/modulos/subastas/componentes/FormularioSubasta.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente contenedor de lógica para la creación y edición de subastas.
 * Administra el estado de los campos, la validación de fechas futuras y la aplicación
 * estricta de la Regla de Negocio RN08 (Inmutabilidad de condiciones tras recibir ofertas).
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Inicializa el formulario con valores vacíos (en modo creación) o con los datos del lote
 *    recibido en la prop `subasta` (en modo edición).
 * 2. Transforma la fecha ISO del backend a formato compatible con `<input type="datetime-local">`
 *    usando `fechaParaInputLocal`.
 * 3. Evalúa la condición RN08: Si la subasta ya tiene pujas (`tienePujas === true`) y el usuario no
 *    es administrador (`!esAdmin`), bloquea los campos financieros para proteger a los postores.
 * 4. Valida en el cliente que el título y la descripción no estén vacíos y que la fecha de finalización
 *    sea estrictamente posterior al momento actual.
 * 5. Empaqueta el objeto limpio `datosEnvio` y lo remite al callback `alEnviarFormulario`.
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * Son enviadas por las vistas contenedoras (`VistaCrearSubasta.jsx`, `VistaEditarSubasta.jsx` o modales del panel):
 * - `subasta`: Objeto con los datos del artículo (o `null`).
 * - `tienePujas`: Booleano que indica si el lote ya tiene al menos una oferta.
 * - `esAdmin`: Booleano que indica si quien opera tiene rol administrativo.
 * - `alEnviarFormulario`: Función asíncrona que despacha la acción de guardado al store o backend.
 * - `alCancelar`: Callback para cerrar el formulario o navegar atrás.
 * - `textoBotonGuardar`: Texto personalizado opcional para el botón principal.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Conversión bidireccional de Fechas:
 *   Los navegadores exigen que `<input type="datetime-local">` reciba formato `YYYY-MM-DDTHH:mm`.
 *   Al recibir datos del backend convertimos con `fechaParaInputLocal` y al enviar usamos `inputLocalAFechaIso`.
 * - Validación temporal con `Date.now()`:
 *   Para evitar subastas caducadas de origen, se compara `new Date(fechaFin).getTime() <= Date.now()`.
 */

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
  const fechaFinInicial = fechaParaInputLocal(subasta?.endTime);

  /**
   * Estado de los campos del formulario con inicialización perezosa (Lazy state).
   */
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

  // Estado para alertas y errores de validación
  const [mensajeError, setMensajeError] = useState('');

  /**
   * Regla de Negocio RN08:
   * Si la subasta ya recibió ofertas, el vendedor no puede cambiar precios ni acortar fechas.
   * Solo un administrador tiene permisos excepcionales de corrección.
   */
  const bloquearCamposFinancieros = Boolean(estaEditando && tienePujas && !esAdmin);

  /**
   * Manejador de cambios reactivo para todos los campos.
   */
  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setDatosFormulario((previo) => ({ ...previo, [name]: value }));
  }

  /**
   * Manejador de envío con validación previa de reglas de negocio.
   */
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
      if (!estaEditando || (datosFormulario.fechaFin && datosFormulario.fechaFin !== fechaFinInicial)) {
        datosEnvio.fechaFin = inputLocalAFechaIso(datosFormulario.fechaFin);
      }
    }

    // Si cambió el estado en modo edición, se envía la actualización
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
      {/* Alerta explicativa de la Regla de Negocio RN08 */}
      {bloquearCamposFinancieros && (
        <Alert type="warning" title="Regla de Negocio RN08 (Inmutabilidad por Oferta)">
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
