/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/Inicio.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de la página de inicio (Landing Page) de la aplicación BidZone.
 * Es la primera vista que ve un visitante al entrar a la ruta raíz "/".
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Presenta la cabecera interactiva (Hero / PortadaInicio) con buscador rápido de subastas.
 * 2. Muestra tarjetas explicativas de confianza y seguridad basadas en las Reglas de Negocio (RN01, RN05, RN06, RN07).
 * 3. Muestra una sección con un catálogo previo de subastas activas filtrable por categorías.
 * 4. Muestra un bloque promocional con los módulos y ventajas de la plataforma (SeccionModulosInicio).
 *
 * ¿DE DÓNDE OBTIENE LA INFORMACIÓN?
 * - Tienda Zustand de subastas (`usarTiendaSubastas`): Obtiene la lista global de subastas, el estado de error,
 *   la función para sincronizar con la API (`obtenerSubastas`) y el modificador de filtros (`actualizarFiltros`).
 * - Estado local (`useState`): Gestiona la categoría activa seleccionada para filtrar el catálogo en portada.
 * - Enrutamiento (`useNavigate` de React Router): Permite redirigir al usuario al catálogo completo (`/subastas`)
 *   cuando realiza una búsqueda desde el formulario de la portada.
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, Gavel, PhoneCall, Star } from 'lucide-react';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';
import { PortadaInicio } from './PortadaInicio';
import { SeccionCatalogoInicio } from './SeccionCatalogoInicio';
import { SeccionModulosInicio } from './SeccionModulosInicio';

/**
 * Categorías principales sugeridas para los filtros de la página de inicio.
 * Es un arreglo estático de strings que se pasa tanto a la portada como al catálogo preliminar.
 */
const CATEGORIAS_INICIO = ['Todas', 'Tecnología', 'Gaming', 'Hogar y Oficina', 'Fotografía'];

/**
 * Arreglo con la información didáctica de seguridad del sistema.
 * Resume visualmente el marco regulatorio de BidZone (RN01, RN05, RN06 y RN07)
 * para transmitir transparencia y confianza al nuevo usuario.
 */
const TARJETAS_SEGURIDAD = [
  {
    titulo: 'Ofertas en vivo auditables',
    texto: 'Cada puja supera el monto actual respetando el incremento mínimo configurado por el dueño (RN01).',
    icono: Gavel,
    destacada: true, // Se resalta con un fondo verde oscuro principal
  },
  {
    titulo: 'Liberación de datos al ganar',
    texto: 'Cuando cierra la subasta se desbloquean teléfono, WhatsApp y correo del vendedor y del ganador (RN05).',
    icono: PhoneCall,
  },
  {
    titulo: 'Infracción o cierre de cuenta',
    texto: 'Si alguna parte incumple el pago o entrega, se reporta en la página y se aplica sanción o cierre (RN06).',
    icono: AlertTriangle,
  },
  {
    titulo: 'Reputación de 1 a 5 estrellas',
    texto: 'Calificaciones mutuas verificadas tras cada operación para construir confianza en la comunidad (RN07).',
    icono: Star,
  },
];

