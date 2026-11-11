import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { usarTiendaAutenticacion } from '../estado/tiendaAutenticacion';
import { Button, Card, Input } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';

// Si la persona venía desde una ruta protegida, la devolvemos ahí tras ingresar
function obtenerDestinoRedireccion(ubicacion) {
  const rutaAnterior = ubicacion.state?.from?.pathname;
  if (rutaAnterior && rutaAnterior !== '/dashboard') {
    return rutaAnterior;
  }
  return '/';
}

export function VistaIniciarSesion() {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const iniciarSesion = usarTiendaAutenticacion((estado) => estado.iniciarSesion);
  const cargando = usarTiendaAutenticacion((estado) => estado.cargando);

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  const rutaDestino = obtenerDestinoRedireccion(ubicacion);

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError('');

    if (!correo.trim() || !contrasena.trim()) {
      setMensajeError('Por favor completa correo electrónico y contraseña.');
      return;
    }

    try {
      await iniciarSesion(correo, contrasena);
      navegar(rutaDestino, { replace: true });
    } catch (error) {
      setMensajeError(error.message);
    }
  }

  function autocompletarCorreoDemo(correoDemo) {
    setCorreo(correoDemo);
    setMensajeError('');
    const campoClave = document.getElementById('contrasena');
    if (campoClave) campoClave.focus();
  }

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="text-center mb-8 space-y-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#224F10] font-bold">
          ACCESO SEGURO JWT
        </span>
        <h1 className="font-serif-display text-5xl text-[#0D0D0D]">Iniciar sesión</h1>
        <p className="text-xs text-[#0D0D0D]/70">
          Ingresa con tus credenciales para participar en subastas en tiempo real.
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
            id="correo"
            label="Correo electrónico"
            type="email"
            placeholder="ejemplo@bidzone.com"
            value={correo}
            onChange={(evento) => setCorreo(evento.target.value)}
          />
          <Input
            id="contrasena"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={contrasena}
            onChange={(evento) => setContrasena(evento.target.value)}
          />

          <Button
            type="submit"
            disabled={cargando}
            className="w-full mt-2"
            size="lg"
          >
            {cargando ? 'Verificando...' : 'Ingresar a BidZone'}
          </Button>
        </form>

        {/* Botones rápidos para autocompletar correos de prueba */}
        <div className="mt-6 pt-5 border-t border-[#224F10]/15">
          <p className="text-[11px] font-semibold text-[#0D0D0D]/60 mb-3 text-center">
            Autocompletar correo registrado (ingresa la contraseña de tu entorno)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => autocompletarCorreoDemo('admin@bidzone.com')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-full bg-[#0D0D0D] text-[#EAFFD0] hover:bg-[#224F10] text-xs font-semibold transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#B0E454]" />
              admin@bidzone.com
            </button>
            <button
              type="button"
              onClick={() => autocompletarCorreoDemo('mario@bidzone.com')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-full bg-[#B0E454] text-[#0D0D0D] hover:bg-[#224F10] hover:text-[#EAFFD0] text-xs font-semibold transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              mario@bidzone.com
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#0D0D0D]/70 mt-6">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" className="text-[#224F10] font-bold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </Card>
    </div>
  );
}
