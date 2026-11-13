/**
 * ==============================================================================
 * ARCHIVO: src/modulos/autenticacion/componentes/VistaIniciarSesion.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es la vista de inicio de sesión (Login) de la plataforma BidZone.
 * Permite a los usuarios autenticarse enviando su correo y contraseña al backend para
 * obtener un token JWT que se guardará en `localStorage`.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Proporciona un formulario controlado con campos para correo electrónico y contraseña.
 * 2. Ofrece botones de autocompletado rápido para facilitar pruebas con cuentas predefinidas (Admin y Mario).
 * 3. Valida en el cliente que ningún campo esté vacío antes de emitir la solicitud HTTP.
 * 4. Llama a la acción `iniciarSesion` de la tienda Zustand `usarTiendaAutenticacion`.
 * 5. Si la autenticación es exitosa, redirige automáticamente al usuario hacia la página a la que
 *    intentaba acceder antes de ser interceptado (gracias a `RutaProtegida.jsx`), o al inicio `/`.
 * 6. Si falla la autenticación, captura la excepción y muestra un mensaje de error claro en una alerta roja.
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - `useRef` para enfocar elementos del DOM:
 *   Con `useRef(null)` creamos una referencia mutable. Al hacer clic en un botón demo,
 *   colocamos el correo y ejecutamos `campoContrasenaRef.current.focus()` para que el usuario
 *   pueda tipear su contraseña inmediatamente sin usar el mouse.
 * - `useLocation` y Redirección Inteligente:
 *   Cuando `RutaProtegida` bloquea a un usuario sin sesión, le pasa el estado `{ from: location }`.
 *   Aquí leemos `ubicacion.state?.from?.pathname` para recordar adónde quería ir y devolverlo allí.
 * - Parámetro `{ replace: true }` en `navigate`:
 *   Reemplaza la entrada actual en el historial de navegación en lugar de apilar una nueva,
 *   evitando que si el usuario presiona el botón "Atrás" en su navegador vuelva a caer en el login.
 */

import React, { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { usarTiendaAutenticacion } from '../estado/tiendaAutenticacion';
import { Button, Card, Input } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';

/**
 * Función auxiliar para determinar a qué página redirigir al usuario tras el login.
 *
 * @param {Object} ubicacion - Objeto de ruta devuelto por `useLocation()`.
 * @returns {string} Ruta de destino final (ej: "/subastas/nueva" o "/").
 */
function obtenerDestinoRedireccion(ubicacion) {
  const rutaAnterior = ubicacion.state?.from?.pathname;
  // Si venía de una ruta válida que no sea un dashboard genérico, lo mandamos ahí
  if (rutaAnterior && rutaAnterior !== '/dashboard' && rutaAnterior !== '/panel') {
    return rutaAnterior;
  }
  return '/';
}

export function VistaIniciarSesion() {
  /**
   * Hooks de React Router:
   * `useNavigate`: Para redirigir programáticamente tras completar el login.
   * `useLocation`: Para inspeccionar los metadatos de la ruta actual y su historial previo.
   */
  const navegar = useNavigate();
  const ubicacion = useLocation();

  /**
   * Hook `useRef`:
   * Mantiene una referencia directa al nodo input de la contraseña para cambiar el foco.
   */
  const campoContrasenaRef = useRef(null);

  /**
   * Suscripción a la tienda global de autenticación:
   */
  const iniciarSesion = usarTiendaAutenticacion((estado) => estado.iniciarSesion);
  const cargando = usarTiendaAutenticacion((estado) => estado.cargando);

  /**
   * Estados locales con `useState`:
   * Controlan los valores tipeados en los inputs y los mensajes de error en pantalla.
   */
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  // Calcula la ruta a la que debe ir el usuario al tener éxito
  const rutaDestino = obtenerDestinoRedireccion(ubicacion);

  /**
   * Manejador de envío del formulario:
   * 1. Detiene la recarga del navegador con `evento.preventDefault()`.
   * 2. Valida campos requeridos.
   * 3. Llama a la API mediante la tienda y espera la resolución de la Promesa.
   */
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

  /**
   * Autocompleta un correo de prueba y enfoca el campo de contraseña.
   *
   * @param {string} correoDemo - Correo a prellenar.
   */
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

          <Button
            type="submit"
            disabled={cargando}
            className="w-full mt-2"
            size="lg"
          >
            {cargando ? 'Verificando...' : 'Ingresar a BidZone'}
          </Button>
        </form>

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
