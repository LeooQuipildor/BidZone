/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/TabResenasPanel.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE COMPONENTE?
 * Es la pestaña de gestión de Reseñas y Calificaciones del Panel de Control,
 * implementando la interfaz para la Regla de Negocio RN07:
 * "Calificaciones, Reseñas y Reputación Comunitaria".
 *
 * ¿POR QUÉ EXISTE Y CUÁL ES SU PROPÓSITO?
 * Garantiza la transparencia y confianza en las transacciones de BidZone.
 * Cuando una subasta concluye, tanto el vendedor como el postor ganador pueden
 * calificar mutuamente cómo se desarrolló el trato directo (RN05): puntualidad,
 * estado del producto y trato personal.
 *
 * Características clave:
 * 1. Muestra la reputación acumulada actual del usuario en estrellas (escala 1.0 a 5.0).
 * 2. Detecta automáticamente operaciones cerradas pendientes de calificación
 *    utilizando la función auxiliar `obtenerSubastasPendientesResena`.
 * 3. Permite emitir una nueva reseña o editar una existente mediante `FormularioResena`.
 * 4. Permite filtrar entre "Todas", "Recibidas" (evaluaciones hacia uno) y "Emitidas"
 *    (evaluaciones hechas a otros).
 * 5. Permite al autor eliminar su reseña, recalculando inmediatamente la reputación
 *    del usuario calificado.
 *
 * ¿DE DÓNDE PROVIENEN LAS PROPS?
 * - `usuarioActual`: Sesión activa de `tiendaAutenticacion.js`.
 * - `usuarios`: Directorio de usuarios de `tiendaAutenticacion.js`.
 * - `subastas`: Catálogo de lotes de `tiendaSubastas.js`.
 * - `resenas`: Registro global de calificaciones de `tiendaResenas.js`.
 * - `textoBusqueda`: Filtro textual de la barra de búsqueda del Header.
 * - `datosIniciales`: Parámetros para preabrir el formulario (`abrirFormulario`, `idSubasta`, `idUsuarioCalificado`).
 * ==============================================================================
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usarTiendaResenas } from '../../../resenas/estado/tiendaResenas';
import { FormularioResena } from '../../../resenas/componentes/FormularioResena';
import { buscarPorId, coincideConBusqueda, mismoId } from '../../utilidades/ayudas';
import { obtenerSubastasPendientesResena } from '../../../resenas/utilidades/ayudasResena';
import {
  AvisoPanel,
  BotonPanel,
  CabeceraSeccionPanel,
  ContenedorFormularioPanel,
  EstadoVacioPanel,
} from './PanelCompartido';
import { FiltrosBotones } from '../../diseno/componentesBloques';
import { TarjetaResenaPanel } from './TarjetaResenaPanel';

/** Opciones de filtro para la dirección de las calificaciones */
const FILTROS_DIRECCION = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'recibidas', etiqueta: 'Recibidas' },
  { valor: 'emitidas', etiqueta: 'Emitidas' },
];

/**
 * Componente principal: TabResenasPanel
 * ----------------------------------------------------------------------------
 * Renderiza el tablero de calificaciones personales (emitidas y recibidas) y
 * el formulario interactivo para evaluar operaciones finalizadas.
 */
