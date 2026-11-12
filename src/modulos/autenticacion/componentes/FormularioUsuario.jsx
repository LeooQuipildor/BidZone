import React, { useState } from 'react';
import { Save, UserPlus } from 'lucide-react';
import { Input, Select } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import { AccionesFormulario } from '../../nucleo/diseno/componentesBloques';

const OPCIONES_ROL = [
  { valor: 'user', etiqueta: 'Usuario Estándar' },
  { valor: 'admin', etiqueta: 'Administrador' },
];

const OPCIONES_ESTADO = [
  { valor: 'active', etiqueta: 'Activa (Habilitada)' },
  { valor: 'suspended', etiqueta: 'Suspendida (Infracción temporal)' },
  { valor: 'closed', etiqueta: 'Cerrada (Inhabilitación definitiva)' },
];

// Formulario único reutilizado para crear o editar un usuario (Panel y rutas /new y /edit)
export function FormularioUsuario({
  usuario = null,
  esAdmin = false,
  alCrearUsuario,
  alActualizarUsuario,
  alGuardar,
  alCancelar,
}) {
  const estaEditando = Boolean(usuario);

  const [datosFormulario, setDatosFormulario] = useState(() => ({
    nombre: usuario?.name || '',
    correo: usuario?.email || '',
    contrasena: '',
    telefono: usuario?.phone || '',
    ciudad: usuario?.city || '',
    rol: usuario?.role || 'user',
    estado: usuario?.status || 'active',
  }));
  const [mensajeError, setMensajeError] = useState('');

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setDatosFormulario((previo) => ({ ...previo, [name]: value }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError('');

    if (!datosFormulario.nombre.trim() || !datosFormulario.correo.trim()) {
      setMensajeError('El nombre y el correo electrónico son obligatorios.');
      return;
    }

    try {
      if (estaEditando) {
        const cambios = {
          nombre: datosFormulario.nombre.trim(),
          correo: datosFormulario.correo.trim(),
          telefono: datosFormulario.telefono.trim(),
          ciudad: datosFormulario.ciudad.trim(),
        };
        if (esAdmin) {
          cambios.rol = datosFormulario.rol;
          cambios.estado = datosFormulario.estado;
        }
        const actualizado = await alActualizarUsuario(usuario.id, cambios);
        alGuardar?.(actualizado, datosFormulario.nombre.trim());
      } else {
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
      {mensajeError && (
        <Alert type="error" onClose={() => setMensajeError('')}>
          {mensajeError}
        </Alert>
      )}

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

      <AccionesFormulario
        alCancelar={alCancelar}
        textoGuardar={estaEditando ? 'Guardar Cambios' : 'Guardar Usuario'}
        iconoGuardar={estaEditando ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      />
    </form>
  );
}
