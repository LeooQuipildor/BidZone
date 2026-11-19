export const IMAGEN_SUBASTA_POR_DEFECTO =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80';

// Opciones de categoría temática disponibles al crear o editar una publicación.
// Se usa en: 'CamposSubasta.jsx' para poblar el <Select>.
export const OPCIONES_CATEGORIAS_SUBASTA = [
  { valor: 'Tecnología', etiqueta: 'Tecnología' },
  { valor: 'Gaming', etiqueta: 'Gaming' },
  { valor: 'Hogar y Oficina', etiqueta: 'Hogar y Oficina' },
  { valor: 'Deportes', etiqueta: 'Deportes' },
  { valor: 'Fotografía', etiqueta: 'Fotografía' },
  { valor: 'Vehículos', etiqueta: 'Vehículos' },
];

// Lista de categorías para botones horizontales de filtro (incluye opción 'Todas').
// Se usa en: 'FiltrosBotones.jsx' en Inicio, Catálogo y Panel.
export const CATEGORIAS_FILTRO_SUBASTA = [
  'Todas',
  'Tecnología',
  'Gaming',
  'Hogar y Oficina',
  'Deportes',
  'Fotografía',
  'Vehículos',
];

// Opciones para filtrar por estado o cercanía al cierre en el catálogo público.
export const OPCIONES_ESTADO_SALA = [
  { valor: 'activa', etiqueta: 'En vivo (Activas)' },
  { valor: 'terminaHoy', etiqueta: 'Termina Hoy' },
  { valor: 'terminaManana', etiqueta: 'Termina Mañana' },
  { valor: 'finalizada', etiqueta: 'Finalizadas' },
];

// Criterios de ordenamiento compartidos para catálogos y listas de subastas.
export const OPCIONES_ORDEN_SUBASTA = [
  { valor: 'proximasACerrar', etiqueta: 'Próximas a finalizar' },
  { valor: 'menorPrecio', etiqueta: 'Menor precio actual' },
  { valor: 'mayorPrecio', etiqueta: 'Mayor precio actual' },
];

export function formatearMoneda(monto) {
  const numero = Number(monto) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(numero);
}

export function formatearFechaHora(fechaTexto) {
  if (!fechaTexto) return '—';
  const fecha = new Date(fechaTexto);
  if (Number.isNaN(fecha.getTime())) return fechaTexto;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
}

export function fechaParaInputLocal(fechaEntrada) {
  const unDiaEnMs = 24 * 60 * 60 * 1000;
  const fecha = fechaEntrada ? new Date(fechaEntrada) : new Date(Date.now() + unDiaEnMs);
  if (Number.isNaN(fecha.getTime())) return '';

  // Ajustamos la diferencia horaria local (timezone offset) para no perder horas al convertir
  const diferenciaLocalMs = fecha.getTimezoneOffset() * 60 * 1000;
  return new Date(fecha.getTime() - diferenciaLocalMs).toISOString().slice(0, 16);
}

export function inputLocalAFechaIso(valorLocal) {
  if (!valorLocal) return '';
  const fecha = new Date(valorLocal);
  return Number.isNaN(fecha.getTime()) ? '' : fecha.toISOString();
}

function completarDosDigitos(numero) {
  return String(numero).padStart(2, '0');
}

export function calcularTiempoRestante(fechaFinTexto, ahoraMs = Date.now()) {
  const diferenciaMs = new Date(fechaFinTexto).getTime() - ahoraMs;
  if (Number.isNaN(diferenciaMs) || diferenciaMs <= 0) {
    return {
      vencida: true,
      dias: 0,
      horas: 0,
      minutos: 0,
      segundos: 0,
      textoFormateado: 'Finalizada',
    };
  }

  const totalSegundos = Math.floor(diferenciaMs / 1000);
  const dias = Math.floor(totalSegundos / 86400);
  const horas = Math.floor((totalSegundos % 86400) / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  // Formato compacto tipo reloj digital
  let textoFormateado = `${completarDosDigitos(horas)}:${completarDosDigitos(minutos)}:${completarDosDigitos(segundos)}`;
  if (dias > 0) {
    textoFormateado = `${dias}d ${completarDosDigitos(horas)}h ${completarDosDigitos(minutos)}m ${completarDosDigitos(segundos)}s`;
  }

  return { vencida: false, dias, horas, minutos, segundos, textoFormateado };
}

export function obtenerIniciales(nombre, respaldo = 'BZ') {
  const texto = String(nombre || respaldo).trim();
  if (!texto) return respaldo;

  const palabras = texto.split(' ');
  let iniciales = '';
  for (const palabra of palabras) {
    if (palabra) iniciales += palabra[0];
    if (iniciales.length === 2) break;
  }
  return (iniciales || respaldo).toUpperCase();
}

export function formatearRolUsuario(rol, versionCorta = false) {
  if (rol === 'admin') return versionCorta ? 'Admin' : 'Administrador';
  return 'Socio';
}

export function formatearEstadoCuenta(estado) {
  if (estado === 'suspendida') return 'Suspendida';
  if (estado === 'cerrada') return 'Cerrada';
  return 'Activa';
}
