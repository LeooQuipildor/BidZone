import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usarTiendaResenas } from '../../../resenas/estado/tiendaResenas';
import { FormularioResena } from '../../../resenas/componentes/FormularioResena';
import { buscarPorId, coincideConBusqueda, mismoId } from '../../utilidades/ayudas';
import { AvisoPanel, BotonPanel, CabeceraSeccionPanel, ContenedorFormularioPanel, EstadoVacioPanel } from './PanelCompartido';
import { FiltrosBotones } from '../../diseno/componentesBloques';
import { TarjetaResenaPanel } from './TarjetaResenaPanel';

const FILTROS_DIRECCION = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'recibidas', etiqueta: 'Recibidas' },
  { valor: 'emitidas', etiqueta: 'Emitidas' },
];

function obtenerSubastasPendientesResena(subastas, resenas, idUsuarioActual) {
  return subastas.filter((subasta) => {
    if (subasta.status !== 'finalizada' || !subasta.winnerId) return false;
    const participa = mismoId(subasta.winnerId, idUsuarioActual) || mismoId(subasta.sellerId, idUsuarioActual);
    const yaCalificada = resenas.some((r) => mismoId(r.auctionId, subasta.id) && mismoId(r.reviewerId, idUsuarioActual));
    return participa && !yaCalificada;
  });
}

// Pestaña de reseñas personales RN07 (recibidas y emitidas por el usuario conectado)
export function TabResenasPanel({ usuarioActual, usuarios, subastas, resenas, textoBusqueda, datosIniciales }) {
  const crearResena = usarTiendaResenas((estado) => estado.crearResena);
  const actualizarResena = usarTiendaResenas((estado) => estado.actualizarResena);
  const eliminarResena = usarTiendaResenas((estado) => estado.eliminarResena);

  const [filtroDireccion, setFiltroDireccion] = useState('todas');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(Boolean(datosIniciales?.abrirFormulario));
  const [idResenaEditando, setIdResenaEditando] = useState(null);

  const subastasPendientes = obtenerSubastasPendientesResena(subastas, resenas, usuarioActual?.id);
  const otrosUsuarios = usuarios.filter((u) => !mismoId(u.id, usuarioActual?.id));
  const resenaEditando = idResenaEditando ? buscarPorId(resenas, idResenaEditando) : null;

  const misResenas = resenas.filter(
    (r) => mismoId(r.reviewerId, usuarioActual?.id) || mismoId(r.targetUserId, usuarioActual?.id)
  );

  const resenasFiltradas = misResenas.filter((resena) => {
    if (filtroDireccion === 'recibidas' && !mismoId(resena.targetUserId, usuarioActual?.id)) return false;
    if (filtroDireccion === 'emitidas' && !mismoId(resena.reviewerId, usuarioActual?.id)) return false;
    const calificado = buscarPorId(usuarios, resena.targetUserId);
    const autor = buscarPorId(usuarios, resena.reviewerId);
    const subasta = buscarPorId(subastas, resena.auctionId);
    return coincideConBusqueda(
      [resena.comment, calificado?.name || resena.targetUserName, autor?.name || resena.reviewerName, subasta?.title || resena.auctionTitle],
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
      <CabeceraSeccionPanel
        titulo="Mis Reseñas"
        subtitulo={`Tu reputación: ${usuarioActual?.reputation || '5.0'} ★ · ${subastasPendientes.length} operaciones pendientes de calificar.`}
        botonPrincipal={
          subastasPendientes.length > 0 && (
            <BotonPanel icono={<Plus className="w-3.5 h-3.5" />} alHacerClic={() => { setIdResenaEditando(null); setFormularioAbierto(true); setAviso(null); }}>
              Emitir Calificación
            </BotonPanel>
          )
        }
      />

      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {formularioAbierto && (
        <ContenedorFormularioPanel titulo={resenaEditando ? `Editar Calificación #${resenaEditando.id}` : 'Emitir Calificación (RN07)'} alCerrar={cerrarFormulario}>
          <FormularioResena
            key={resenaEditando ? `${resenaEditando.id}-${resenaEditando.rating}` : `nueva-${datosIniciales?.idSubasta || ''}`}
            resena={resenaEditando}
            subastasElegibles={subastasPendientes}
            otrosUsuarios={otrosUsuarios}
            resenas={resenas}
            idUsuarioActual={usuarioActual?.id}
            esAdmin={false}
            idSubastaInicial={datosIniciales?.idSubasta || ''}
            idUsuarioCalificadoInicial={datosIniciales?.idUsuarioCalificado || ''}
            alCrearResena={crearResena}
            alActualizarResena={actualizarResena}
            alGuardar={manejarGuardado}
            alCancelar={cerrarFormulario}
          />
        </ContenedorFormularioPanel>
      )}

      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 shadow-2xs">
        <FiltrosBotones opciones={FILTROS_DIRECCION} valorActual={filtroDireccion} alElegir={setFiltroDireccion} />
      </div>

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
                alEditar={() => { setIdResenaEditando(resena.id); setFormularioAbierto(true); setAviso(null); }}
                alEliminar={() => manejarEliminacion(resena)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
