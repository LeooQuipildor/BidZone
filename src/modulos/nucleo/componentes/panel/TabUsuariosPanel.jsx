import React, { useState } from 'react';
import { UserPlus, Users as IconoUsuarios } from 'lucide-react';
import { usarTiendaAutenticacion } from '../../../autenticacion/estado/tiendaAutenticacion';
import { FormularioUsuario } from '../../../autenticacion/componentes/FormularioUsuario';
import { buscarPorId, coincideConBusqueda, mismoId } from '../../utilidades/ayudas';
import {
  AvisoPanel,
  BotonPanel,
  CabeceraSeccionPanel,
  ContenedorFormularioPanel,
  EstadoVacioPanel,
  GridEstadisticasPanel,
} from './PanelCompartido';
import { TarjetaUsuarioPanel } from './TarjetaUsuarioPanel';

export function TabUsuariosPanel({ usuarioActual, usuarios, textoBusqueda }) {
  const crearUsuario = usarTiendaAutenticacion((estado) => estado.crearUsuario);
  const actualizarUsuario = usarTiendaAutenticacion((estado) => estado.actualizarUsuario);
  const eliminarUsuario = usarTiendaAutenticacion((estado) => estado.eliminarUsuario);

  const esAdmin = usuarioActual?.role === 'admin';
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [idUsuarioEditando, setIdUsuarioEditando] = useState(null);

  const usuarioEditando = idUsuarioEditando ? buscarPorId(usuarios, idUsuarioEditando) : null;
  const cantidadActivos = usuarios.filter((item) => item.status === 'active').length;
  const cantidadAdmins = usuarios.filter((item) => item.role === 'admin').length;
  const cantidadSancionados = usuarios.filter(
    (item) => item.status === 'suspended' || item.status === 'closed'
  ).length;

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const coincideTexto = coincideConBusqueda([usuario.name, usuario.email, usuario.city], textoBusqueda);
    const coincideRol = filtroRol === 'todos' || usuario.role === filtroRol;
    const coincideEstado = filtroEstado === 'todos' || usuario.status === filtroEstado;
    return coincideTexto && coincideRol && coincideEstado;
  });

  function cerrarFormulario() {
    setFormularioAbierto(false);
    setIdUsuarioEditando(null);
  }

  function manejarGuardado(_usuarioGuardado, nombreGuardado) {
    setAviso({
      tipo: 'exito',
      texto: usuarioEditando
        ? `Usuario "${nombreGuardado}" actualizado correctamente.`
        : `Usuario "${nombreGuardado}" registrado en la plataforma.`,
    });
    cerrarFormulario();
  }

  async function manejarEliminacion(usuario) {
    if (mismoId(usuario.id, usuarioActual?.id)) {
      setAviso({ tipo: 'error', texto: 'No puedes eliminar tu propia sesión activa.' });
      return;
    }
    const etiquetaUsuario = usuario.email ? `"${usuario.name}" (${usuario.email})` : `"${usuario.name}"`;
    if (!window.confirm(`¿Estás seguro de eliminar al usuario ${etiquetaUsuario}?`)) return;
    try {
      await eliminarUsuario(usuario.id);
      setAviso({ tipo: 'exito', texto: `Usuario "${usuario.name}" eliminado correctamente.` });
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    }
  }

  const tarjetasResumen = [
    { destacada: true, titulo: 'Total Comunidad', icono: <IconoUsuarios className="w-3.5 h-3.5" />, valor: usuarios.length, subtitulo: 'Socios verificados' },
    { titulo: 'Cuentas Activas', valor: cantidadActivos, subtitulo: 'Habilitadas para pujar', claseSubtitulo: 'text-[#224F10] font-semibold' },
    { titulo: 'Moderadores', valor: cantidadAdmins, subtitulo: 'Rol Administrador' },
    { titulo: 'Sancionados', valor: cantidadSancionados, subtitulo: 'Suspensión o cierre RN06', claseSubtitulo: 'text-red-700 font-semibold' },
  ];

  return (
    <div className="space-y-6">
      <CabeceraSeccionPanel
        titulo="Directorio de Usuarios"
        subtitulo="Gestión de socios, control de roles (Admin/User), reputación y estado disciplinario."
        botonPrincipal={
          esAdmin && (
            <BotonPanel
              icono={<UserPlus className="w-3.5 h-3.5" />}
              alHacerClic={() => { setIdUsuarioEditando(null); setFormularioAbierto(true); setAviso(null); }}
            >
              Nuevo Usuario
            </BotonPanel>
          )
        }
      />

      <GridEstadisticasPanel tarjetas={tarjetasResumen} />

      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {formularioAbierto && (
        <ContenedorFormularioPanel
          titulo={usuarioEditando ? `Editar Usuario: ${usuarioEditando.name}` : 'Alta de Nuevo Usuario'}
          alCerrar={cerrarFormulario}
        >
          <FormularioUsuario
            key={usuarioEditando ? usuarioEditando.id : 'nuevo-usuario'}
            usuario={usuarioEditando}
            esAdmin={esAdmin}
            alCrearUsuario={crearUsuario}
            alActualizarUsuario={actualizarUsuario}
            alGuardar={manejarGuardado}
            alCancelar={cerrarFormulario}
          />
        </ContenedorFormularioPanel>
      )}

      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-2xs">
        <select
          value={filtroRol}
          onChange={(evento) => setFiltroRol(evento.target.value)}
          className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none"
        >
          <option value="todos">Rol: Todos los roles</option>
          <option value="admin">Rol: Administrador</option>
          <option value="user">Rol: Usuario estándar</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(evento) => setFiltroEstado(evento.target.value)}
          className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none"
        >
          <option value="todos">Estado: Todos los estados</option>
          <option value="active">Estado: Activa</option>
          <option value="suspended">Estado: Suspendida</option>
          <option value="closed">Estado: Cerrada</option>
        </select>
      </div>

      {usuariosFiltrados.length === 0 ? (
        <EstadoVacioPanel mensaje="No hay usuarios que coincidan con el filtro aplicado." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {usuariosFiltrados.map((usuario, indice) => (
            <TarjetaUsuarioPanel
              key={usuario.id}
              usuario={usuario}
              indiceColor={indice}
              puedeEditar={esAdmin || mismoId(usuarioActual?.id, usuario.id)}
              puedeEliminar={esAdmin && !mismoId(usuarioActual?.id, usuario.id)}
              alEditar={() => { setIdUsuarioEditando(usuario.id); setFormularioAbierto(true); setAviso(null); }}
              alEliminar={() => manejarEliminacion(usuario)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
