import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, KeyRound, Mail } from 'lucide-react';
import { usarTiendaAutenticacion } from '../estado/tiendaAutenticacion';
import { Button, Input } from '../../nucleo/diseno/ui';
import { Alert } from '../../nucleo/diseno/uiFeedback';

export function FormularioRecuperarContrasena({ correoInicial = '', alVolver, alExito }) {
  const solicitarRecuperacion = usarTiendaAutenticacion((estado) => estado.solicitarRecuperacion);
  const restablecerContrasena = usarTiendaAutenticacion((estado) => estado.restablecerContrasena);

  const [paso, setPaso] = useState(1);
  const [correo, setCorreo] = useState(correoInicial);
  const [codigo, setCodigo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [enlaceCorreoPrueba, setEnlaceCorreoPrueba] = useState('');

  // Paso 1: Enviar el código de 6 dígitos al correo con Nodemailer
  async function manejarEnviarCodigo(evento) {
    evento.preventDefault();
    setError('');
    setInfo('');
    if (!correo.trim()) {
      setError('Ingresa el correo registrado de tu cuenta.');
      return;
    }

    setEnviando(true);
    try {
      const res = await solicitarRecuperacion(correo);
      setInfo(res.mensaje || 'Te enviamos un código de 6 dígitos a tu correo.');
      setEnlaceCorreoPrueba(res.vistaPreviaCorreo || '');
      setPaso(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  // Paso 2: Confirmar código y actualizar la contraseña (UPDATE en MySQL)
  async function manejarActualizarContrasena(evento) {
    evento.preventDefault();
    setError('');
    if (!codigo.trim() || nuevaContrasena.length < 6) {
      setError('Ingresa el código de 6 dígitos y una nueva contraseña de al menos 6 caracteres.');
      return;
    }

    setEnviando(true);
    try {
      const res = await restablecerContrasena({ correo, codigo, nuevaContrasena });
      alExito(res.mensaje || 'Contraseña actualizada correctamente.', correo);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={alVolver}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#224F10] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al inicio de sesión
        </button>
        <span className="text-[11px] font-bold text-[#0D0D0D]/55">Paso {paso} de 2</span>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {info && (
        <Alert type="success">
          <div className="space-y-1.5">
            <p>{info}</p>
            {enlaceCorreoPrueba && (
              <a
                href={enlaceCorreoPrueba}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold underline text-[#224F10]"
              >
                Ver correo enviado (modo pruebas)
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </Alert>
      )}

      {paso === 1 ? (
        <form onSubmit={manejarEnviarCodigo} className="space-y-4">
          <Input
            id="correo-recuperacion"
            label="Correo electrónico registrado"
            type="email"
            placeholder="ejemplo@bidzone.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <Button type="submit" disabled={enviando} className="w-full" size="lg">
            <Mail className="w-4 h-4 mr-1.5" />
            {enviando ? 'Enviando correo...' : 'Enviar código al correo'}
          </Button>
        </form>
      ) : (
        <form onSubmit={manejarActualizarContrasena} className="space-y-4">
          <Input
            id="codigo-recuperacion"
            label="Código de 6 dígitos recibido en tu correo"
            type="text"
            placeholder="Ej: 482910"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <Input
            id="nueva-contrasena"
            label="Nueva contraseña (mínimo 6 caracteres)"
            type="password"
            placeholder="••••••••"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
          />
          <Button type="submit" disabled={enviando} className="w-full" size="lg">
            <KeyRound className="w-4 h-4 mr-1.5" />
            {enviando ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </form>
      )}
    </div>
  );
}
