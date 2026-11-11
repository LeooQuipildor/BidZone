import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Input, Select } from '../../nucleo/diseno/ui';

const OPCIONES_ESTADO_EXPEDIENTE = [
  { value: 'en_revision', label: 'En revisión / Mediación' },
  { value: 'resuelto_sancion', label: 'Resuelto con Sanción al Infractor' },
  { value: 'desestimado', label: 'Solucionado entre las partes' },
];

const OPCIONES_ACCION_CUENTA = [
  { value: 'none', label: 'Mantener estado actual' },
  { value: 'suspend', label: 'Infraccionar y Suspender Cuenta' },
  { value: 'close', label: 'Cerrar Cuenta Definitivamente' },
  { value: 'activate', label: 'Rehabilitar Cuenta' },
];

// Bloque exclusivo para que un administrador dicte resolución y sanción (RN06)
export function SeccionResolucionAdmin({ datosFormulario, alCambiar }) {
  return (
    <div className="space-y-3 pt-4 border-t border-[#224F10]/20 bg-[#F7FBF3] p-4 rounded-2xl">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#224F10]">
        <ShieldAlert className="w-4 h-4" />
        Resolución Administrativa RN06
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="estado"
          name="estado"
          label="Estado del Expediente"
          value={datosFormulario.estado}
          onChange={alCambiar}
          options={OPCIONES_ESTADO_EXPEDIENTE}
        />
        <Select
          id="accionCuenta"
          name="accionCuenta"
          label="Acción sobre la Cuenta"
          value={datosFormulario.accionCuenta}
          onChange={alCambiar}
          options={OPCIONES_ACCION_CUENTA}
        />
      </div>

      <Input
        id="sancionAplicada"
        name="sancionAplicada"
        label="Dictamen / Sanción Registrada"
        placeholder="Ej: Suspensión temporal de cuenta..."
        value={datosFormulario.sancionAplicada}
        onChange={alCambiar}
      />
    </div>
  );
}
