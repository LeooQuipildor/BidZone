import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usarTiendaAutenticacion } from '../estado/tiendaAutenticacion';
import { Button, Card, Input } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';

export function VistaRegistro() {
  const navegar = useNavigate();
  const registrarUsuario = usarTiendaAutenticacion((estado) => estado.registrarUsuario);
  const cargando = usarTiendaAutenticacion((estado) => estado.cargando);

  const [datosFormulario, setDatosFormulario] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    ciudad: '',
    contrasena: '',
    confirmarContrasena: '',
  });
  const [mensajeError, setMensajeError] = useState('');

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setDatosFormulario((previo) => ({ ...previo, [name]: value }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError('');

    if (!datosFormulario.nombre.trim() || !datosFormulario.correo.trim() || !datosFormulario.contrasena) {
      setMensajeError('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (datosFormulario.contrasena.length < 6) {
      setMensajeError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (datosFormulario.contrasena !== datosFormulario.confirmarContrasena) {
      setMensajeError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    if (!datosFormulario.telefono.trim()) {
      setMensajeError(
        'El teléfono de contacto es obligatorio para coordinar pago y entrega al ganar o vender en una subasta.'
      );
      return;
    }

    try {
      await registrarUsuario(datosFormulario);
      navegar('/', { replace: true });
    } catch (error) {
      setMensajeError(error.message);
    }
  }

  return (
    <div className="max-w-lg mx-auto my-8">
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
        {mensajeError && (
          <div className="mb-4">
            <Alert type="error" onClose={() => setMensajeError('')}>
              {mensajeError}
            </Alert>
          </div>
        )}

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

        <p className="text-center text-xs text-[#0D0D0D]/70 mt-6">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-[#224F10] font-bold hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </Card>
    </div>
  );
}
