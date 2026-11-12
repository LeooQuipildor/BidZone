// Dirección base de la API REST del backend
const URL_BASE_API =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const CLAVE_TOKEN = 'bidzone_token';

// Indica si existe un token de sesión guardado en el navegador
export function hayTokenSesion() {
  return Boolean(localStorage.getItem(CLAVE_TOKEN));
}

// Función que se ejecuta si el servidor responde 401 (sesión vencida o token inválido)
let manejadorSinAutorizacion = null;

// Lista de funciones que limpian cada tienda al cerrar la sesión
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
    }
  }
}

// Intenta leer la respuesta como JSON sin romper la aplicación si viene vacía
async function leerJsonSeguro(respuesta) {
  try {
    return await respuesta.json();
  } catch {
    return {};
  }
}

// Función central para enviar peticiones HTTP (GET, POST, PUT, PATCH, DELETE) al backend
export async function peticionHttp(ruta, opciones = {}) {
  const token = localStorage.getItem(CLAVE_TOKEN);

  const cabeceras = {
    'Content-Type': 'application/json',
  };

  if (token) {
    cabeceras.Authorization = `Bearer ${token}`;
  }

  if (opciones.headers) {
    Object.assign(cabeceras, opciones.headers);
  }

  let respuesta;
  try {
    respuesta = await fetch(`${URL_BASE_API}${ruta}`, {
      ...opciones,
      headers: cabeceras,
    });
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor de BidZone. Verifica que el backend REST y MySQL estén en ejecución.'
    );
  }

  // 204 significa que la operación fue exitosa pero el servidor no devolvió contenido
  if (respuesta.status === 204) {
    return null;
  }

  const datos = await leerJsonSeguro(respuesta);

  if (!respuesta.ok) {
    const esRutaAutenticacion =
      ruta.startsWith('/auth/login') || ruta.startsWith('/auth/register');

    if (respuesta.status === 401 && token && !esRutaAutenticacion) {
      if (manejadorSinAutorizacion) {
        manejadorSinAutorizacion();
      }
    }

    throw new Error(datos.message || `Error HTTP ${respuesta.status}`);
  }

  return datos;
}

