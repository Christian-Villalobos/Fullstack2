import { api } from './api';

const CURRENT_USER_KEY = 'poe_current_user';

// ── Sesión ──
export function getCurrentUser() {
  const saved = localStorage.getItem(CURRENT_USER_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Indica si un usuario es administrador (acepta 'ROLE_ADMIN' y 'admin')
export function isAdminUser(user) {
  return Boolean(user && (user.role === 'ROLE_ADMIN' || user.role === 'admin'));
}

// El backend devuelve nombreRol = ADMIN | CLIENTE; el frontend usa ROLE_ADMIN | ROLE_USER
const toFrontUser = (u) => ({
  id: u.idUsuario,
  name: u.nombreUsuario,
  email: u.email,
  role: u.nombreRol === 'ADMIN' ? 'ROLE_ADMIN' : 'ROLE_USER',
});

// ── Login / registro ──
export async function loginUser({ email = '', password = '' }) {
  try {
    const { data } = await api.post('/api/v1/usuarios/login', {
      email: email.trim().toLowerCase(),
      contrasena: password,
    });
    const user = toFrontUser(data);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { ok: true, user };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

export async function registerUser({ name = '', email = '', password = '' }) {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName || !cleanEmail || !password) {
    return { ok: false, message: 'Completa todos los campos.' };
  }

  try {
    await api.post('/api/v1/usuarios', {
      nombreUsuario: cleanName,
      email: cleanEmail,
      contrasena: password,
      idRol: 2, // CLIENTE (seed de servicio-usuarios)
    });
    return { ok: true, message: '¡Registro exitoso! Ya puedes iniciar sesión.' };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// ── Administración de usuarios (solo admin) ──
export async function fetchUsers() {
  try {
    const { data } = await api.get('/api/v1/usuarios');
    return data.map(toFrontUser);
  } catch (error) {
    console.warn('No se pudo cargar la lista de usuarios:', error.message);
    return [];
  }
}

export async function deleteUser(email) {
  try {
    const users = await fetchUsers();
    const target = users.find((u) => u.email === email);
    if (!target || isAdminUser(target)) {
      return { ok: false, message: 'No se puede eliminar este usuario.' };
    }
    await api.delete(`/api/v1/usuarios/${target.id}`);
    return { ok: true, message: 'Usuario eliminado.' };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// ── Aún sin endpoint en el backend ──
const NOT_AVAILABLE = { ok: false, message: 'Esta función aún no está disponible en el servidor.' };

export async function resetPassword() {
  return NOT_AVAILABLE;
}

export async function changePassword() {
  return NOT_AVAILABLE;
}

export async function updateProfile() {
  return NOT_AVAILABLE;
}