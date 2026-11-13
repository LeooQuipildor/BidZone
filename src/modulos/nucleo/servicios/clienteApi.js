// ============================================================================
// ARCHIVO: src/modulos/nucleo/servicios/clienteApi.js
// RESPONSABILIDAD: Cliente HTTP centralizado para la comunicación con el Backend.
// ============================================================================
//
// ¿POR QUÉ EXISTE ESTE ARCHIVO?
// En lugar de llamar a 'fetch()' disperso por decenas de componentes y tiendas:
// 1. Centraliza la URL base del servidor backend.
// 2. Lee automáticamente el token JWT guardado en 'localStorage' y lo adjunta
//    en la cabecera 'Authorization: Bearer <token>' de cada petición.
// 3. Maneja de forma unificada las respuestas de error del servidor (400, 401, 404, 500).
// 4. Si el servidor responde 401 (no autorizado / token vencido), dispara
//    automáticamente el cierre de sesión y la limpieza de datos en memoria.
//
// CONCEPTOS CLAVE DE JAVASCRIPT Y REDES:
// - 'import.meta.env': Objeto provisto por Vite para leer variables de entorno.
//   Si existe 'VITE_API_URL' en un archivo '.env', la usa; si no, recurre al valor
//   por defecto 'http://localhost:3000/api'.
// - 'localStorage': Espacio de almacenamiento clave-valor persistente del navegador.
//   Los datos guardados aquí sobreviven incluso si el usuario cierra la pestaña o reinicia.
// - 'JWT (JSON Web Token)': Cadena codificada que viaja en las cabeceras HTTP y sirve
//   como credencial de identidad firmada por el backend.
// ============================================================================

// Dirección base de la API REST del backend (leída de Vite o fallback local).
const URL_BASE_API =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Clave utilizada para guardar y leer el token JWT en el localStorage del navegador.
export const CLAVE_TOKEN = 'bidzone_token';

/**
 * Verifica de forma síncrona si hay un token guardado en el navegador.
 * Devuelve 'true' si existe o 'false' si está vacío.
 */
export function hayTokenSesion() {
  return Boolean(localStorage.getItem(CLAVE_TOKEN));
}

// Variable que guarda la función a ejecutar cuando el servidor rechaza una petición con 401.
// Se inicializa en null y la tienda de autenticación la registra al arrancar la app.
let manejadorSinAutorizacion = null;

// Lista de funciones de limpieza registradas por las tiendas (Zustand).
// Permite que al cerrar sesión, cada tienda limpie sus datos locales (observador / suscriptor).
const funcionesLimpiezaSesion = [];

/**
 * Permite a la tienda de autenticación registrar qué hacer cuando un token vence (401).
 * @param {Function} manejador - Función que borra el usuario y redirige al login.
 */
export function registrarManejadorSinAutorizacion(manejador) {
  manejadorSinAutorizacion = manejador;
}

/**
 * Permite a cualquier tienda suscribir una función para limpiar su estado en logout.
 * @param {Function} funcionLimpieza - Función que resetea el estado a sus valores iniciales.
 */
export function registrarLimpiezaSesion(funcionLimpieza) {
  if (!funcionesLimpiezaSesion.includes(funcionLimpieza)) {
    funcionesLimpiezaSesion.push(funcionLimpieza);
  }
}

/**
 * Ejecuta en cadena todas las funciones de limpieza registradas al cerrar la sesión.
 */
export function ejecutarLimpiezaSesion() {
  for (const limpiarEstado of funcionesLimpiezaSesion) {
    try {
      limpiarEstado();
    } catch {
      // Si falla una limpieza puntual, continuamos limpiando las demás tiendas
      // para evitar que datos privados queden retenidos en memoria.
    }
  }
}

/**
 * Función auxiliar para leer el cuerpo de una respuesta HTTP como JSON.
 * Si la respuesta viene vacía o no es JSON válido (ej: texto plano o 204),
 * devuelve un objeto vacío '{}' en lugar de lanzar una excepción no controlada.
 */
async function leerJsonSeguro(respuesta) {
  try {
    return await respuesta.json();
  } catch {
    return {};
  }
}

/**
 * Función principal para realizar peticiones HTTP a la API de BidZone.
 *
 * @param {string} ruta - Ruta relativa del endpoint (ej: '/auctions', '/bids/1').
 * @param {object} opciones - Objeto de configuración de fetch (method, body, headers).
 * @returns {Promise<any>} - Promesa que resuelve a los datos parseados de la respuesta.
 * @throws {Error} - Lanza un Error con el mensaje devuelto por el servidor si 'respuesta.ok' es false.
 *
 * PASO A PASO:
 * 1. Lee el token JWT actual de 'localStorage'.
 * 2. Prepara las cabeceras predeterminadas ('Content-Type: application/json') y añade 'Authorization'.
 * 3. Ejecuta 'fetch()' contra la URL completa.
 * 4. Si el status es 204 (No Content), retorna 'null'.
 * 5. Si la respuesta es errónea (!respuesta.ok), procesa el código de estado (incluyendo 401) y lanza un Error.
 * 6. Si fue exitosa, retorna los datos en formato objeto JavaScript.
 */
export async function peticionHttp(ruta, opciones = {}) {
  // 1. Obtenemos el token de sesión guardado (si existe)
  const token = localStorage.getItem(CLAVE_TOKEN);

  // 2. Preparamos las cabeceras de la petición
  const cabeceras = {
    'Content-Type': 'application/json',
  };

  // Si hay un usuario conectado, adjuntamos su token en formato estándar Bearer
  if (token) {
    cabeceras.Authorization = `Bearer ${token}`;
  }

  // Si la llamada específica incluía cabeceras adicionales, las combinamos
  if (opciones.headers) {
    Object.assign(cabeceras, opciones.headers);
  }

  // 3. Realizamos la llamada de red mediante fetch()
  let respuesta;
  try {
    respuesta = await fetch(`${URL_BASE_API}${ruta}`, {
      ...opciones,
      headers: cabeceras,
    });
  } catch {
    // Si la llamada falló a nivel de red (servidor caído o sin conexión), informamos con claridad
    throw new Error(
      'No se pudo conectar con el servidor de BidZone. Verifica que el backend REST y MySQL estén en ejecución.'
    );
  }

  // 4. Código HTTP 204 = Éxito sin cuerpo (común en eliminaciones DELETE)
  if (respuesta.status === 204) {
    return null;
  }

  // 5. Leemos el cuerpo JSON de la respuesta
  const datos = await leerJsonSeguro(respuesta);

  // 6. Si el código HTTP no está en el rango de éxito 200-299:
  if (!respuesta.ok) {
    const esRutaAutenticacion =
      ruta.startsWith('/auth/login') || ruta.startsWith('/auth/register');

    // Si recibimos 401 (No autorizado) en una ruta que requiere token válido,
    // significa que el token venció o fue revocado; disparamos el cierre de sesión automático.
    if (respuesta.status === 401 && token && !esRutaAutenticacion) {
      if (manejadorSinAutorizacion) {
        manejadorSinAutorizacion();
      }
    }

    // Lanzamos el error con el mensaje devuelto por el backend o el código HTTP
    throw new Error(datos.message || `Error HTTP ${respuesta.status}`);
  }

  // 7. Retornamos los datos limpios para que la tienda los almacene
  return datos;
}

