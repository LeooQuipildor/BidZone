const URL_BASE_API =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Clave utilizada para guardar y leer el token JWT en el localStorage del navegador.
export const CLAVE_TOKEN = 'bidzone_token';

export function hayTokenSesion() {
  return Boolean(localStorage.getItem(CLAVE_TOKEN));
}

// Variable que guarda la función a ejecutar cuando el servidor rechaza una petición con 401.
// Se inicializa en null y la tienda de autenticación la registra al arrancar la app.
let manejadorSinAutorizacion = null;

// Lista de funciones de limpieza registradas por las tiendas (Zustand).
// Permite que al cerrar sesión, cada tienda limpie sus datos locales (observador / suscriptor).
const funcionesLimpiezaSesion = [];

export function registrarManejadorSinAutorizacion(manejador) {
  manejadorSinAutorizacion = manejador;
}

export function registrarLimpiezaSesion(funcionLimpieza) {
  if (!funcionesLimpiezaSesion.includes(funcionLimpieza)) {
    funcionesLimpiezaSesion.push(funcionLimpieza);
  }
}

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

async function leerJsonSeguro(respuesta) {
  try {
    return await respuesta.json();
  } catch {
    return {};
  }
}

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
      ruta.startsWith('/autenticacion/iniciar-sesion') ||
      ruta.startsWith('/autenticacion/registrar');

    // Si recibimos 401 (No autorizado) en una ruta que requiere token válido,
    // significa que el token venció o fue revocado; disparamos el cierre de sesión automático.
    if (respuesta.status === 401 && token && !esRutaAutenticacion) {
      if (manejadorSinAutorizacion) {
        manejadorSinAutorizacion();
      }
    }

    // Lanzamos el error con el mensaje devuelto por el backend o el código HTTP
    throw new Error(datos.mensaje || datos.message || `Error HTTP ${respuesta.status}`);
  }

  // 7. Retornamos los datos limpios para que la tienda los almacene
  return datos;
}

