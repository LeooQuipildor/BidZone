import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useStoreAuthentication } from '../../../autenticacion/estado/storeAuthentication';
import { FormularioUsuario } from '../../../autenticacion/componentes/FormularioUsuario';
import { buscarPorId, coincideConBusqueda, mismoId } from '../../utilidades/ayudas';
import {
  AvisoPanel,
  BotonPanel,
  CabeceraSeccionPanel,
  ContenedorFormularioPanel,
  EstadoVacioPanel,
  SelectPanel,
} from './PanelCompartido';
import { TarjetaUsuarioPanel } from './TarjetaUsuarioPanel';

const OPCIONES_FILTRO_ROL = [
  { valor: 'todos', etiqueta: 'Rol: Todos' },
  { valor: 'admin', etiqueta: 'Rol: Administrador' },
  { valor: 'usuario', etiqueta: 'Rol: Socio' },
];

const OPCIONES_FILTRO_ESTADO = [
  { valor: 'todos', etiqueta: 'Estado: Todos' },
  { valor: 'activa', etiqueta: 'Estado: Activa' },
  { valor: 'suspendida', etiqueta: 'Estado: Suspendida' },
  { valor: 'cerrada', etiqueta: 'Estado: Cerrada' },
];

export function TabUsuariosPanel({ usuarioActual, usuarios, textoBusqueda }) {
  // Acciones asíncronas del store de Zustand `storeAuthentication.js`
  const crearUsuario = useStoreAuthentication((estado) => estado.crearUsuario);
  const actualizarUsuario = useStoreAuthentication((estado) => estado.actualizarUsuario);
  const eliminarUsuario = useStoreAuthentication((estado) => estado.eliminarUsuario);

  // Estados locales para filtros, alertas y control de formularios
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [idUsuarioEditando, setIdUsuarioEditando] = useState(null);

  const usuarioEditando = idUsuarioEditando ? buscarPorId(usuarios, idUsuarioEditando) : null;
  const cantidadSancionados = usuarios.filter(
    (item) => item.estado === 'suspendida' || item.estado === 'cerrada'
  ).length;

  // Filtrado compuesto de usuarios: por texto, por rol y por estado
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const coincideTexto = coincideConBusqueda([usuario.nombre, usuario.correo, usuario.ciudad], textoBusqueda);
    const coincideRol = filtroRol === 'todos' || usuario.rol === filtroRol;
    const coincideEstado = filtroEstado === 'todos' || usuario.estado === filtroEstado;
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
    if (!window.confirm(`¿Confirmas eliminar al usuario "${usuario.nombre}"?`)) return;
    try {
      await eliminarUsuario(usuario.id);
      setAviso({ tipo: 'exito', texto: `Usuario "${usuario.nombre}" eliminado.` });
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    }
  }

  return (
    <div className="space-y-5">
      {/* Cabecera con conteo total/sancionados y botón de alta de nuevo usuario */}
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

      {/* Banner de mensajes de éxito o error */}
      <AvisoPanel aviso={aviso} alCerrar={() => setAviso(null)} />

      {/* Modal flotante del formulario de usuario */}
      {formularioAbierto && (
        <ContenedorFormularioPanel
          titulo={usuarioEditando ? `Editar Usuario: ${usuarioEditando.nombre}` : 'Alta de Nuevo Usuario'}
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

      {/* Selectores de filtrado por Rol y por Estado */}
      <div className="rounded-2xl bg-white border border-[#224F10]/10 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-2xs">
        <SelectPanel
          valor={filtroRol}
          alCambiar={setFiltroRol}
          opciones={OPCIONES_FILTRO_ROL}
        />
        <SelectPanel
          valor={filtroEstado}
          alCambiar={setFiltroEstado}
          opciones={OPCIONES_FILTRO_ESTADO}
        />
      </div>

      {/* Grilla de tarjetas de usuario o estado vacío */}
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
