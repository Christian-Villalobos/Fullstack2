import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

// Instancia única con la configuración base
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de request: aquí pondrás el token JWT si más adelante lo agregas
api.interceptors.request.use((config) => {
  // const token = localStorage.getItem('poe_token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de response: normaliza los errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El backend respondió con 4xx/5xx → ErrorResponseDTO { message, details, ... }
      const data = error.response.data;
      const message =
        data?.details?.join(', ') ||   // errores de validación
        data?.message ||
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

// Compatibilidad: mantiene la firma antigua para no romper los servicios existentes
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