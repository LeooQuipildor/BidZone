/**
 * ==============================================================================
 * ARCHIVO: src/modulos/nucleo/componentes/panel/TabUsuariosPanel.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE COMPONENTE?
 * Es la pestaña exclusiva de gestión de usuarios del Panel de Control, disponible
 * únicamente para usuarios con rol de Administrador (`usuarioActual.role === 'admin'`).
 *
 * ¿POR QUÉ EXISTE Y CUÁL ES SU PROPÓSITO?
 * Proporciona a los administradores de BidZone una interfaz integral para auditar,
 * dar de alta, editar y aplicar sanciones disciplinarias sobre las cuentas del sistema,
 * en cumplimiento de las Reglas RN05 (privacidad y datos de contacto) y RN06 (sanciones).
 *
 * Funcionalidades destacadas:
 * 1. Métricas de cuentas: Muestra el total de usuarios registrados y cuántos de ellos
 *    se encuentran sancionados ('suspended' o 'closed').
 * 2. Alta de cuentas: Botón "Nuevo Usuario" que despliega `FormularioUsuario` con
 *    privilegios de administrador (permite asignar rol y estado inicial).
 * 3. Filtrado avanzado:
 *    - Filtro por Rol: Todos, Administrador, Socio.
 *    - Filtro por Estado: Todos, Activa, Suspendida, Cerrada.
 *    - Búsqueda textual: Coincidencias en nombre, correo o ciudad.
 * 4. Edición y Sanción: Permite modificar roles, levantar suspensiones o actualizar
 *    números de teléfono.
 * 5. Baja de cuenta: Permite eliminar usuarios con validación de seguridad estricta:
 *    un administrador nunca puede eliminar su propia cuenta activa en la misma sesión.
 *
 * ¿DE DÓNDE PROVIENEN LAS PROPS?
 * - `usuarioActual`: Objeto de la sesión activa de `tiendaAutenticacion.js`.
 * - `usuarios`: Array de todas las cuentas registradas provenientes de `tiendaAutenticacion.js`.
 * - `textoBusqueda`: Filtro textual ingresado en el Header superior.
 * ==============================================================================
 */

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
  SelectPanel,
} from './PanelCompartido';
import { TarjetaUsuarioPanel } from './TarjetaUsuarioPanel';

/** Opciones del selector de filtrado por Rol */
const OPCIONES_FILTRO_ROL = [
  { valor: 'todos', etiqueta: 'Rol: Todos' },
  { valor: 'admin', etiqueta: 'Rol: Administrador' },
  { valor: 'user', etiqueta: 'Rol: Socio' },
];

/** Opciones del selector de filtrado por Estado de cuenta disciplinario */
const OPCIONES_FILTRO_ESTADO = [
  { valor: 'todos', etiqueta: 'Estado: Todos' },
  { valor: 'active', etiqueta: 'Estado: Activa' },
  { valor: 'suspended', etiqueta: 'Estado: Suspendida' },
  { valor: 'closed', etiqueta: 'Estado: Cerrada' },
];

/**
 * Componente principal: TabUsuariosPanel
 * ----------------------------------------------------------------------------
 * Renderiza el directorio administrativo de cuentas, formularios modales y filtros.
 */
export function TabUsuariosPanel({ usuarioActual, usuarios, textoBusqueda }) {
  // Acciones asíncronas del store de Zustand `tiendaAutenticacion.js`
  const crearUsuario = usarTiendaAutenticacion((estado) => estado.crearUsuario);
  const actualizarUsuario = usarTiendaAutenticacion((estado) => estado.actualizarUsuario);
  const eliminarUsuario = usarTiendaAutenticacion((estado) => estado.eliminarUsuario);

  // Estados locales para filtros, alertas y control de formularios
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [aviso, setAviso] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [idUsuarioEditando, setIdUsuarioEditando] = useState(null);

  const usuarioEditando = idUsuarioEditando ? buscarPorId(usuarios, idUsuarioEditando) : null;
  const cantidadSancionados = usuarios.filter(
    (item) => item.status === 'suspended' || item.status === 'closed'
  ).length;

  // Filtrado compuesto de usuarios: por texto, por rol y por estado
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const coincideTexto = coincideConBusqueda([usuario.name, usuario.email, usuario.city], textoBusqueda);
    const coincideRol = filtroRol === 'todos' || usuario.role === filtroRol;
    const coincideEstado = filtroEstado === 'todos' || usuario.status === filtroEstado;
    return coincideTexto && coincideRol && coincideEstado;
  });

  /** Cierra el formulario y limpia la selección */
  function cerrarFormulario() {
    setFormularioAbierto(false);
    setIdUsuarioEditando(null);
  }

  /** Callback al guardar un usuario creado o editado */
  function manejarGuardado(_usuarioGuardado, nombreGuardado) {
    setAviso({
      tipo: 'exito',
      texto: usuarioEditando
        ? `Usuario "${nombreGuardado}" actualizado.`
        : `Usuario "${nombreGuardado}" creado correctamente.`,
    });
    cerrarFormulario();
  }

  /** Maneja la eliminación de un usuario con validación de seguridad contra auto-eliminación */
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