export function Inicio() {
  /**
   * Hook `useNavigate`:
   * Proporciona la función `navegar` para cambiar de ruta programáticamente
   * (por ejemplo, después de que el usuario presione el botón de buscar).
   */
  const navegar = useNavigate();

  /**
   * Suscripción reactiva al estado global de subastas vía Zustand:
   * Extraemos únicamente los selectores necesarios para evitar renderizados redundantes.
   */
  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const errorSubastas = usarTiendaSubastas((estado) => estado.error);
  const obtenerSubastas = usarTiendaSubastas((estado) => estado.obtenerSubastas);
  const actualizarFiltros = usarTiendaSubastas((estado) => estado.actualizarFiltros);

  /**
   * Estado local con `useState`:
   * Almacena el nombre de la categoría actualmente activa en la barra de pestañas del inicio.
   * Por defecto arranca en 'Todas'.
   */
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');

  /**
   * Hook `useEffect`:
   * Se ejecuta una vez cuando el componente se monta en el navegador.
   * Llama a `obtenerSubastas()` para asegurar que la tienda tenga la lista fresca
   * cargada desde el backend o almacenamiento local.
   */
  useEffect(() => {
    obtenerSubastas();
  }, [obtenerSubastas]);

  /**
   * Manejador de búsqueda desde la Portada:
   * Recibe el objeto con los términos de búsqueda que el usuario escribió en `PortadaInicio`,
   * actualiza los filtros globales en la tienda Zustand y navega a `/subastas`.
   *
   * @param {Object} filtrosPortada - Objeto con { busqueda, categoria, etc. }
   */
  function buscarDesdePortada(filtrosPortada) {
    actualizarFiltros(filtrosPortada);
    navegar('/subastas');
  }

  return (
    <div className="w-full">
      {/* 1. Portada con llamada a la acción y buscador interactivo */}
      <PortadaInicio categorias={CATEGORIAS_INICIO} alBuscar={buscarDesdePortada} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-16 py-12 sm:py-16">
        {/* 2. Sección explicativa sobre seguridad, reglas de negocio y transparencia */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-6 space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#224F10]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#224F10]" />
                <span>SOBRE LA PLATAFORMA</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0D0D0D] leading-tight">
                Tu seguridad en cada puja empieza aquí
              </h2>
            </div>

            <div className="lg:col-span-6 space-y-3">
              <p className="text-xs sm:text-sm text-[#0D0D0D]/70 leading-relaxed">
                BidZone elimina comisiones ocultas, billeteras complejas y retenciones bancarias. Al finalizar una subasta con ganador, se liberan automáticamente los datos de contacto de ambas partes.
              </p>
              <Link
                to="/reglamentos"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#0D0D0D] hover:text-[#224F10]"
              >
                <span>Conoce nuestro reglamento y sanciones</span>
                <span className="w-6 h-6 rounded-full bg-white border border-[#224F10]/20 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#224F10]" />
                </span>
              </Link>
            </div>
          </div>

          {/* Grilla con 4 tarjetas de valor y reglas de negocio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TARJETAS_SEGURIDAD.map((tarjeta) => {
              /**
               * Asignación de componente a variable en mayúscula:
               * En JSX, para renderizar un icono dinámicamente guardado como referencia en un objeto,
               * debemos asignarlo a una constante con mayúscula inicial (`IconoTarjeta`).
               */
              const IconoTarjeta = tarjeta.icono;
              const claseCaja = tarjeta.destacada
                ? 'bg-[#224F10] text-[#EAFFD0] shadow-sm'
                : 'bg-white/80 border border-[#224F10]/12';
              const claseIcono = tarjeta.destacada
                ? 'bg-[#EAFFD0] text-[#224F10]'
                : 'bg-[#B0E454]/40 text-[#224F10]';
              const claseTexto = tarjeta.destacada ? 'text-[#EAFFD0]/75' : 'text-[#0D0D0D]/65';

              return (
                <div
                  key={tarjeta.titulo}
                  className={`rounded-3xl p-6 flex flex-col justify-between min-h-[210px] ${claseCaja}`}
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center ${claseIcono}`}>
                    <IconoTarjeta className="w-5 h-5" />
                  </span>
                  <div className="space-y-1.5 pt-8">
                    <h3 className="text-base font-semibold">{tarjeta.titulo}</h3>
                    <p className={`text-xs leading-relaxed ${claseTexto}`}>{tarjeta.texto}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Catálogo preliminar de subastas en vivo filtrable */}
        <SeccionCatalogoInicio
          categorias={CATEGORIAS_INICIO}
          categoriaSeleccionada={categoriaSeleccionada}
          alElegirCategoria={setCategoriaSeleccionada}
          subastas={subastas}
          errorSubastas={errorSubastas}
        />

        {/* 4. Módulos y funcionalidades destacadas de la plataforma */}
        <SeccionModulosInicio />
      </div>
    </div>
  );
}

