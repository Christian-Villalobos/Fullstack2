import { apiRequest } from './api';

const USERS_KEY = "poe_users";
const CURRENT_USER_KEY = "poe_current_user";

// Fallback por defecto si no hay conexión
const defaultUsers = [
  { id: 1, name: "Administrador", email: "admin@poe.com", password: "admin123", role: "ROLE_ADMIN" }
];

export function getUsers() {
  const saved = localStorage.getItem(USERS_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  const initial = defaultUsers.map(user => ({ ...user }));
  localStorage.setItem(USERS_KEY, JSON.stringify(initial));
  return initial;
}

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

// Iniciar sesión (con Backend y fallback solo si no hay conexión)
export async function loginUser({ email = '', password = '' }) {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const user = await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail, password })
    });
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return { ok: true, user };
    }
    return { ok: false, message: 'Correo o contraseña incorrectos.' };
  } catch (error) {
    // El backend respondió 4xx: credenciales inválidas, NO hay fallback
    if (error.status && error.status < 500) {
      return { ok: false, message: error.message || 'Correo o contraseña incorrectos.' };
    }
    // Sin red o 5xx: fallback local
    console.warn('Backend offline, usando fallback local...', error.message);
    const localUser = getUsers().find(u => u.email === cleanEmail && u.password === password);
    if (localUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(localUser));
      return { ok: true, user: localUser };
    }
    return { ok: false, message: 'No se pudo conectar con el servidor.' };
  }
}

// Registrar usuario (con Backend y fallback solo si no hay conexión)
export async function registerUser({ name = '', email = '', password = '' }) {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName || !cleanEmail || !password) {
    return { ok: false, message: 'Completa todos los campos.' };
  }

  try {
    const user = await apiRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: cleanName, email: cleanEmail, password })
    });
    return { ok: true, message: '¡Registro exitoso! Ya puedes iniciar sesión.', user };
  } catch (error) {
    // El backend respondió 4xx (ej. correo duplicado): mostrar su mensaje, sin fallback
    if (error.status && error.status < 500) {
      return { ok: false, message: error.message };
    }

    console.warn('Backend register error, trying fallback...', error.message);
    const users = getUsers();
    if (users.some(u => u.email === cleanEmail)) {
      return { ok: false, message: 'El correo ya está registrado.' };
    }
    const newUser = { id: Date.now(), name: cleanName, email: cleanEmail, password, role: 'ROLE_USER' };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { ok: true, message: '¡Registro exitoso! Ahora inicia sesión.' };
  }
}

// Recuperar / Restablecer contraseña
export async function resetPassword(email = '', newPassword = '') {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !newPassword) {
    return { ok: false, message: 'Ingresa tu correo y la nueva contraseña.' };
  }

  try {
    const res = await apiRequest('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail, newPassword })
    });
    return { ok: true, message: res?.message || 'Contraseña restablecida con éxito' };
  } catch (error) {
    // El backend respondió 4xx (ej. correo no existe): mostrar su mensaje, sin fallback
    if (error.status && error.status < 500) {
      return { ok: false, message: error.message };
    }

    console.warn('Backend resetPassword error, trying fallback...', error.message);
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === cleanEmail);
    if (userIndex === -1) {
      return { ok: false, message: 'No existe ninguna cuenta registrada con este correo.' };
    }
    users[userIndex].password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { ok: true, message: '¡Tu contraseña ha sido restablecida exitosamente! Ya puedes iniciar sesión.' };
  }
}

// Cambiar contraseña (Perfil)
export async function changePassword(user, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    return { ok: false, message: 'Debes ingresar tu contraseña actual y la nueva contraseña.' };
  }

  const userId = typeof user === 'object' ? user.id : null;
  const userEmail = typeof user === 'object' ? user.email : user;

  if (userId) {
    try {
      const res = await apiRequest(`/api/v1/users/${userId}/change-password`, {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      return { ok: true, message: res?.message || 'Contraseña actualizada exitosamente.' };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  // Fallback por correo si no hay userId
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === userEmail);
  if (userIndex === -1) return { ok: false, message: 'Usuario no encontrado.' };
  if (users[userIndex].password !== currentPassword) {
    return { ok: false, message: 'La contraseña actual no es correcta.' };
  }
  users[userIndex].password = newPassword;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { ok: true, message: 'Contraseña cambiada exitosamente.' };
}

// Actualizar perfil (nombre)
export async function updateProfile(user, { name = '' }) {
  const cleanName = name.trim();
  if (!cleanName) {
    return { ok: false, message: 'El nombre no puede estar vacío.' };
  }

  const userId = typeof user === 'object' ? user.id : null;

  if (userId) {
    try {
      const updated = await apiRequest(`/api/v1/users/${userId}/profile`, {
        method: 'PUT',
        body: JSON.stringify({ name: cleanName })
      });
      const currentUser = getCurrentUser();
      const newSession = { ...currentUser, ...updated };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newSession));
      return { ok: true, message: 'Perfil actualizado con éxito.', user: newSession };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  // Fallback local
  const currentUser = getCurrentUser();
  if (currentUser) {
    currentUser.name = cleanName;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  }
  return { ok: true, message: 'Perfil actualizado con éxito.' };
}

export async function fetchUsers() {
  try {
    const data = await apiRequest('/api/v1/users');
    if (Array.isArray(data)) {
      return data;
    }
  } catch (error) {
    console.warn('Backend fetchUsers error, usando local...', error.message);
  }
  return getUsers();
}

// Eliminar usuario (Admin)
export async function deleteUser(email) {
  try {
    const users = await fetchUsers();
    const target = users.find(u => u.email === email);
    if (target && target.id && !isAdminUser(target)) {
      await apiRequest(`/api/v1/users/${target.id}`, { method: 'DELETE' });
    }
  } catch (error) {
    console.warn('Backend deleteUser error, usando local...', error.message);
  }

  const users = getUsers();
  const userToDelete = users.find(u => u.email === email);
  if (!userToDelete || isAdminUser(userToDelete)) {
    return { ok: false, message: 'No se puede eliminar este usuario.' };
  }
  const updatedUsers = users.filter(u => u.email !== email);
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  return { ok: true, message: 'Usuario eliminado.' };
}