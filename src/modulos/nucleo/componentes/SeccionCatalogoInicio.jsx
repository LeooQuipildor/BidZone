/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/SeccionCatalogoInicio.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de presentación que muestra un avance o vista preliminar del catálogo
 * de subastas directamente en la página de inicio.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Muestra un encabezado con una barra de filtros por categoría tipo pastilla (`FiltrosBotones`).
 * 2. Filtra la lista de subastas en memoria según la categoría seleccionada por el usuario.
 * 3. Muestra hasta 7 tarjetas de subastas (`TarjetaSubasta`) con cronómetros en vivo.
 * 4. Muestra una tarjeta especial final (`TarjetaCtaCatalogo`) que invita a explorar el catálogo completo en `/subastas`.
 * 5. Muestra mensajes de error si la carga de subastas falló y no hay datos en caché.
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * Son enviadas por el componente padre `Inicio.jsx`:
 * - `categorias`: Arreglo de strings con las categorías a mostrar.
 * - `categoriaSeleccionada`: String de la categoría actualmente activa.
 * - `alElegirCategoria`: Función que actualiza el estado de categoría en `Inicio.jsx`.
 * - `subastas`: Arreglo de objetos de subasta obtenidos de la tienda Zustand.
 * - `errorSubastas`: Mensaje de error proveniente de la tienda si falló la API.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Custom Hook `useRelojSegundo`: Provee el timestamp actual en milisegundos (`ahoraMs`) actualizado cada segundo.
 *   Se pasa como prop a cada `TarjetaSubasta` para que calculen el tiempo restante sin necesidad de que cada tarjeta
 *   cree su propio intervalo `setInterval`, optimizando drásticamente el rendimiento del navegador.
 * - Método `filter` y operador ternario: Para derivar datos calculados a partir de props sin crear estado redundante.
 * - Método `slice(0, 7)`: Limita la cantidad de elementos mostrados para no sobrecargar visualmente la portada.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TarjetaSubasta } from '../../subastas/componentes/TarjetaSubasta';
import { useRelojSegundo } from '../utilidades/ayudas';
import { FiltrosBotones, TarjetaCtaCatalogo } from '../diseno/componentesBloques';

export function SeccionCatalogoInicio({
  categorias,
  categoriaSeleccionada,
  alElegirCategoria,
  subastas,
  errorSubastas,
}) {
  /**
   * Hook `useNavigate`:
   * Permite redirigir al usuario al catálogo principal (`/subastas`)
   * cuando pulsa el botón en la tarjeta de llamado a la acción.
   */
  const navegar = useNavigate();

  /**
   * Custom hook `useRelojSegundo`:
   * Emite `Date.now()` cada 1000 milisegundos.
   * Centraliza la fuente del tiempo para todos los relojes de cuenta regresiva de la sección.
   */
  const ahoraMs = useRelojSegundo();

  /**
   * Derivación de datos en tiempo de renderizado:
   * Si la categoría elegida es 'Todas', mostramos la lista completa.
   * Si es una categoría específica, usamos `filter` para comparar con `subasta.category`.
   */
  const catalogoFiltrado =
    categoriaSeleccionada === 'Todas'
      ? subastas
      : subastas.filter((subasta) => subasta.category === categoriaSeleccionada);

  return (
    <section className="space-y-7">
      {/* Cabecera de la sección con título y botones de filtrado rápido */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#224F10]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#224F10]" />
            <span>CATÁLOGO DE SUBASTAS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0D0D0D]">
            Elige tu próximo artículo
          </h2>
        </div>

        {/* Componente reutilizable para renderizar los botones de categoría */}
        <FiltrosBotones
          opciones={categorias}
          valorActual={categoriaSeleccionada}
          alElegir={alElegirCategoria}
          claseInactivo="bg-white/75 text-[#0D0D0D]/75 hover:bg-white border border-[#224F10]/12"
        />
      </div>

      {/* Alerta visual en caso de que ocurra un error de red y no haya subastas disponibles */}
      {errorSubastas && subastas.length === 0 && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-800 font-medium">
          {errorSubastas}
        </div>
      )}

      {/* Grilla responsiva de tarjetas de subasta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Renderizado de hasta 7 tarjetas con slice */}
        {catalogoFiltrado.slice(0, 7).map((subasta) => (
          <TarjetaSubasta key={subasta.id} subasta={subasta} ahoraMs={ahoraMs} />
        ))}

        {/* Tarjeta final de Call To Action que completa el hueco de la grilla */}
        <TarjetaCtaCatalogo
          titulo={`${subastas.length} lotes activos y adjudicados`}
          descripcion="Explora todas las categorías, filtra por precio y consulta el historial completo de ofertas en vivo."
          textoBoton="Ver todos los lotes"
          alHacerClic={() => navegar('/subastas')}
        />
      </div>
    </section>
  );
}
