import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { usarTiendaAutenticacion } from '../../../autenticacion/estado/tiendaAutenticacion';
import { FormularioUsuario } from '../../../autenticacion/componentes/FormularioUsuario';
import { buscarPorId, coincideConBusqueda, mismoId } from '../../utilidades/ayudas';
import {
  AvisoPanel,
  BotonPanel,
  CabeceraSeccionPanel,
  ContenedorFormularioPanel,
  EstadoVacioPanel,
} from './PanelCompartido';
import { TarjetaUsuarioPanel } from './TarjetaUsuarioPanel';

// Pestaña exclusiva de Administrador para gestionar cuentas, roles y sanciones RN06
export function TabUsuariosPanel({ usuarioActual, usuarios, textoBusqueda }) {
  const crearUsuario = usarTiendaAutenticacion((estado) => estado.crearUsuario);
  const actualizarUsuario = usarTiendaAutenticacion((estado) => estado.actualizarUsuario);
  const eliminarUsuario = usarTiendaAutenticacion((estado) => estado.eliminarUsuario);

  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [idUsuarioEditando, setIdUsuarioEditando] = useState(null);

  const usuarioEditando = idUsuarioEditando ? buscarPorId(usuarios, idUsuarioEditando) : null;
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
        ? `Usuario "${nombreGuardado}" actualizado.`
        : `Usuario "${nombreGuardado}" creado correctamente.`,
    });
    cerrarFormulario();
  }

  async function manejarEliminacion(usuario) {
    if (mismoId(usuario.id, usuarioActual?.id)) {
      setAviso({ tipo: 'error', texto: 'No puedes eliminar tu propia sesión activa.' });
      return;
    }
    if (!window.confirm(`¿Confirmas eliminar al usuario "${usuario.name}"?`)) return;
    try {
      await eliminarUsuario(usuario.id);
      setAviso({ tipo: 'exito', texto: `Usuario "${usuario.name}" eliminado.` });
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    }
  }

  return (
    <div className="space-y-5">
      <CabeceraSeccionPanel
        titulo="Gestión de Usuarios"
        subtitulo={`Administración de cuentas (${usuarios.length} registradas · ${cantidadSancionados} sancionadas).`}
        botonPrincipal={
          <BotonPanel
            icono={<UserPlus className="w-3.5 h-3.5" />}
            alHacerClic={() => {
              setIdUsuarioEditando(null);
              setFormularioAbierto(true);
              setAviso(null);
            }}
          >
            Nuevo Usuario
          </BotonPanel>
        }
      />

      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {formularioAbierto && (
        <ContenedorFormularioPanel
          titulo={usuarioEditando ? `Editar Usuario: ${usuarioEditando.name}` : 'Alta de Nuevo Usuario'}
          alCerrar={cerrarFormulario}
        >
          <FormularioUsuario
            key={usuarioEditando ? usuarioEditando.id : 'nuevo-usuario'}
            usuario={usuarioEditando}
            esAdmin
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
          <option value="todos">Rol: Todos</option>
          <option value="admin">Rol: Administrador</option>
          <option value="user">Rol: Socio</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(evento) => setFiltroEstado(evento.target.value)}
          className="w-full rounded-xl bg-[#F7FBF3] border border-[#224F10]/12 px-3 py-1.5 text-xs font-medium text-[#0D0D0D] focus:outline-none"
        >
          <option value="todos">Estado: Todos</option>
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
              puedeEditar
              puedeEliminar={!mismoId(usuarioActual?.id, usuario.id)}
              alEditar={() => {
                setIdUsuarioEditando(usuario.id);
                setFormularioAbierto(true);
                setAviso(null);
              }}
              alEliminar={() => manejarEliminacion(usuario)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
