import React, { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { useStoreAuthentication } from '../estado/storeAuthentication';
import { Button, Card, Input } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';
import { FormularioRecuperarContrasena } from './FormularioRecuperarContrasena';

function obtenerDestinoRedireccion(ubicacion) {
  const rutaAnterior = ubicacion.state?.from?.pathname;
  // Si venía de una ruta válida que no sea un dashboard genérico, lo mandamos ahí
  if (rutaAnterior && rutaAnterior !== '/dashboard' && rutaAnterior !== '/panel') {
    return rutaAnterior;
  }
  return '/';
}

export function VistaIniciarSesion() {
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const campoContrasenaRef = useRef(null);

  const iniciarSesion = useStoreAuthentication((estado) => estado.iniciarSesion);
  const cargando = useStoreAuthentication((estado) => estado.cargando);

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [modoRecuperacion, setModoRecuperacion] = useState(false);

  // Calcula la ruta a la que debe ir el usuario al tener éxito
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
      // Redirección con reemplazo de historial
      navegar(rutaDestino, { replace: true });
    } catch (error) {
      setMensajeError(error.message);
    }
  }

  function autocompletarCorreoDemo(correoDemo) {
    setCorreo(correoDemo);
    setMensajeError('');
    if (campoContrasenaRef.current) campoContrasenaRef.current.focus();
  }

  return (
    <div className="max-w-md mx-auto my-8">
      {/* Encabezado con título e instrucciones */}
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
        {modoRecuperacion ? (
          <FormularioRecuperarContrasena
            correoInicial={correo}
            alVolver={() => setModoRecuperacion(false)}
            alExito={(texto, correoRecuperado) => {
              setCorreo(correoRecuperado);
              setContrasena('');
              setMensajeError('');
              setMensajeExito(texto);
              setModoRecuperacion(false);
            }}
          />
        ) : (
          <>
            {/* Alerta de éxito tras recuperar contraseña */}
            {mensajeExito && (
              <div className="mb-4">
                <Alert type="success" onClose={() => setMensajeExito('')}>
                  {mensajeExito}
                </Alert>
              </div>
            )}

            {/* Alerta de error condicional */}
            {mensajeError && (
              <div className="mb-4">
                <Alert type="error" onClose={() => setMensajeError('')}>
                  {mensajeError}
                </Alert>
              </div>
            )}

            {/* Formulario de credenciales */}
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
                ref={campoContrasenaRef}
                id="contrasena"
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={contrasena}
                onChange={(evento) => setContrasena(evento.target.value)}
              />

              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMensajeError('');
                    setMensajeExito('');
                    setModoRecuperacion(true);
                  }}
                  className="text-xs font-semibold text-[#224F10] hover:underline cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                disabled={cargando}
                className="w-full mt-2"
                size="lg"
              >
                {cargando ? 'Verificando...' : 'Ingresar a BidZone'}
              </Button>
            </form>
          </>
        )}

        {/* Botones rápidos para autocompletar correos de prueba en entornos de desarrollo */}
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

        {/* Enlace hacia la vista de registro */}
        <p className="text-center text-xs text-[#0D0D0D]/70 mt-6">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="text-[#224F10] font-bold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </Card>
    </div>
  );
}
