// Imagen ilustrativa cuando una subasta no trae foto propia
export const IMAGEN_SUBASTA_POR_DEFECTO =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80';

// Opciones de categoría para crear o editar una subasta
export const OPCIONES_CATEGORIAS_SUBASTA = [
  { valor: 'Tecnología', etiqueta: 'Tecnología' },
  { valor: 'Gaming', etiqueta: 'Gaming' },
  { valor: 'Hogar y Oficina', etiqueta: 'Hogar y Oficina' },
  { valor: 'Deportes', etiqueta: 'Deportes' },
  { valor: 'Fotografía', etiqueta: 'Fotografía' },
  { valor: 'Vehículos', etiqueta: 'Vehículos' },
];

// Lista de categorías usada en filtros del inicio, catálogo y panel
export const CATEGORIAS_FILTRO_SUBASTA = [
  'Todas',
  'Tecnología',
  'Gaming',
  'Hogar y Oficina',
  'Deportes',
  'Fotografía',
  'Vehículos',
];

// Opciones para filtrar por estado o cierre en el catálogo público
export const OPCIONES_ESTADO_SALA = [
  { valor: 'activa', etiqueta: 'En vivo (Activas)' },
  { valor: 'terminaHoy', etiqueta: 'Termina Hoy' },
  { valor: 'terminaManana', etiqueta: 'Termina Mañana' },
  { valor: 'finalizada', etiqueta: 'Finalizadas' },
];

// Criterios de ordenamiento compartidos para listas de subastas
export const OPCIONES_ORDEN_SUBASTA = [
  { valor: 'proximasACerrar', etiqueta: 'Próximas a finalizar' },
  { valor: 'menorPrecio', etiqueta: 'Menor precio actual' },
  { valor: 'mayorPrecio', etiqueta: 'Mayor precio actual' },
];

// Formatea un monto a pesos argentinos sin decimales (ejemplo: $ 150.000)
export function formatearMoneda(monto) {
  const numero = Number(monto) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(numero);
}

// Convierte una fecha ISO a texto legible en español (ejemplo: 10 nov 2026, 18:30)
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

// Convierte una fecha al formato YYYY-MM-DDTHH:mm requerido por <input type="datetime-local">
export function fechaParaInputLocal(fechaEntrada) {
  const unDiaEnMs = 24 * 60 * 60 * 1000;
  const fecha = fechaEntrada ? new Date(fechaEntrada) : new Date(Date.now() + unDiaEnMs);
  if (Number.isNaN(fecha.getTime())) return '';

  const diferenciaLocalMs = fecha.getTimezoneOffset() * 60 * 1000;
  return new Date(fecha.getTime() - diferenciaLocalMs).toISOString().slice(0, 16);
}

// Convierte el texto de un <input type="datetime-local"> a fecha ISO UTC para el servidor
export function inputLocalAFechaIso(valorLocal) {
  if (!valorLocal) return '';
  const fecha = new Date(valorLocal);
  return Number.isNaN(fecha.getTime()) ? '' : fecha.toISOString();
}

// Agrega un cero a la izquierda en números de un solo dígito (ejemplo: 7 -> "07")
export function completarDosDigitos(numero) {
  return String(numero).padStart(2, '0');
}

// Calcula el tiempo que falta hasta que termine una subasta
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

  let textoFormateado = `${completarDosDigitos(horas)}:${completarDosDigitos(minutos)}:${completarDosDigitos(segundos)}`;
  if (dias > 0) {
    textoFormateado = `${dias}d ${completarDosDigitos(horas)}h ${completarDosDigitos(minutos)}m ${completarDosDigitos(segundos)}s`;
  }

  return { vencida: false, dias, horas, minutos, segundos, textoFormateado };
}