export function TabResenasPanel({
  usuarioActual,
  usuarios,
  subastas,
  resenas,
  textoBusqueda,
  datosIniciales,
}) {
  // Acciones asíncronas del store de Zustand `tiendaResenas.js`
  const crearResena = usarTiendaResenas((estado) => estado.crearResena);
  const actualizarResena = usarTiendaResenas((estado) => estado.actualizarResena);
  const eliminarResena = usarTiendaResenas((estado) => estado.eliminarResena);

  // Estados locales para filtrado, modales y avisos
  const [filtroDireccion, setFiltroDireccion] = useState('todas');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(Boolean(datosIniciales?.abrirFormulario));
  const [idResenaEditando, setIdResenaEditando] = useState(null);

  // Identificación de operaciones finalizadas donde el usuario participó pero aún no calificó
  const subastasPendientes = obtenerSubastasPendientesResena(subastas, resenas, usuarioActual?.id);
  const otrosUsuarios = usuarios.filter((u) => !mismoId(u.id, usuarioActual?.id));
  const resenaEditando = idResenaEditando ? buscarPorId(resenas, idResenaEditando) : null;

  // Filtrado de calificaciones donde el usuario actual fue el autor o el evaluado
  const misResenas = resenas.filter(
    (r) => mismoId(r.reviewerId, usuarioActual?.id) || mismoId(r.targetUserId, usuarioActual?.id)
  );

  // Filtro compuesto por dirección (recibidas/emitidas) y por texto de búsqueda
  const resenasFiltradas = misResenas.filter((resena) => {
    if (filtroDireccion === 'recibidas' && !mismoId(resena.targetUserId, usuarioActual?.id)) return false;
    if (filtroDireccion === 'emitidas' && !mismoId(resena.reviewerId, usuarioActual?.id)) return false;
    const calificado = buscarPorId(usuarios, resena.targetUserId);
    const autor = buscarPorId(usuarios, resena.reviewerId);
    const subasta = buscarPorId(subastas, resena.auctionId);
    return coincideConBusqueda(
      [
        resena.comment,
        calificado?.name || resena.targetUserName,
        autor?.name || resena.reviewerName,
        subasta?.title || resena.auctionTitle,
      ],
      textoBusqueda
    );
  });

  /** Cierra el formulario modal y resetea la reseña en edición */
  function cerrarFormulario() {
    setFormularioAbierto(false);
    setIdResenaEditando(null);
  }

  /** Callback ejecutado tras guardar exitosamente una reseña */
  function manejarGuardado() {
    setAviso({
      tipo: 'exito',
      texto: resenaEditando
        ? `Calificación #${resenaEditando.id} actualizada y reputación recalculada.`
        : 'Calificación publicada y reputación actualizada (RN07).',
    });
    cerrarFormulario();
  }

  /** Maneja el borrado de una calificación propia */
  async function manejarEliminacion(resena) {
    if (!window.confirm(`¿Confirmas eliminar la calificación #${resena.id}?`)) return;
    try {
      await eliminarResena(resena.id);
      setAviso({ tipo: 'exito', texto: `Calificación #${resena.id} eliminada y reputación recalculada.` });
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    }
  }

  return (
    <div className="space-y-5">
      {/* Cabecera con reputación promedio y botón de emisión si hay operaciones pendientes */}
      <CabeceraSeccionPanel
        titulo="Mis Reseñas"
        subtitulo={`Tu reputación: ${usuarioActual?.reputation || '5.0'} ★ · ${subastasPendientes.length} operaciones pendientes de calificar.`}
        botonPrincipal={
          subastasPendientes.length > 0 && (
            <BotonPanel
              icono={<Plus className="w-3.5 h-3.5" />}
              alHacerClic={() => {
                setIdResenaEditando(null);
                setFormularioAbierto(true);
                setAviso(null);
              }}
            >
              Emitir Calificación
            </BotonPanel>
          )
        }
      />

      {/* Banner de mensajes informativos y de éxito */}
      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {/* Modal flotante del formulario de calificación */}
      {formularioAbierto && (
        <ContenedorFormularioPanel
          titulo={resenaEditando ? `Editar Calificación #${resenaEditando.id}` : 'Emitir Calificación (RN07)'}
          alCerrar={cerrarFormulario}
        >
          <FormularioResena
            key={resenaEditando ? resenaEditando.id : 'nueva-resena'}
            resena={resenaEditando}
            subastasElegibles={subastasPendientes}
            otrosUsuarios={otrosUsuarios}
            resenas={resenas}
            idUsuarioActual={usuarioActual?.id}
            idSubastaInicial={datosIniciales?.idSubasta || ''}
            idUsuarioCalificadoInicial={datosIniciales?.idUsuarioCalificado || ''}
            alCrearResena={crearResena}
            alActualizarResena={actualizarResena}
            alGuardar={manejarGuardado}
            alCancelar={cerrarFormulario}
          />
        </ContenedorFormularioPanel>
      )}

      {/* Botones de filtro de dirección: Todas / Recibidas / Emitidas */}
      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 shadow-2xs">
        <FiltrosBotones opciones={FILTROS_DIRECCION} valorActual={filtroDireccion} alElegir={setFiltroDireccion} />
      </div>

      {/* Grilla de reseñas o estado vacío */}
      {resenasFiltradas.length === 0 ? (
        <EstadoVacioPanel mensaje="Todavía no tienes reseñas recibidas ni emitidas para mostrar." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resenasFiltradas.map((resena) => {
            const subasta = buscarPorId(subastas, resena.auctionId);
            const autor = buscarPorId(usuarios, resena.reviewerId);
            const calificado = buscarPorId(usuarios, resena.targetUserId);
            return (
              <TarjetaResenaPanel
                key={resena.id}
                resena={resena}
                tituloSubasta={subasta?.title || resena.auctionTitle || `Subasta #${resena.auctionId}`}
                nombreAutor={autor?.name || resena.reviewerName || `Usuario #${resena.reviewerId}`}
                nombreCalificado={calificado?.name || resena.targetUserName || `Usuario #${resena.targetUserId}`}
                puedeEditar={mismoId(usuarioActual?.id, resena.reviewerId)}
                alEditar={() => {
                  setIdResenaEditando(resena.id);
                  setFormularioAbierto(true);
                  setAviso(null);
                }}
                alEliminar={() => manejarEliminacion(resena)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
