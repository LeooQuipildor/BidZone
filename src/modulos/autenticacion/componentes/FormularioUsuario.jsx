/**
 * ==============================================================================
 * ARCHIVO: src/modulos/autenticacion/componentes/FormularioUsuario.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de formulario reutilizable para la creación y edición de usuarios.
 * Se utiliza tanto en las páginas independientes (`VistaCrearUsuario`, `VistaEditarUsuario`)
 * como dentro de la pestaña de Perfil y Usuarios del Panel de Control.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Detecta automáticamente si está en modo "Creación" o "Edición" según la presencia de la prop `usuario`.
 * 2. Si está en modo "Edición", precarga los campos existentes (`name`, `email`, `phone`, `city`, `role`, `status`).
 * 3. Si está en modo "Creación", exige una contraseña temporal inicial.
 * 4. Si el usuario actual es administrador (`esAdmin`), expone selectores especiales para cambiar
 *    el rol (Usuario o Administrador) y el estado de la cuenta (Activa, Suspendida o Cerrada por sanción RN06).
 * 5. Ejecuta la acción correspondiente (`alCrearUsuario` o `alActualizarUsuario`) y notifica al padre con `alGuardar`.
 *
 * ¿DE DÓNDE PROVIENEN SUS PROPS?
 * - `usuario`: Objeto de usuario si estamos editando (viene de `VistaEditarUsuario` o del panel), o `null` si estamos creando.
 * - `esAdmin`: Booleano que indica si quien opera tiene rol de administrador (viene de `tiendaAutenticacion`).
 * - `alCrearUsuario`: Función asíncrona inyectada desde la tienda para registrar un usuario nuevo.
 * - `alActualizarUsuario`: Función asíncrona inyectada desde la tienda para guardar cambios de un usuario existente.
 * - `alGuardar`: Función callback que avisa al componente padre cuando el proceso finalizó exitosamente.
 * - `alCancelar`: Función callback que se ejecuta al presionar "Cancelar".
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Inicialización Perezosa del Estado (`Lazy State Initialization`):
 *   Al pasar una función a `useState(() => ({ ... }))`, React solo ejecuta esa función en el montaje
 *   inicial, evitando evaluar expresiones complejas u objetos repetidamente en cada render.
 * - Encadenamiento Opcional (`Optional Chaining ?.`) y Operador Nullish/OR (`||`):
 *   `usuario?.name || ''` evita que JavaScript lance un error si `usuario` es `null`, devolviendo
 *   un string vacío por defecto de forma segura.
 * - Conversión a Booleano: `const estaEditando = Boolean(usuario)` convierte la presencia del objeto en `true` o `false`.
 */

import React, { useState } from 'react';
import { Save, UserPlus } from 'lucide-react';
import { Input, Select } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import { AccionesFormulario } from '../../nucleo/diseno/componentesBloques';

/**
 * Opciones para el selector de roles del sistema.
 */
const OPCIONES_ROL = [
  { valor: 'user', etiqueta: 'Usuario Estándar' },
  { valor: 'admin', etiqueta: 'Administrador' },
];

/**
 * Opciones de estado de cuenta según las reglas de moderación (RN06).
 */
const OPCIONES_ESTADO = [
  { valor: 'active', etiqueta: 'Activa (Habilitada)' },
  { valor: 'suspended', etiqueta: 'Suspendida (Infracción temporal)' },
  { valor: 'closed', etiqueta: 'Cerrada (Inhabilitación definitiva)' },
];

