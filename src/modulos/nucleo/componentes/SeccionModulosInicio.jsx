/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/SeccionModulosInicio.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de presentación de la sección de "Ecosistema Completo" en la página de inicio.
 * Presenta un mosaico visual atractivo con enlaces directos hacia los 5 módulos funcionales de BidZone.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Muestra un bloque grande destacado enfocado en la Sala de Adjudicación Directa (Regla RN05).
 * 2. Ofrece dos botones de acción: uno para ir al Panel de Control (`/panel`) y otro para el Historial de Pujas (`/pujas`).
 * 3. Renderiza una cuadrícula de 4 tarjetas de acceso rápido (Mosaico) para:
 *    - Pujas en Vivo (`/pujas`)
 *    - Denuncias e Infracciones RN06 (`/reportes`)
 *    - Reseñas de Reputación RN07 (`/resenas`)
 *    - Perfil y Datos de Contacto (`/panel?tab=perfil`)
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Navegación Declarativa vs Programática:
 *   * En las 4 tarjetas del mosaico se usa `<Link to="...">` (declarativo, ideal para enlaces visuales estándar).
 *   * En los botones del bloque principal se usa `useNavigate()` con `onClick={() => navegar(...)` (programático).
 * - Efectos de interacción en Tailwind (`group` y `group-hover`):
 *   Al poner la clase `group` en el contenedor `<Link>`, sus hijos pueden reaccionar cuando el usuario pasa el mouse,
 *   por ejemplo aplicando un suave zoom en la imagen con `group-hover:scale-105 transition-transform`.
 * - Capas visuales de contraste (Overlays):
 *   Para que el texto blanco/verde claro sea legible sobre fotos fotográficas variables, se coloca un `div`
 *   absoluto con un degradado negro (`bg-gradient-to-t from-[#0D0D0D]/90 ...`) entre la foto y el texto.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Arreglo con la configuración del mosaico de accesos rápidos a los módulos.
 * Contiene el título, subtítulo explicativo, ruta de destino y la URL de imagen de fondo.
 */
const TARJETAS_MOSAICO = [
  {
    titulo: 'Pujas en Vivo',
    subtitulo: 'Registro auditable en tiempo real',
    ruta: '/pujas',
    imagen: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=700&q=80',
  },
  {
    titulo: 'Denuncias (RN06)',
    subtitulo: 'Infracciones y cierre de cuentas',
    ruta: '/reportes',
    imagen: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=700&q=80',
  },
  {
    titulo: 'Reseñas 1 a 5 ★',
    subtitulo: 'Calificación mutua verificada',
    ruta: '/resenas',
    imagen: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=700&q=80',
  },
  {
    titulo: 'Mi Perfil y Contacto',
    subtitulo: 'Datos personales para entrega directa',
    ruta: '/panel?tab=perfil',
    imagen: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=80',
  },
];

export function SeccionModulosInicio() {
  /**
   * Hook `useNavigate`:
   * Función para navegar entre rutas en respuesta a eventos de clic.
   */
  const navegar = useNavigate();

  return (
    <section className="space-y-7">
      {/* Cabecera explicativa de la sección */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-6 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#224F10]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#224F10]" />
            <span>ECOSISTEMA COMPLETO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0D0D0D] leading-tight">
            Coordinación directa sin intermediarios
          </h2>
        </div>
        <p className="lg:col-span-6 text-xs sm:text-sm text-[#0D0D0D]/70 leading-relaxed">
          Navega por los 5 módulos del sistema: administra subastas, revisa cada puja en tiempo real, gestiona datos de contacto liberados y audita reportes o reseñas.
        </p>
      </div>

      {/* Cuadrícula de 12 columnas: 6 columnas para el bloque grande y 6 para las 4 tarjetas del mosaico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Bloque grande izquierdo: Sala de Adjudicación Directa (RN05) */}
        <div className="lg:col-span-6 relative rounded-3xl overflow-hidden min-h-[410px] bg-[#0D0D0D] p-6 sm:p-8 flex flex-col justify-end">
          <img
            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80"
            alt="Sala de Subastas BidZone"
            className="absolute inset-0 w-full h-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/95 via-[#0D0D0D]/40 to-transparent" />

          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAFFD0]/20 backdrop-blur-md border border-[#EAFFD0]/30 text-[#EAFFD0] text-[11px] font-medium">
              Liberación de Datos (RN05)
            </span>
            <div className="space-y-1.5">
              <h3 className="text-2xl sm:text-3xl font-semibold text-[#EAFFD0]">
                Sala de Adjudicación Directa
              </h3>
              <p className="text-xs text-[#EAFFD0]/80 max-w-md leading-relaxed">
                Cuando una subasta finaliza con ganador, habilitamos el panel privado con teléfono, WhatsApp, correo y ciudad tanto del vendedor como del comprador.
              </p>
            </div>

            {/* Botones de acción directa */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => navegar('/panel')}
                className="inline-flex items-center gap-2 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] text-[#0D0D0D] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Mi Panel de Control</span>
                <span className="w-6 h-6 rounded-full bg-[#224F10] text-[#EAFFD0] flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => navegar('/pujas')}
                className="inline-flex items-center gap-2 rounded-full bg-[#EAFFD0]/15 hover:bg-[#EAFFD0]/25 backdrop-blur-md border border-[#EAFFD0]/30 text-[#EAFFD0] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Historial de Pujas</span>
                <span className="w-6 h-6 rounded-full bg-[#EAFFD0] text-[#0D0D0D] flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bloque derecho: Mosaico 2x2 con enlaces a los módulos */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TARJETAS_MOSAICO.map((item) => (
            <Link
              key={item.titulo}
              to={item.ruta}
              className="group relative rounded-3xl overflow-hidden min-h-[195px] bg-[#0D0D0D] p-5 flex items-end justify-between"
            >
              <img
                src={item.imagen}
                alt={item.titulo}
                className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/90 via-[#0D0D0D]/30 to-transparent" />
              <div className="relative z-10 pr-2">
                <h4 className="text-base font-semibold text-[#EAFFD0]">{item.titulo}</h4>
                <p className="text-[11px] text-[#EAFFD0]/75">{item.subtitulo}</p>
              </div>
              <span className="relative z-10 w-8 h-8 rounded-full bg-[#EAFFD0] text-[#0D0D0D] group-hover:bg-[#B0E454] flex items-center justify-center shrink-0 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

