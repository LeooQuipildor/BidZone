import React, { useState } from 'react';
import { Plus, Star } from 'lucide-react';
import { usarTiendaResenas } from '../../../resenas/estado/tiendaResenas';
import { FormularioResena } from '../../../resenas/componentes/FormularioResena';
import { buscarPorId, coincideConBusqueda, mismoId } from '../../utilidades/ayudas';
import {
  AvisoPanel,
  BotonPanel,
  CabeceraSeccionPanel,
  ContenedorFormularioPanel,
  EstadoVacioPanel,
  GridEstadisticasPanel,
} from './PanelCompartido';
import { TarjetaResenaPanel } from './TarjetaResenaPanel';

export function TabResenasPanel({
  usuarioActual,
  usuarios,
  subastas,
  resenas,
  textoBusqueda,
  datosIniciales,
}) {
  const crearResena = usarTiendaResenas((estado) => estado.crearResena);
  const actualizarResena = usarTiendaResenas((estado) => estado.actualizarResena);
  const eliminarResena = usarTiendaResenas((estado) => estado.eliminarResena);

  const esAdmin = usuarioActual?.role === 'admin';
  const subastasElegibles = subastas.filter((subasta) => {
    if (subasta.status !== 'finalizada' || !subasta.winnerId) return false;
    return (
      esAdmin ||
      mismoId(subasta.winnerId, usuarioActual?.id) ||
      mismoId(subasta.sellerId, usuarioActual?.id)
    );
  });
  const otrosUsuarios = usuarios.filter((usuario) => !mismoId(usuario.id, usuarioActual?.id));

  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(Boolean(datosIniciales?.abrirFormulario));
  const [idResenaEditando, setIdResenaEditando] = useState(null);

  const resenaEditando = idResenaEditando ? buscarPorId(resenas, idResenaEditando) : null;
  const cantidadCincoEstrellas = resenas.filter((item) => Number(item.rating) === 5).length;

  const resenasFiltradas = resenas.filter((resena) => {
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

  const tarjetasResumen = [
    { destacada: true, titulo: 'Total Reseñas', icono: <Star className="w-3.5 h-3.5" />, valor: resenas.length, subtitulo: 'Operaciones evaluadas RN07' },
    { titulo: 'Mi Reputación', valor: `${usuarioActual?.reputation || '5.0'} ★`, claseValor: 'text-4xl text-[#224F10]', subtitulo: 'Escala promedio 1 a 5' },
    { titulo: 'Máxima Puntuación (5★)', valor: cantidadCincoEstrellas, subtitulo: 'Cumplimiento destacado', claseSubtitulo: 'text-[#224F10] font-semibold' },
    { titulo: 'Cierres Calificables', valor: subastasElegibles.length, subtitulo: 'Subastas elegibles' },
  ];

  return (
    <div className="space-y-6">
      <CabeceraSeccionPanel
        titulo="Reseñas y Reputación"
        subtitulo="Evaluaciones mutuas de 1 a 5 estrellas emitidas en subastas finalizadas (RN07)."
        botonPrincipal={
          <BotonPanel
            icono={<Plus className="w-3.5 h-3.5" />}
            alHacerClic={() => { setIdResenaEditando(null); setFormularioAbierto(true); setAviso(null); }}
          >
            Emitir Calificación
          </BotonPanel>
        }
      />

      <GridEstadisticasPanel tarjetas={tarjetasResumen} />

      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {formularioAbierto && (
        <ContenedorFormularioPanel
          titulo={resenaEditando ? `Editar Calificación #${resenaEditando.id}` : 'Emitir Calificación (RN07)'}
          alCerrar={cerrarFormulario}
        >
          <FormularioResena
            key={resenaEditando ? `${resenaEditando.id}-${resenaEditando.rating}` : `nueva-${datosIniciales?.idSubasta || ''}`}
            resena={resenaEditando}
            subastasElegibles={subastasElegibles}
            otrosUsuarios={otrosUsuarios}
            resenas={resenas}
            idUsuarioActual={usuarioActual?.id}
            esAdmin={esAdmin}
            idSubastaInicial={datosIniciales?.idSubasta || ''}
            idUsuarioCalificadoInicial={datosIniciales?.idUsuarioCalificado || ''}
            alCrearResena={crearResena}
            alActualizarResena={actualizarResena}
            alGuardar={manejarGuardado}
            alCancelar={cerrarFormulario}
          />
        </ContenedorFormularioPanel>
      )}

      {resenasFiltradas.length === 0 ? (
        <EstadoVacioPanel mensaje="No se encontraron reseñas para los criterios actuales." />
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
                puedeEditar={esAdmin || mismoId(usuarioActual?.id, resena.reviewerId)}
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
