// ============================================================================
// ARCHIVO: src/modulos/nucleo/diseno/componentesBloques.jsx
// RESPONSABILIDAD: Estructuras compuestas reutilizables (Moleculas / Organismos UI).
// ============================================================================
//
// ¿QUÉ SON ESTOS COMPONENTES?
// Son composiciones de segundo nivel que combinan átomos básicos ('ui.jsx' y 'uiFeedback.jsx')
// para resolver patrones repetidos en múltiples vistas:
// 1. 'CabeceraPagina': Encabezado con insignia, título grande, subtítulo y botón de acción.
// 2. 'PaginaFormulario': Envoltorio estándar para pantallas '/new' y '/edit'.
// 3. 'AccionesFormulario': Botonera uniforme de Guardar / Cancelar en formularios.
// 4. 'DatosContactoPersona': Tarjeta con teléfono, WhatsApp y correo liberados tras ganar (RN05).
// 5. 'FiltrosBotones': Barra horizontal de botones tipo píldora (categorías o estados).
// 6. 'TarjetaCtaCatalogo': Tarjeta promocional que invita al usuario a vender su propio lote.
// ============================================================================

import React from 'react';
import { ArrowLeft, ArrowRight, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { Button, Card } from './ui';
import { ErrorCard, Loading } from './uiFeedback';

/**
 * Componente: CabeceraPagina
 * Título principal con subtítulo y botón opcional alineado a la derecha.
 * Se utiliza en: 'VistaListaSubastas.jsx', 'PaginaFormulario.jsx', etc.
 */
export function CabeceraPagina({ titulo, subtitulo, accion }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-8 border-b border-[#224F10]/15">
      <div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#224F10] mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#224F10]" />
          BIDZONE PLATAFORMA
        </span>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0D0D0D]">{titulo}</h1>
        {subtitulo && (
          <p className="text-xs sm:text-sm text-[#0D0D0D]/65 mt-1.5 max-w-2xl">{subtitulo}</p>
        )}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  );
}

/**
 * Componente: PaginaFormulario
 * Envoltorio que maneja estados de carga, pantalla de error y contenedor centrado para formularios.
 * Se utiliza en: 'VistaCrearSubasta', 'VistaEditarSubasta', 'VistaCrearPuja', etc.
 */
