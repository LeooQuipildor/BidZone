import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../states/authStore';
import { Card, Input, Button, Alert } from '../../core/design-system/ui';
import { UserPlus } from 'lucide-react';

export function RegisterView() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setErrorMsg('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Las contraseñas ingresadas no coinciden.');
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMsg(
        'El teléfono de contacto es obligatorio para coordinar pago y entrega al ganar o vender en una subasta.'
      );
      return;
    }

    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-8 px-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#224F10] border border-[#B0E454]/40 text-[#B0E454] mb-3 shadow-lg">
          <UserPlus className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#EAFFD0]">
          Crear Cuenta en BidZone
        </h1>
        <p className="text-sm text-[#EAFFD0]/65 mt-1">
          Tus datos de contacto permanecerán privados y solo se liberarán cuando ganes o cierres una subasta
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
            id="name"
            name="name"
            label="Nombre y Apellido *"
            placeholder="Ej: Juan Pérez"
            value={formData.name}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Correo Electrónico *"
              placeholder="juan@correo.com"
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              id="phone"
              name="phone"
              label="Teléfono / WhatsApp *"
              placeholder="+54 9 381 555-0000"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <Input
            id="city"
            name="city"
            label="Ciudad / Provincia *"
            placeholder="San Miguel de Tucumán"
            value={formData.city}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="password"
              name="password"
              type="password"
              label="Contraseña *"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
            />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirmar Contraseña *"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2"
            size="lg"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Registrando cuenta...' : 'Crear mi cuenta'}
          </Button>
        </form>

        <p className="text-center text-xs text-[#EAFFD0]/65 mt-6">
          ¿Ya tienes una cuenta?{' '}
          <Link
            to="/login"
            className="text-[#B0E454] font-semibold hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </Card>
    </div>
  );
}

