// ============================================================================
// ARCHIVO: src/modulos/nucleo/utilidades/formatos.js
// RESPONSABILIDAD: Formateo visual de moneda, fechas, temporizadores y textos.
// ============================================================================
//
// ¿POR QUÉ EXISTE ESTE ARCHIVO?
// En lugar de transformar números y fechas de forma manual e inconsistente en cada vista:
// 1. Centraliza la internacionalización ('Intl.NumberFormat' e 'Intl.DateTimeFormat').
// 2. Define las opciones estándar para selects y filtros de subastas.
// 3. Proporciona funciones de cálculo temporal para contadores regresivos en vivo.
// ============================================================================

// Imagen ilustrativa por defecto cuando una subasta se publica sin enlace de foto propia.
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

/**
 * Formatea un número como moneda en pesos argentinos (ARS) sin decimales.
 * 
 * CONCEPTO JAVASCRIPT:
 * 'Intl.NumberFormat': API estándar del navegador para formatear monedas según la
 * región ('es-AR'). Coloca automáticamente el signo '$', separadores de miles con punto
 * ($ 150.000) y maneja valores nulos o no numéricos con seguridad.
 * 
 * @param {number|string} monto - Importe a formatear.
 * @returns {string} - Ejemplo: "$ 150.000".
 */
export function formatearMoneda(monto) {
  const numero = Number(monto) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(numero);
}

/**
 * Convierte una fecha ISO del backend a formato de texto legible en español.
 * 
 * @param {string} fechaTexto - Cadena de fecha ISO 8601 (ej: "2026-11-10T18:30:00.000Z").
 * @returns {string} - Ejemplo: "10 nov 2026, 18:30" o "—" si no es válida.
 */
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

/**
 * Convierte una fecha a formato local requerido por el input HTML <input type="datetime-local">.
 * El formato esperado por el navegador es exactamente 'YYYY-MM-DDTHH:mm'.
 * 
 * @param {string|Date} fechaEntrada - Fecha original. Si no se pasa, usa 24 horas a futuro.
 * @returns {string} - Texto listo para la propiedad 'value' del input.
 */
export function fechaParaInputLocal(fechaEntrada) {
  const unDiaEnMs = 24 * 60 * 60 * 1000;
  const fecha = fechaEntrada ? new Date(fechaEntrada) : new Date(Date.now() + unDiaEnMs);
  if (Number.isNaN(fecha.getTime())) return '';

  // Ajustamos la diferencia horaria local (timezone offset) para no perder horas al convertir
  const diferenciaLocalMs = fecha.getTimezoneOffset() * 60 * 1000;
  return new Date(fecha.getTime() - diferenciaLocalMs).toISOString().slice(0, 16);
}

/**
 * Convierte el valor local de un <input type="datetime-local"> a fecha ISO en UTC para el servidor.
 * 
 * @param {string} valorLocal - Texto devuelto por el input (ej: "2026-11-15T20:00").
 * @returns {string} - Cadena ISO 8601 estándar (ej: "2026-11-15T23:00:00.000Z").
 */
export function inputLocalAFechaIso(valorLocal) {
  if (!valorLocal) return '';
  const fecha = new Date(valorLocal);
  return Number.isNaN(fecha.getTime()) ? '' : fecha.toISOString();
}

/**
 * Rellena un número con un cero a la izquierda si tiene un solo dígito (ej: 7 -> "07").
 * Utiliza 'String.prototype.padStart'.
 */
function completarDosDigitos(numero) {
  return String(numero).padStart(2, '0');
}

/**
 * Calcula el tiempo exacto que resta hasta que venza una subasta.
 * 
 * MATEMÁTICA TEMPORAL:
 * 1. Resta: 'fechaFin - ahoraMs' = milisegundos restantes.
 * 2. Si es <= 0: la subasta ya venció ('vencida: true').
 * 3. 1 día = 86.400 segundos (24 * 60 * 60).
 * 4. 1 hora = 3.600 segundos (60 * 60).
 * 5. 1 minuto = 60 segundos.
 * 
 * @param {string} fechaFinTexto - Fecha de fin ISO de la subasta.
 * @param {number} ahoraMs - Marca de tiempo actual provista por el hook 'useRelojSegundo'.
 * @returns {{ vencida: boolean, dias: number, horas: number, minutos: number, segundos: number, textoFormateado: string }}
 */
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

/**
 * Obtiene las primeras dos iniciales de un nombre para mostrar en avatares circulares.
 * Ejemplo: "Mario Rossi" -> "MR", "Luciano" -> "L", "" -> "BZ".
 * 
 * @param {string} nombre - Nombre completo del usuario.
 * @param {string} respaldo - Iniciales por defecto si no hay nombre.
 * @returns {string} - Dos letras en mayúsculas.
 */
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

/**
 * Traduce el código de rol técnico del backend ('admin', 'user') a texto en español.
 * 
 * @param {string} rol - 'admin' o 'user'.
 * @param {boolean} versionCorta - Si es true devuelve 'Admin' o 'Socio'.
 * @returns {string}
 */
export function formatearRolUsuario(rol, versionCorta = false) {
  if (rol === 'admin') return versionCorta ? 'Admin' : 'Administrador';
  return 'Socio';
}

/**
 * Traduce el estado disciplinario de una cuenta de usuario a una etiqueta comprensible.
 * Estados: 'active' (Activa), 'suspended' (Suspendida por RN06), 'closed' (Cerrada definitiva).
 * 
 * @param {string} estado - Código de estado en la base de datos.
 * @returns {string}
 */
export function formatearEstadoCuenta(estado) {
  if (estado === 'suspended') return 'Suspendida';
  if (estado === 'closed') return 'Cerrada';
  return 'Activa';
}
