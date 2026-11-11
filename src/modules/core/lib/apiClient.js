// URL base del backend REST (toma la variable de entorno o usa localhost:3000 por defecto)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Función que se ejecuta si el servidor responde 401 (sesión expirada o token inválido)
let unauthorizedHandler = null;

// Lista de funciones que limpian cada store cuando el usuario cierra sesión
const sessionResetCallbacks = [];

export function registerUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export function registerSessionReset(callback) {
  if (!sessionResetCallbacks.includes(callback)) {
    sessionResetCallbacks.push(callback);
  }
}

export function runSessionResets() {
  for (const resetStore of sessionResetCallbacks) {
    try {
      resetStore();
    } catch {
      // Ignoramos errores puntuales para seguir limpiando el resto de los stores
    }
  }
}

// Lee el JSON de la respuesta sin romper el programa si viene vacío o inválido
async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

// Función central para hacer peticiones HTTP (GET, POST, PUT, PATCH, DELETE) al backend
export async function httpRequest(endpoint, options = {}) {
  const token = localStorage.getItem('bidzone_token');

  // Armamos las cabeceras HTTP básicas
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor de BidZone. Verifica que el backend REST y MySQL estén en ejecución.'
    );
  }

  // 204 No Content significa éxito sin cuerpo en la respuesta (ej: DELETE)
  if (response.status === 204) {
    return null;
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const isAuthEndpoint =
      endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');

    if (response.status === 401 && token && !isAuthEndpoint) {
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }

    throw new Error(data.message || `Error HTTP ${response.status}`);
  }

  return data;
}
