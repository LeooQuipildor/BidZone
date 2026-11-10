import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../states/authStore';
import { Card, Input, Button, Alert } from '../../core/design-system/ui';
import { ChevronRight } from 'lucide-react';

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
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-8">
      <div className="text-center mb-8 space-y-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#224F10] font-bold">
          NUEVO PARTICIPANTE
        </span>
        <h1 className="font-serif-display text-5xl text-[#0D0D0D]">
          Crear cuenta
        </h1>
        <p className="text-xs text-[#0D0D0D]/70 max-w-sm mx-auto">
          Tus datos de contacto permanecerán privados y solo se liberarán cuando ganes o cierres una subasta.
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
            id="name"
            name="name"
            label="Nombre y apellido *"
            placeholder="Ej: Juan Pérez"
            value={formData.name}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Correo electrónico *"
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
              label="Confirmar contraseña *"
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
            <span>{loading ? 'Registrando...' : 'Crear mi cuenta'}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-xs text-[#0D0D0D]/70 mt-6">
          ¿Ya tienes una cuenta?{' '}
          <Link
            to="/login"
            className="text-[#224F10] font-bold hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </Card>
    </div>
  );
}
