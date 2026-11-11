import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../states/authStore';
import { Card, Input, Button, Alert } from '../../core/design-system/ui';
import { ChevronRight, ShieldCheck, UserCheck } from 'lucide-react';

// Si el usuario venía de una ruta específica, volvemos ahí (si no, vamos al inicio)
function getRedirectDestination(location) {
  const previousPath = location.state?.from?.pathname;
  if (previousPath && previousPath !== '/dashboard') {
    return previousPath;
  }
  return '/';
}

export function LoginView() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const destination = getRedirectDestination(location);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa correo electrónico y contraseña.');
      return;
    }

    try {
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  function handlePrefillEmail(demoEmail) {
    setEmail(demoEmail);
    setErrorMsg('');
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      passwordInput.focus();
    }
  }

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="text-center mb-8 space-y-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#224F10] font-bold">
          ACCESO SEGURO JWT
        </span>
        <h1 className="font-serif-display text-5xl text-[#0D0D0D]">
          Iniciar sesión
        </h1>
        <p className="text-xs text-[#0D0D0D]/70">
          Ingresa con tus credenciales para participar en subastas en tiempo
          real.
        </p>
      </div>

      <Card className="p-6 sm:p-8 rounded-3xl">
        {errorMsg && (
          <div className="mb-4">
            <Alert type="error" onClose={() => setErrorMsg('')}>
              {errorMsg}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Correo electrónico"
            type="email"
            placeholder="ejemplo@bidzone.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2"
            size="lg"
          >
            <span>{loading ? 'Verificando...' : 'Ingresar a BidZone'}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Botones rápidos para autocompletar correos de prueba */}
        <div className="mt-6 pt-5 border-t border-[#224F10]/15">
          <p className="text-[11px] font-semibold text-[#0D0D0D]/60 mb-3 text-center">
            Autocompletar correo registrado (ingresa la contraseña de tu
            entorno)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handlePrefillEmail('admin@bidzone.com')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-full bg-[#0D0D0D] text-[#EAFFD0] hover:bg-[#224F10] text-xs font-semibold transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#B0E454]" />
              admin@bidzone.com
            </button>
            <button
              type="button"
              onClick={() => handlePrefillEmail('mario@bidzone.com')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-full bg-[#B0E454] text-[#0D0D0D] hover:bg-[#224F10] hover:text-[#EAFFD0] text-xs font-semibold transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              mario@bidzone.com
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#0D0D0D]/70 mt-6">
          ¿Aún no tienes cuenta?{' '}
          <Link
            to="/register"
            className="text-[#224F10] font-bold hover:underline"
          >
            Regístrate aquí
          </Link>
        </p>
      </Card>
    </div>
  );
}
