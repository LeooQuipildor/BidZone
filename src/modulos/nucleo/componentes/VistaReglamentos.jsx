// ============================================================================
// ARCHIVO: src/modulos/nucleo/componentes/VistaReglamentos.jsx
// RESPONSABILIDAD: Vista informativa de las 8 Reglas de Negocio (RN01 - RN08).
// ============================================================================
//
// ¿QUÉ ENCONTRAMOS EN ESTA VISTA?
// Explica de manera accesible las normas de convivencia y las restricciones
// técnicas que el sistema aplica en el frontend y backend para evitar fraudes,
// auto-pujas y cancelaciones arbitrarias de ofertas.
// ============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  Clock,
  Gavel,
  Lock,
  PhoneCall,
  ShieldCheck,
  Star,
  UserX,
} from 'lucide-react';
import { Badge, Button, Card } from '../diseno/ui';
import { CabeceraPagina } from '../diseno/componentesBloques';

// Constante con las 8 reglas de negocio del sistema
const REGLAS_PLATAFORMA = [
  {
    codigo: 'RN01',
    titulo: 'Incremento mínimo por oferta',
    descripcion:
      'Cada puja debe superar el precio actual respetando al menos el incremento mínimo definido al crear la subasta.',
    icono: Gavel,
  },
  {
    codigo: 'RN02',
    titulo: 'Prohibición de auto-puja',
    descripcion:
      'Quien publica el artículo no puede realizar ofertas sobre su propia subasta bajo ninguna circunstancia.',
    icono: UserX,
  },
  {
    codigo: 'RN03',
    titulo: 'Vigencia temporal estricta',
    descripcion:
      'Solo se aceptan ofertas mientras la subasta esté activa y antes de que el reloj llegue a cero.',
    icono: Clock,
  },
  {
    codigo: 'RN04',
    titulo: 'Ofertas vinculantes e irrevocables',
    descripcion:
      'Al confirmar una puja asumes el compromiso real de compra; los montos enviados no se pueden cancelar ni bajar.',
    icono: ShieldCheck,
  },
  {
    codigo: 'RN05',
    titulo: 'Liberación condicional de contacto',
    descripcion:
      'Teléfono, WhatsApp y correo permanecen ocultos al público y solo se habilitan entre vendedor y ganador al cerrar.',
    icono: PhoneCall,
  },
  {
    codigo: 'RN06',
    titulo: 'Reportes, infracciones y sanciones',
    descripcion:
      'Ante falta de pago, ausencia de entrega o falta de respuesta, la contraparte puede radicar un reporte para suspender o cerrar la cuenta.',
    icono: AlertOctagon,
  },
  {
    codigo: 'RN07',
    titulo: 'Calificación mutua de 1 a 5 estrellas',
    descripcion:
      'Una vez adjudicada la operación, vendedor y ganador pueden calificarse una única vez para construir reputación verificada.',
    icono: Star,
  },
  {
    codigo: 'RN08',
    titulo: 'Inmutabilidad tras recibir ofertas',
    descripcion:
      'Cuando un lote ya tiene al menos una puja registrada, el vendedor no puede modificar precio base, incremento ni fecha de cierre.',
    icono: Lock,
  },
];

export function VistaReglamentos() {
  const navegar = useNavigate();

  return (
    <div className="space-y-8">
      {/* Cabecera visual con botón de acción */}
      <CabeceraPagina
        titulo="Reglamentos y Normas de Uso"
        subtitulo="Conoce las reglas obligatorias que garantizan transparencia, compromiso de compra y trato directo seguro en cada subasta."
        accion={
          <Button onClick={() => navegar('/subastas')}>Explorar subastas</Button>
        }
      />

      {/* Grilla responsiva de 2 columnas con tarjetas por cada regla */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REGLAS_PLATAFORMA.map((regla) => {
          const Icono = regla.icono;
          return (
            <Card key={regla.codigo} className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="w-10 h-10 rounded-full bg-[#B0E454]/45 text-[#224F10] flex items-center justify-center shrink-0">
                  <Icono className="w-5 h-5" />
                </span>
                <Badge variant="lime">{regla.codigo}</Badge>
              </div>
              <h2 className="text-lg font-bold text-[#0D0D0D]">{regla.titulo}</h2>
              <p className="text-xs sm:text-sm text-[#0D0D0D]/75 leading-relaxed">
                {regla.descripcion}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Banner inferior oscuro destacando la mesa de mediación RN06 */}
      <div className="rounded-3xl bg-[#0D0D0D] text-[#EAFFD0] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-[#B0E454]">
            Mediación y cumplimiento RN06
          </p>
          <p className="text-sm sm:text-base font-medium">
            ¿Tuviste un inconveniente tras finalizar una subasta? Puedes iniciar sesión y registrar un expediente en el centro de reportes.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navegar('/reportes')}>
          Ir a Reportes
        </Button>
      </div>
    </div>
  );
}

