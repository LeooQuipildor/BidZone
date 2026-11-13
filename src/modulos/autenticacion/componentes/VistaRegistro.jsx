/**
 * ==============================================================================
 * ARCHIVO: src/modulos/autenticacion/componentes/VistaRegistro.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de vista que permite a cualquier visitante registrarse como nuevo usuario
 * en la plataforma BidZone.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Mantiene el estado de todos los campos del formulario en un único objeto (`datosFormulario`).
 * 2. Emplea un manejador genérico `manejarCambio` aprovechando el atributo `name` de cada `<Input>`.
 * 3. Ejecuta validaciones estrictas en el cliente antes de enviar la información:
 *    - Campos obligatorios no vacíos.
 *    - Contraseña de al menos 6 caracteres.
 *    - Coincidencia exacta entre contraseña y su confirmación.
 *    - Presencia obligatoria del número de teléfono/WhatsApp (requisito indispensable para
 *      la liberación de datos de contacto de la Regla RN05).
 * 4. Llama a la acción `registrarUsuario` de la tienda Zustand.
 * 5. Si el registro tiene éxito, navega al inicio `/` con la sesión ya iniciada.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Estado como Objeto vs Múltiples useState:
 *   En lugar de crear 6 estados individuales (`const [nombre, setNombre] = useState('')`, etc.),
 *   agrupamos todo en un único objeto `datosFormulario`. Esto mantiene el componente limpio.
 * - Manejador genérico de inputs (`computed property names`):
 *   `setDatosFormulario(previo => ({ ...previo, [name]: value }))`
 *   Al poner `[name]` entre corchetes, JavaScript usa el valor dinámico del atributo `name` del input
 *   como la clave de la propiedad a modificar en el objeto.
 * - Operador Spread `...previo`:
 *   Copia todas las propiedades existentes del estado anterior para no perderlas al actualizar solo una.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usarTiendaAutenticacion } from '../estado/tiendaAutenticacion';
import { Button, Card, Input } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';

export function VistaRegistro() {
  /**
   * Hook `useNavigate`:
   * Permite redirigir al usuario al home cuando el registro se completa con éxito.
   */
  const navegar = useNavigate();

  /**
   * Acciones y estados de la tienda Zustand:
   */
  const registrarUsuario = usarTiendaAutenticacion((estado) => estado.registrarUsuario);
  const cargando = usarTiendaAutenticacion((estado) => estado.cargando);

  /**
   * Estado unificado del formulario:
   * Almacena todos los valores de los campos del formulario de registro.
   */
  const [datosFormulario, setDatosFormulario] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    ciudad: '',
    contrasena: '',
    confirmarContrasena: '',
  });

  // Estado para mensajes de alerta y errores de validación
  const [mensajeError, setMensajeError] = useState('');

  /**
   * Manejador genérico de cambios en inputs:
   * Extrae `name` y `value` del evento y actualiza la clave correspondiente en el estado.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} evento
   */
  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setDatosFormulario((previo) => ({ ...previo, [name]: value }));
  }

  /**
   * Manejador de envío del formulario de registro:
   * Valida exhaustivamente cada regla de negocio antes de llamar al backend.
   */
  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError('');

    // Validación 1: Campos requeridos no vacíos
    if (!datosFormulario.nombre.trim() || !datosFormulario.correo.trim() || !datosFormulario.contrasena) {
      setMensajeError('Por favor completa todos los campos obligatorios.');
      return;
    }

    // Validación 2: Longitud mínima de la contraseña
    if (datosFormulario.contrasena.length < 6) {
      setMensajeError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Validación 3: Confirmación coincidente
    if (datosFormulario.contrasena !== datosFormulario.confirmarContrasena) {
      setMensajeError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    // Validación 4: Teléfono requerido (esencial para RN05 de BidZone)
    if (!datosFormulario.telefono.trim()) {
      setMensajeError(
        'El teléfono de contacto es obligatorio para coordinar pago y entrega al ganar o vender en una subasta.'
      );
      return;
    }

    try {
      // Envío de la solicitud a través del store
      await registrarUsuario(datosFormulario);
      navegar('/', { replace: true });
    } catch (error) {
      setMensajeError(error.message);
    }
  }

  return (
    <div className="max-w-lg mx-auto my-8">
      {/* Cabecera visual del registro */}
      <div className="text-center mb-8 space-y-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#224F10] font-bold">
          NUEVO PARTICIPANTE
        </span>
        <h1 className="font-serif-display text-5xl text-[#0D0D0D]">Crear cuenta</h1>
        <p className="text-xs text-[#0D0D0D]/70 max-w-sm mx-auto">
          Tus datos de contacto permanecerán privados y solo se liberarán cuando ganes o cierres una subasta.
        </p>
      </div>

      <Card className="p-6 sm:p-8 rounded-3xl">
        {/* Alerta de error si falla la validación o la API */}
        {mensajeError && (
          <div className="mb-4">
            <Alert type="error" onClose={() => setMensajeError('')}>
              {mensajeError}
            </Alert>
          </div>
        )}

        {/* Formulario con campos controlados */}
        <form onSubmit={manejarEnvio} className="space-y-4">
          <Input
            id="nombre"
            name="nombre"
            label="Nombre y apellido *"
            placeholder="Ej: Juan Pérez"
            value={datosFormulario.nombre}
            onChange={manejarCambio}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="correo"
              name="correo"
              type="email"
              label="Correo electrónico *"
              placeholder="juan@correo.com"
              value={datosFormulario.correo}
              onChange={manejarCambio}
            />
            <Input
              id="telefono"
              name="telefono"
              label="Teléfono / WhatsApp *"
              placeholder="+54 9 381 555-0000"
              value={datosFormulario.telefono}
              onChange={manejarCambio}
            />
          </div>

          <Input
            id="ciudad"
            name="ciudad"
            label="Ciudad / Provincia *"
            placeholder="San Miguel de Tucumán"
            value={datosFormulario.ciudad}
            onChange={manejarCambio}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="contrasena"
              name="contrasena"
              type="password"
              label="Contraseña *"
              placeholder="Mínimo 6 caracteres"
              value={datosFormulario.contrasena}
              onChange={manejarCambio}
            />
            <Input
              id="confirmarContrasena"
              name="confirmarContrasena"
              type="password"
              label="Confirmar contraseña *"
              placeholder="Repite tu contraseña"
              value={datosFormulario.confirmarContrasena}
              onChange={manejarCambio}
            />
          </div>

          <Button
            type="submit"
            disabled={cargando}
            className="w-full mt-2"
            size="lg"
          >
            {cargando ? 'Registrando...' : 'Crear mi cuenta'}
          </Button>
        </form>

        {/* Enlace para volver a Iniciar Sesión */}
        <p className="text-center text-xs text-[#0D0D0D]/70 mt-6">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/iniciar-sesion" className="text-[#224F10] font-bold hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </Card>
    </div>
  );
}
