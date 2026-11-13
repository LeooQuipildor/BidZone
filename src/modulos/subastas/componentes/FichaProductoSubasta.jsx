/**
 * ==============================================================================
 * ARCHIVO: src/modulos/subastas/componentes/FichaProductoSubasta.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de presentación de la ficha técnica y galería fotográfica del lote
 * en la página de detalle de la subasta (`VistaDetalleSubasta.jsx`).
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Obtiene las fotografías del producto (la foto original más imágenes complementarias de muestra)
 *    a través de la función utilitaria `obtenerFotosSubasta`.
 * 2. Administra un visor principal interactivo que exhibe la imagen seleccionada completa (`object-contain`).
 * 3. Renderiza una cuadrícula de 4 miniaturas clicables que permiten alternar la fotografía principal activa.
 * 4. Muestra insignias de estado (Subasta en Vivo vs Finalizada) y categoría del artículo.
 * 5. Presenta el título completo, la descripción y un bloque de datos técnicos:
 *    - Precio base de salida.
 *    - Incremento mínimo por puja (RN01).
 *    - Nombre del vendedor y su reputación promedio en estrellas (RN07).
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * Son enviadas por `VistaDetalleSubasta.jsx`:
 * - `subasta`: Objeto con las propiedades del artículo.
 * - `vendedor`: Objeto con los datos del usuario vendedor (nombre, reputación, etc.).
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Visor interactivo con estado local:
 *   `const [fotoSeleccionada, setFotoSeleccionada] = useState('')` guarda la URL de la miniatura clickeada.
 * - Derivación de índice activo con `indexOf` y fallback:
 *   `const indiceActivo = fotos.includes(fotoSeleccionada) ? fotos.indexOf(fotoSeleccionada) : 0`
 *   asegura que siempre haya una foto válida seleccionada aunque el usuario no haya hecho clic aún.
 * - Ajuste fotográfico con `object-contain`:
 *   A diferencia de `object-cover` (que recorta la imagen para llenar el contenedor), `object-contain`
 *   garantiza que el producto se aprecie en su totalidad sin deformarse ni perder detalles visuales.
 */

import React, { useState } from 'react';
import { Badge } from '../../nucleo/diseno/ui';
import { formatearMoneda } from '../../nucleo/utilidades/formatos';
import { obtenerFotosSubasta } from '../utilidades/galeriaSubasta';

/**
 * Función auxiliar para obtener la variante visual de la insignia de estado.
 *
 * @param {string} estado - Estado de la subasta ('activa' o 'finalizada').
 * @returns {{variant: string, texto: string}}
 */
function obtenerEtiquetaEstado(estado) {
  if (estado === 'activa') return { variant: 'success', texto: 'Subasta en Vivo' };
  return { variant: 'default', texto: 'Subasta Finalizada' };
}

export function FichaProductoSubasta({ subasta, vendedor }) {
  // Obtenemos el arreglo de fotos del lote (siempre devuelve al menos 4 imágenes)
  const fotos = obtenerFotosSubasta(subasta);

  // Estado que recuerda cuál fotografía de la galería está activa en el visor
  const [fotoSeleccionada, setFotoSeleccionada] = useState('');

  // Cálculo del índice numérico de la foto activa (0 si es la primera vez)
  const indiceActivo = fotos.includes(fotoSeleccionada) ? fotos.indexOf(fotoSeleccionada) : 0;
  const fotoPrincipal = fotos[indiceActivo] || fotos[0];

  // Configuración del badge (verde para activa, gris para finalizada)
  const etiquetaEstado = obtenerEtiquetaEstado(subasta.status);

  return (
    <div className="rounded-3xl bg-[#F5FFEB] border border-[#224F10]/15 overflow-hidden shadow-xs">
      {/* 1. Galería de fotos con visor principal y miniaturas */}
      <div className="bg-white border-b border-[#224F10]/10 p-4 sm:p-5 space-y-3">
        {/* Visor principal: muestra la imagen completa sin recortes ni zoom */}
        <div className="relative h-72 sm:h-[400px] w-full rounded-2xl bg-[#F7FBF3] border border-[#224F10]/10 p-3 flex items-center justify-center overflow-hidden">
          <img
            src={fotoPrincipal}
            alt={`${subasta.title} — imagen ${indiceActivo + 1}`}
            className="max-w-full max-h-full w-auto h-auto object-contain"
          />

          {/* Insignias superiores de categoría y estado */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge variant="lime">{subasta.category}</Badge>
            <Badge variant={etiquetaEstado.variant}>{etiquetaEstado.texto}</Badge>
          </div>

          {/* Indicador de posición de la fotografía (ej: 1 / 4) */}
          <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-[#0D0D0D]/75 text-[#EAFFD0] text-[11px] font-semibold">
            {indiceActivo + 1} / {fotos.length}
          </span>
        </div>

        {/* Cuadrícula de 4 miniaturas para alternar la foto principal */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {fotos.map((urlFoto, indice) => {
            const estaActiva = indice === indiceActivo;
            const estiloRecuadro = estaActiva
              ? 'border-2 border-[#224F10] ring-2 ring-[#B0E454]/60 bg-white'
              : 'border border-[#224F10]/15 bg-[#F7FBF3] opacity-80 hover:opacity-100 hover:border-[#224F10]/45';

            return (
              <button
                key={urlFoto}
                type="button"
                onClick={() => setFotoSeleccionada(urlFoto)}
                aria-label={`Ver foto ${indice + 1} de ${subasta.title}`}
                className={`h-16 sm:h-20 w-full rounded-2xl p-1.5 flex items-center justify-center overflow-hidden transition-colors cursor-pointer ${estiloRecuadro}`}
              >
                <img
                  src={urlFoto}
                  alt={`${subasta.title} — vista ${indice + 1}`}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Información detallada del artículo */}
      <div className="p-6 sm:p-8 space-y-4">
        <h1 className="font-serif-display text-3xl sm:text-5xl text-[#0D0D0D] leading-tight">
          {subasta.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#0D0D0D]/75 leading-relaxed">
          {subasta.description}
        </p>

        {/* Ficha técnica con 3 cajas informativas: Precio base, incremento mínimo y vendedor */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#224F10]/15 text-xs">
          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#224F10]/15">
            <span className="text-[11px] text-[#0D0D0D]/55 block">Precio Base</span>
            <strong className="font-serif-display text-2xl text-[#0D0D0D]">
              {formatearMoneda(subasta.basePrice)}
            </strong>
          </div>
          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#224F10]/15">
            <span className="text-[11px] text-[#0D0D0D]/55 block">Incremento Mín. (RN01)</span>
            <strong className="font-serif-display text-2xl text-[#224F10]">
              + {formatearMoneda(subasta.minIncrement)}
            </strong>
          </div>
          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#224F10]/15">
            <span className="text-[11px] text-[#0D0D0D]/55 block">Dueño / Vendedor</span>
            <strong className="text-sm font-semibold text-[#0D0D0D] block mt-1">
              {vendedor?.name || 'Usuario'} ({vendedor?.reputation || '5.0'} ★)
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

