const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let unauthorizedHandler = null;
const sessionResetCallbacks = new Set();

export function registerUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export function registerSessionReset(callback) {
  sessionResetCallbacks.add(callback);
  return () => sessionResetCallbacks.delete(callback);
}

export function runSessionResets() {
  sessionResetCallbacks.forEach((cb) => {
    try {
      cb();
    } catch {
      // Ignorar errores en limpieza de stores
    }
  });
}

export async function httpRequest(endpoint, options = {}) {
  const token = localStorage.getItem('bidzone_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

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

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (
      response.status === 401 &&
      token &&
      !endpoint.startsWith('/auth/login') &&
      !endpoint.startsWith('/auth/register')
    ) {
      unauthorizedHandler?.();
    }
    throw new Error(data.message || `Error HTTP ${response.status}`);
  }

  return data;
}
