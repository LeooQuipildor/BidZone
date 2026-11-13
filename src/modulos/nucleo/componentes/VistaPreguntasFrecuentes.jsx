// ============================================================================
// ARCHIVO: src/modulos/nucleo/componentes/VistaPreguntasFrecuentes.jsx
// RESPONSABILIDAD: Sección de Preguntas Frecuentes (FAQ) con acordeón interactivo.
// ============================================================================
//
// CONCEPTO REACT: COMPONENTE ACORDEÓN CON ESTADO LOCAL
// En este archivo se implementa un patrón clásico de interfaz: el "Acordeón".
// 1. 'const [indiceAbierto, setIndiceAbierto] = useState(0)': Guarda el índice de
//    la pregunta que se encuentra desplegada actualmente (0 para que la primera
//    comience abierta al entrar).
// 2. 'alternarPregunta(indice)': Si el usuario hace clic sobre la pregunta ya abierta,
//    la cierra fijando el estado en -1; si hace clic sobre otra, cambia el índice.
// 3. Renderizado Condicional: '{estaAbierta && ( ... )}' solo monta el bloque
//    de respuesta cuando 'indiceAbierto === indice'.
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Button, Card } from '../diseno/ui';
import { CabeceraPagina } from '../diseno/componentesBloques';

// Listado de preguntas y respuestas informativas
const PREGUNTAS_FRECUENTES = [
  {
    pregunta: '¿Cómo participo y envío una oferta en BidZone?',
    respuesta:
      'Inicia sesión o crea tu cuenta gratuita, entra al lote que te interese desde Explorar y oferta un monto que respete el incremento mínimo indicado (RN01).',
  },
  {
    pregunta: '¿Puedo cancelar una puja después de haberla confirmado?',
    respuesta:
      'No. Según la regla RN04 todas las ofertas son vinculantes para proteger la transparencia de la sala. Solo puedes editar la nota aclaratoria de coordinación.',
  },
  {
    pregunta: '¿Cómo se realiza el pago y la entrega al ganar una subasta?',
    respuesta:
      'BidZone funciona sin billeteras ni retenciones intermedias. Al finalizar la subasta con un ganador, liberamos el teléfono y correo de ambas partes para que acuerden pago y retiro directamente (RN05).',
  },
  {
    pregunta: '¿Por qué no puedo ver el teléfono ni correo del vendedor antes del cierre?',
    respuesta:
      'Para cuidar la privacidad de todos los usuarios (RN05). Los datos de contacto directo solo se desbloquean cuando el reloj finaliza y se adjudica el artículo.',
  },
  {
    pregunta: '¿Qué pasa si la otra parte incumple con el pago o la entrega?',
    respuesta:
      'Puedes radicar un reporte con evidencia desde el detalle de la subasta o tu panel (RN06). Un administrador revisará el caso y podrá suspender o cerrar la cuenta infractora.',
  },
  {
    pregunta: '¿Puedo modificar el precio base o cierre después de publicar mi lote?',
    respuesta:
      'Sí, siempre que todavía no haya recibido ninguna puja. Una vez ingresada la primera oferta válida, esos valores quedan bloqueados por seguridad (RN08).',
  },
  {
    pregunta: '¿Cómo funcionan las reseñas y la reputación?',
    respuesta:
      'Al cerrarse una subasta con ganador, vendedor y comprador pueden calificarse mutuamente de 1 a 5 estrellas (RN07) y esa puntuación actualiza el promedio visible en sus perfiles.',
  },
];

export function VistaPreguntasFrecuentes() {
  const navegar = useNavigate();

  // Estado local: Guarda qué pregunta está desplegada (inicia con la primera, índice 0)
  const [indiceAbierto, setIndiceAbierto] = useState(0);

  /**
   * Alterna la apertura de una pregunta.
   * Si la pregunta cliqueada ya estaba abierta, la cierra asignando -1.
   */
  function alternarPregunta(indice) {
    setIndiceAbierto((actual) => (actual === indice ? -1 : indice));
  }

  return (
    <div className="space-y-8">
      {/* Cabecera común de la página */}
      <CabeceraPagina
        titulo="Preguntas Frecuentes"
        subtitulo="Respuestas claras sobre cómo pujar, coordinar la entrega al ganar y usar BidZone con seguridad."
        accion={
          <Button onClick={() => navegar('/subastas')}>Ver catálogo</Button>
        }
      />

      {/* Lista de preguntas tipo acordeón */}
      <div className="space-y-3 max-w-4xl">
        {PREGUNTAS_FRECUENTES.map((item, indice) => {
          const estaAbierta = indiceAbierto === indice;
          return (
            <Card key={item.pregunta} className="p-0 overflow-hidden">
              <button
                type="button"
                onClick={() => alternarPregunta(indice)}
                className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#EAFFD0]/35 transition-colors"
              >
                <span className="flex items-center gap-3 text-sm sm:text-base font-semibold text-[#0D0D0D]">
                  <HelpCircle className="w-4 h-4 text-[#224F10] shrink-0" />
                  {item.pregunta}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#224F10] shrink-0 transition-transform ${
                    estaAbierta ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Renderizado condicional del cuerpo de la respuesta */}
              {estaAbierta && (
                <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#0D0D0D]/75 leading-relaxed border-t border-[#224F10]/10">
                  {item.respuesta}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

