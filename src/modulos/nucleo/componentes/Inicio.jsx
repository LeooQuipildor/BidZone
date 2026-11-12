import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, Gavel, PhoneCall, Star } from 'lucide-react';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';
import { PortadaInicio } from './PortadaInicio';
import { SeccionCatalogoInicio } from './SeccionCatalogoInicio';
import { SeccionModulosInicio } from './SeccionModulosInicio';

const CATEGORIAS_INICIO = ['Todas', 'Tecnología', 'Gaming', 'Hogar y Oficina', 'Fotografía'];

const TARJETAS_SEGURIDAD = [
  {
    titulo: 'Ofertas en vivo auditables',
    texto: 'Cada puja supera el monto actual respetando el incremento mínimo configurado por el dueño (RN01).',
    icono: Gavel,
    destacada: true,
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
  const navegar = useNavigate();
  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const errorSubastas = usarTiendaSubastas((estado) => estado.error);
  const obtenerSubastas = usarTiendaSubastas((estado) => estado.obtenerSubastas);
  const actualizarFiltros = usarTiendaSubastas((estado) => estado.actualizarFiltros);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');

  useEffect(() => {
    obtenerSubastas();
  }, [obtenerSubastas]);

  function buscarDesdePortada(filtrosPortada) {
    actualizarFiltros(filtrosPortada);
    navegar('/auctions');
  }

  return (
    <div className="w-full">
      <PortadaInicio categorias={CATEGORIAS_INICIO} alBuscar={buscarDesdePortada} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-16 py-12 sm:py-16">
        {/* Tarjetas explicativas sobre seguridad y reglas */}
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
                to="/rules"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#0D0D0D] hover:text-[#224F10]"
              >
                <span>Conoce nuestro reglamento y sanciones</span>
                <span className="w-6 h-6 rounded-full bg-white border border-[#224F10]/20 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#224F10]" />
                </span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TARJETAS_SEGURIDAD.map((tarjeta) => {
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

        <SeccionCatalogoInicio
          categorias={CATEGORIAS_INICIO}
          categoriaSeleccionada={categoriaSeleccionada}
          alElegirCategoria={setCategoriaSeleccionada}
          subastas={subastas}
          errorSubastas={errorSubastas}
        />

        <SeccionModulosInicio />
      </div>
    </div>
  );
}