export function FormularioUsuario({
  usuario = null,
  esAdmin = false,
  alCrearUsuario,
  alActualizarUsuario,
  alGuardar,
  alCancelar,
}) {
  // `true` si recibimos un usuario para modificar; `false` si es un alta nueva
  const estaEditando = Boolean(usuario);

  /**
   * Estado del formulario con inicialización perezosa (lazy initial state):
   * Lee las propiedades en inglés del modelo (`name`, `email`, `phone`, `city`, `role`, `status`)
   * y las mapea a nombres descriptivos en español dentro del formulario.
   */
  const [datosFormulario, setDatosFormulario] = useState(() => ({
    nombre: usuario?.name || '',
    correo: usuario?.email || '',
    contrasena: '',
    telefono: usuario?.phone || '',
    ciudad: usuario?.city || '',
    rol: usuario?.role || 'user',
    estado: usuario?.status || 'active',
  }));

  // Estado para capturar y mostrar mensajes de error de validación o del backend
  const [mensajeError, setMensajeError] = useState('');

  /**
   * Manejador genérico para todos los inputs y selects del formulario.
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} evento
   */
  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setDatosFormulario((previo) => ({ ...previo, [name]: value }));
  }

  /**
   * Manejador de envío del formulario:
   * Discrimina entre creación y actualización según `estaEditando`.
   */
  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError('');

    // Validación básica en cliente
    if (!datosFormulario.nombre.trim() || !datosFormulario.correo.trim()) {
      setMensajeError('El nombre y el correo electrónico son obligatorios.');
      return;
    }

    try {
      if (estaEditando) {
        // En modo edición: preparamos el payload de cambios
        const cambios = {
          nombre: datosFormulario.nombre.trim(),
          correo: datosFormulario.correo.trim(),
          telefono: datosFormulario.telefono.trim(),
          ciudad: datosFormulario.ciudad.trim(),
        };

        // Solo un administrador tiene permitido alterar el rol y estado de la cuenta
        if (esAdmin) {
          cambios.rol = datosFormulario.rol;
          cambios.estado = datosFormulario.estado;
        }

        const actualizado = await alActualizarUsuario(usuario.id, cambios);
        // Notificamos al componente padre que la operación concluyó exitosamente
        alGuardar?.(actualizado, datosFormulario.nombre.trim());
      } else {
        // En modo creación: la contraseña temporal es obligatoria
        if (!datosFormulario.contrasena) {
          setMensajeError('Debes asignar una contraseña temporal para el nuevo usuario.');
          return;
        }
        const creado = await alCrearUsuario(datosFormulario);
        alGuardar?.(creado, datosFormulario.nombre.trim());
      }
    } catch (error) {
      setMensajeError(error.message);
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      {/* Alerta de error condicional */}
      {mensajeError && (
        <Alert type="error" onClose={() => setMensajeError('')}>
          {mensajeError}
        </Alert>
      )}

      {/* Fila 1: Nombre completo y correo electrónico */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="nombre"
          name="nombre"
          label="Nombre Completo *"
          placeholder="Ej: Sofía Gómez"
          value={datosFormulario.nombre}
          onChange={manejarCambio}
        />
        <Input
          id="correo"
          name="correo"
          type="email"
          label="Correo Electrónico *"
          placeholder="sofia@bidzone.com"
          value={datosFormulario.correo}
          onChange={manejarCambio}
        />
      </div>

      {/* Fila 2: Contraseña (solo al crear), Teléfono y Ciudad */}
      <div className={`grid grid-cols-1 ${estaEditando ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-4`}>
        {!estaEditando && (
          <Input
            id="contrasena"
            name="contrasena"
            type="password"
            label="Contraseña Temporal *"
            placeholder="Mínimo 6 caracteres"
            value={datosFormulario.contrasena}
            onChange={manejarCambio}
          />
        )}
        <Input
          id="telefono"
          name="telefono"
          label="Teléfono / WhatsApp RN05"
          placeholder="+54 9 381 400-0000"
          value={datosFormulario.telefono}
          onChange={manejarCambio}
        />
        <Input
          id="ciudad"
          name="ciudad"
          label="Ciudad"
          placeholder="San Miguel de Tucumán"
          value={datosFormulario.ciudad}
          onChange={manejarCambio}
        />
      </div>

      {/* Fila 3: Configuración de Rol y Estado de Cuenta (visible solo para administradores) */}
      {(esAdmin || !estaEditando) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#224F10]/15">
          <Select
            id="rol"
            name="rol"
            label="Rol de Permisos"
            value={datosFormulario.rol}
            onChange={manejarCambio}
            options={OPCIONES_ROL}
          />
          <Select
            id="estado"
            name="estado"
            label="Estado de Cuenta / Sanción"
            value={datosFormulario.estado}
            onChange={manejarCambio}
            options={OPCIONES_ESTADO}
          />
        </div>
      )}

      {/* Botones de acción reutilizables (Guardar y Cancelar) */}
      <AccionesFormulario
        alCancelar={alCancelar}
        textoGuardar={estaEditando ? 'Guardar Cambios' : 'Guardar Usuario'}
        iconoGuardar={estaEditando ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      />
    </form>
  );
}