export function PaginaFormulario({
  titulo,
  subtitulo,
  textoVolver = 'Volver al listado',
  alVolver,
  cargando = false,
  textoCarga = 'Cargando...',
  errorTitulo = '',
  errorMensaje = '',
  children,
}) {
  if (cargando) return <Loading text={textoCarga} />;
  if (errorTitulo) {
    return (
      <ErrorCard
        title={errorTitulo}
        message={errorMensaje}
        backLabel={textoVolver}
        onBack={alVolver}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CabeceraPagina
        titulo={titulo}
        subtitulo={subtitulo}
        accion={
          <Button variant="outline" onClick={alVolver}>
            <ArrowLeft className="w-4 h-4" />
            {textoVolver}
          </Button>
        }
      />
      <Card className="p-6 sm:p-8 rounded-3xl">{children}</Card>
    </div>
  );
}

/**
 * Componente: AccionesFormulario
 * Fila inferior con botón Cancelar (ghost) y botón Guardar (submit con spinner opcional).
 */
export function AccionesFormulario({
  alCancelar,
  textoCancelar = 'Cancelar',
  mostrarGuardar = true,
  textoGuardar = 'Guardar',
  iconoGuardar = null,
  enviando = false,
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
      {alCancelar && (
        <Button variant="ghost" onClick={alCancelar} disabled={enviando}>
          {textoCancelar}
        </Button>
      )}
      {mostrarGuardar && (
        <Button type="submit" disabled={enviando}>
          {iconoGuardar}
          {textoGuardar}
        </Button>
      )}
    </div>
  );
}

/**
 * Componente: DatosContactoPersona
 * Bloque que muestra nombre, teléfono con WhatsApp, correo y ciudad.
 * Se utiliza en: 'PanelContactoSubasta.jsx' para la liberación condicional RN05.
 */
export function DatosContactoPersona({
  titulo,
  persona,
  nombrePorDefecto = 'Usuario',
  modoOscuro = false,
  conSeparador = false,
}) {
  const colorBorde = modoOscuro ? 'border-[#EAFFD0]/20' : 'border-[#224F10]/15';
  const claseBorde = conSeparador
    ? `border-t sm:border-t-0 sm:border-l ${colorBorde} pt-2.5 sm:pt-0 sm:pl-4`
    : '';
  const colorTitulo = modoOscuro ? 'text-[#B0E454]' : 'text-[#224F10]';
  const colorNombre = modoOscuro ? 'font-serif-display text-2xl text-[#EAFFD0]' : 'font-semibold text-[#0D0D0D]';
  const colorDato = modoOscuro ? 'text-[#EAFFD0]' : 'text-[#0D0D0D]/75';
  const colorIcono = modoOscuro ? 'text-[#B0E454]' : 'text-[#224F10]';

  return (
    <div className={`space-y-1 ${claseBorde}`}>
      <p className={`text-[10px] font-bold uppercase tracking-wider ${colorTitulo}`}>{titulo}</p>
      <p className={colorNombre}>{persona?.name || nombrePorDefecto}</p>
      <p className={`flex items-center gap-1.5 ${colorDato}`}>
        <Phone className={`w-3.5 h-3.5 shrink-0 ${colorIcono}`} />
        {persona?.phone || 'Sin teléfono'}
      </p>
      <p className={`flex items-center gap-1.5 truncate ${colorDato}`}>
        <Mail className={`w-3.5 h-3.5 shrink-0 ${colorIcono}`} />
        {persona?.email || 'Privado (RN05)'}
      </p>
      <p className={`flex items-center gap-1.5 ${colorDato}`}>
        <MapPin className={`w-3.5 h-3.5 shrink-0 ${colorIcono}`} />
        {persona?.city || 'Argentina'}
      </p>
    </div>
  );
}

/**
 * Componente: FiltrosBotones
 * Botonera horizontal de píldoras. Resalta con fondo verde oscuro la opción seleccionada.
 */
export function FiltrosBotones({ opciones, valorActual, alElegir, claseInactivo }) {
  const estiloInactivo = claseInactivo || 'bg-[#F7FBF3] text-[#0D0D0D]/70 hover:bg-[#EAFFD0]';
  return (
    <div className="flex flex-wrap items-center gap-2">
      {opciones.map((item) => {
        const valor = typeof item === 'string' ? item : item.valor;
        const etiqueta = typeof item === 'string' ? item : item.etiqueta;
        const estaActivo = valorActual === valor;
        return (
          <button
            key={valor}
            type="button"
            onClick={() => alElegir(valor)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              estaActivo ? 'bg-[#224F10] text-[#EAFFD0]' : estiloInactivo
            }`}
          >
            {etiqueta}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Componente: TarjetaCtaCatalogo
 * Tarjeta verde destacada (Call to Action) colocada al final de la cuadrícula de subastas.
 */
export function TarjetaCtaCatalogo({ titulo, descripcion, textoBoton, alHacerClic }) {
  return (
    <div className="rounded-[28px] bg-[#224F10] text-[#EAFFD0] p-6 sm:p-7 flex flex-col justify-between min-h-[320px] shadow-sm">
      <span className="w-10 h-10 rounded-full bg-[#EAFFD0] text-[#224F10] flex items-center justify-center">
        <Sparkles className="w-5 h-5" />
      </span>
      <div className="space-y-4 pt-6">
        <div className="space-y-1.5">
          <h3 className="text-xl font-semibold text-[#EAFFD0] leading-snug">{titulo}</h3>
          <p className="text-xs text-[#EAFFD0]/75 leading-relaxed">{descripcion}</p>
        </div>
        <button
          type="button"
          onClick={alHacerClic}
          className="inline-flex items-center gap-2.5 rounded-full bg-[#EAFFD0] hover:bg-[#B0E454] text-[#0D0D0D] pl-4 pr-1.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
        >
          <span>{textoBoton}</span>
          <span className="w-6 h-6 rounded-full bg-[#224F10] text-[#EAFFD0] flex items-center justify-center">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>
    </div>
  );
}
