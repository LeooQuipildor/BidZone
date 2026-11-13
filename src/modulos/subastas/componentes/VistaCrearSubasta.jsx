/**
 * ==============================================================================
 * ARCHIVO: src/modulos/subastas/componentes/VistaCrearSubasta.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de vista de página completa para que un usuario autenticado publique
 * un nuevo artículo en subasta (ruta `/subastas/nueva`).
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Envuelve la pantalla en el contenedor estilizado `PaginaFormulario`.
 * 2. Conecta la acción `crearSubasta` de la tienda Zustand `usarTiendaSubastas`.
 * 3. Renderiza el componente de lógica `FormularioSubasta` configurado para alta nueva.
 * 4. Tras crear exitosamente el lote en el backend o memoria, redirige automáticamente
 *    a la persona hacia la página de detalle de su nueva subasta (`/subastas/:id`).
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Redirección con ID generado:
 *   `const creada = await crearSubasta(datos); navegar('/subastas/' + creada.id);`
 *   Demuestra cómo esperar la resolución de una promesa asíncrona que devuelve la entidad recién
 *   creada con su nuevo ID asignado por el servidor.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usarTiendaSubastas } from '../estado/tiendaSubastas';
import { FormularioSubasta } from './FormularioSubasta';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaCrearSubasta() {
  const navegar = useNavigate();

  // Acción para persistir la nueva subasta
  const crearSubasta = usarTiendaSubastas((estado) => estado.crearSubasta);

  /**
   * Manejador de guardado:
   * Espera la creación de la subasta y redirige a su página de detalle.
   *
   * @param {Object} datos - Objeto con { titulo, descripcion, categoria, etc. }
   */
  async function manejarCreacion(datos) {
    const creada = await crearSubasta(datos);
    navegar(`/subastas/${creada.id}`);
  }

  return (
    <PaginaFormulario
      titulo="Publicar Nueva Subasta"
      subtitulo="Define las condiciones de subasta. Al finalizar con ganador, se liberarán mutuamente los datos de contacto."
      textoVolver="Volver al catálogo"
      alVolver={() => navegar('/subastas')}
    >
      <FormularioSubasta
        alEnviarFormulario={manejarCreacion}
        alCancelar={() => navegar('/subastas')}
        textoBotonGuardar="Publicar Subasta"
      />
    </PaginaFormulario>
  );
}
