import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

// Instancia única con la configuración base
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de response: normaliza los errores del backend Spring Boot
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El backend respondió con 4xx/5xx:
      // - Negocio: { message }
      // - Validación: { campoConError: "...", message: "..." }
      const data = error.response.data;
      const fallbackValidation =
        data && typeof data === 'object' ? Object.values(data).filter(Boolean).join(', ') : '';
      const message =
        data?.message ||
        fallbackValidation ||
        `Error ${error.response.status}`;

      const err = new Error(message);
      err.status = error.response.status;
      err.isNetworkError = false;
      return Promise.reject(err);
    }

    // Sin respuesta: backend caído, CORS o timeout
    const err = new Error('No se pudo conectar con el servidor.');
    err.isNetworkError = true;
    return Promise.reject(err);
  }
);

// Helper unificado para realizar peticiones a la API
export async function apiRequest(endpoint, { method = 'GET', body, headers, params } = {}) {
  const { data } = await api.request({
    url: endpoint,
    method,
    params,
    headers,
    data: typeof body === 'string' ? JSON.parse(body) : body,
  });
  return data;
}