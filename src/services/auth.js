import { apiRequest } from './api';

const CURRENT_USER_KEY = 'poe_current_user';

export function getCurrentUser() {
  const saved = localStorage.getItem(CURRENT_USER_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Indica si un usuario es administrador (acepta 'ROLE_ADMIN' y 'admin')
export function isAdminUser(user) {
  return Boolean(user && (user.role === 'ROLE_ADMIN' || user.role === 'admin'));
}

// Iniciar sesión (100% API)
export async function loginUser({ email = '', password = '' }) {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    return { ok: false, message: 'Ingresa tu correo y contraseña.' };
  }

  try {
    const user = await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return { ok: true, user };
    }
    return { ok: false, message: 'Correo o contraseña incorrectos.' };
  } catch (error) {
    return { ok: false, message: error.message || 'Correo o contraseña incorrectos.' };
  }
}

// Registrar usuario (100% API)
export async function registerUser({ name = '', email = '', password = '' }) {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName || !cleanEmail || !password) {
    return { ok: false, message: 'Completa todos los campos.' };
  }

  try {
    const user = await apiRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
    });
    return { ok: true, message: '¡Registro exitoso! Ya puedes iniciar sesión.', user };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// Recuperar / Restablecer contraseña (100% API)
export async function resetPassword(email = '', newPassword = '') {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !newPassword) {
    return { ok: false, message: 'Ingresa tu correo y la nueva contraseña.' };
  }

  try {
    const res = await apiRequest('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail, newPassword }),
    });
    return { ok: true, message: res?.message || 'Contraseña restablecida con éxito' };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// Cambiar contraseña (Perfil - 100% API)
export async function changePassword(user, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    return { ok: false, message: 'Debes ingresar tu contraseña actual y la nueva contraseña.' };
  }

  const userId = typeof user === 'object' ? user?.id : null;
  if (!userId) {
    return { ok: false, message: 'Sesión inválida. Vuelve a iniciar sesión.' };
  }

  try {
    const res = await apiRequest(`/api/v1/users/${userId}/change-password`, {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return { ok: true, message: res?.message || 'Contraseña actualizada exitosamente.' };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// Actualizar perfil (nombre - 100% API)
export async function updateProfile(user, { name = '' }) {
  const cleanName = name.trim();
  if (!cleanName) {
    return { ok: false, message: 'El nombre no puede estar vacío.' };
  }

  const userId = typeof user === 'object' ? user?.id : null;
  if (!userId) {
    return { ok: false, message: 'Sesión inválida. Vuelve a iniciar sesión.' };
  }

  try {
    const updated = await apiRequest(`/api/v1/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify({ name: cleanName }),
    });
    const currentUser = getCurrentUser();
    const newSession = { ...currentUser, ...updated };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newSession));
    return { ok: true, message: 'Perfil actualizado con éxito.', user: newSession };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// Listar usuarios activos (Admin - 100% API)
export async function fetchUsers() {
  try {
    const data = await apiRequest('/api/v1/users');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Error cargando usuarios:', error.message);
    return [];
  }
}

// Eliminar usuario (Admin - Soft Delete 100% API)
export async function deleteUser(userIdOrEmail) {
  try {
    let targetId = typeof userIdOrEmail === 'number' ? userIdOrEmail : null;

    if (!targetId) {
      const users = await fetchUsers();
      const target = users.find((u) => u.email === userIdOrEmail);
      if (!target) {
        return { ok: false, message: 'Usuario no encontrado.' };
      }
      if (isAdminUser(target)) {
        return { ok: false, message: 'No se puede eliminar un usuario administrador.' };
      }
      targetId = target.id;
    }

    const res = await apiRequest(`/api/v1/users/${targetId}`, { method: 'DELETE' });
    return { ok: true, message: res?.message || 'Usuario eliminado correctamente.' };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}
