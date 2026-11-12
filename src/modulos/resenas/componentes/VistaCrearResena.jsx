import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usarTiendaResenas } from '../estado/tiendaResenas';
import { usarTiendaSubastas } from '../../subastas/estado/tiendaSubastas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { mismoId } from '../../nucleo/utilidades/ayudas';
import { obtenerSubastasPendientesResena } from '../../nucleo/componentes/panel/ayudasPanel';
import { FormularioResena } from './FormularioResena';
import { PaginaFormulario } from '../../nucleo/diseno/componentesBloques';

export function VistaCrearResena() {
  const navegar = useNavigate();
  const [parametrosUrl] = useSearchParams();
  const idSubastaInicial = parametrosUrl.get('auctionId') || '';

  const resenas = usarTiendaResenas((estado) => estado.resenas);
  const obtenerResenas = usarTiendaResenas((estado) => estado.obtenerResenas);
  const crearResena = usarTiendaResenas((estado) => estado.crearResena);
  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const cargandoSubastas = usarTiendaSubastas((estado) => estado.cargando);
  const obtenerSubastas = usarTiendaSubastas((estado) => estado.obtenerSubastas);
  const usuarios = usarTiendaAutenticacion((estado) => estado.usuarios);
  const obtenerUsuarios = usarTiendaAutenticacion((estado) => estado.obtenerUsuarios);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);

  useEffect(() => {
    obtenerSubastas();
    obtenerUsuarios();
    obtenerResenas();
  }, [obtenerSubastas, obtenerUsuarios, obtenerResenas]);

  const subastasElegibles = obtenerSubastasPendientesResena(subastas, resenas, usuarioActual?.id);
  const otrosUsuarios = usuarios.filter((usuario) => !mismoId(usuario.id, usuarioActual?.id));

  return (
    <PaginaFormulario
      titulo="Emitir Calificación (RN07)"
      subtitulo="Califica de 1 a 5 estrellas a tu contraparte luego de finalizar la subasta y coordinar la entrega."
      alVolver={() => navegar('/reviews')}
      cargando={cargandoSubastas && subastas.length === 0}
      textoCarga="Cargando operaciones calificables..."
    >
      <FormularioResena
        subastasElegibles={subastasElegibles}
        otrosUsuarios={otrosUsuarios}
        resenas={resenas}
        idUsuarioActual={usuarioActual?.id}
        idSubastaInicial={idSubastaInicial}
        alCrearResena={crearResena}
        alGuardar={() => navegar('/reviews')}
        alCancelar={() => navegar('/reviews')}
      />
    </PaginaFormulario>
  );
}
