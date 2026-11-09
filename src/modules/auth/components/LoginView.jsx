import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../states/authStore';
import { Card, Input, Button, Alert } from '../../core/design-system/ui';
import { LogIn, ShieldCheck, UserCheck, Gavel } from 'lucide-react';

export function LoginView() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa correo electrónico y contraseña.');
      return;
    }

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
    try {
      await login(demoEmail, demoPass);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 px-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#224F10] border border-[#B0E454]/40 text-[#B0E454] mb-3 shadow-lg">
          <Gavel className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#EAFFD0]">
          Iniciar Sesión en BidZone
        </h1>
        <p className="text-sm text-[#EAFFD0]/65 mt-1">
          Ingresa con tus credenciales para participar en subastas en tiempo real
        </p>
      </div>

      <Card className="p-6">
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
            label="Correo Electrónico"
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
            <LogIn className="w-4 h-4" />
            {loading ? 'Verificando credenciales...' : 'Ingresar a BidZone'}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#224F10]/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#EAFFD0]/60 mb-3 text-center">
            Acceso rápido de prueba (Roles de Evaluación)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@bidzone.com', 'admin123')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#224F10]/40 hover:bg-[#224F10]/80 border border-[#B0E454]/30 text-xs font-semibold text-[#EAFFD0] transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#B0E454]" />
              Rol Administrador
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('mario@bidzone.com', 'user123')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#224F10]/40 hover:bg-[#224F10]/80 border border-[#B0E454]/30 text-xs font-semibold text-[#EAFFD0] transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-[#B0E454]" />
              Rol Usuario (Mario)
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#EAFFD0]/65 mt-6">
          ¿Aún no tienes cuenta?{' '}
          <Link
            to="/register"
            className="text-[#B0E454] font-semibold hover:underline"
          >
            Regístrate aquí
          </Link>
        </p>
      </Card>
    </div>
  );
}

