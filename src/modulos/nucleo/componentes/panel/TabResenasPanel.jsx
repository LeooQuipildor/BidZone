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

const FILTROS_DIRECCION = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'recibidas', etiqueta: 'Recibidas' },
  { valor: 'emitidas', etiqueta: 'Emitidas' },
];

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
    (r) => mismoId(r.autorId, usuarioActual?.id) || mismoId(r.calificadoId, usuarioActual?.id)
  );

  // Filtro compuesto por dirección (recibidas/emitidas) y por texto de búsqueda
  const resenasFiltradas = misResenas.filter((resena) => {
    if (filtroDireccion === 'recibidas' && !mismoId(resena.calificadoId, usuarioActual?.id)) return false;
    if (filtroDireccion === 'emitidas' && !mismoId(resena.autorId, usuarioActual?.id)) return false;
    const calificado = buscarPorId(usuarios, resena.calificadoId);
    const autor = buscarPorId(usuarios, resena.autorId);
    const subasta = buscarPorId(subastas, resena.subastaId);
    return coincideConBusqueda(
      [
        resena.comentario,
        calificado?.nombre || resena.nombreCalificado,
        autor?.nombre || resena.nombreAutor,
        subasta?.titulo || resena.tituloSubasta,
      ],
      textoBusqueda
    );
  });

  function cerrarFormulario() {
    setFormularioAbierto(false);
    setIdResenaEditando(null);
  }

  function manejarGuardado() {
    setAviso({
      tipo: 'exito',
      texto: resenaEditando
        ? `Calificación #${resenaEditando.id} actualizada y reputación recalculada.`
        : 'Calificación publicada y reputación actualizada (RN07).',
    });
    cerrarFormulario();
  }

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
        subtitulo={`Tu reputación: ${usuarioActual?.reputacion || '5.0'} ★ · ${subastasPendientes.length} operaciones pendientes de calificar.`}
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
            const subasta = buscarPorId(subastas, resena.subastaId);
            const autor = buscarPorId(usuarios, resena.autorId);
            const calificado = buscarPorId(usuarios, resena.calificadoId);
            return (
              <TarjetaResenaPanel
                key={resena.id}
                resena={resena}
                tituloSubasta={subasta?.titulo || resena.tituloSubasta || `Subasta #${resena.subastaId}`}
                nombreAutor={autor?.nombre || resena.nombreAutor || `Usuario #${resena.autorId}`}
                nombreCalificado={calificado?.nombre || resena.nombreCalificado || `Usuario #${resena.calificadoId}`}
                puedeEditar={mismoId(usuarioActual?.id, resena.autorId)}
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
