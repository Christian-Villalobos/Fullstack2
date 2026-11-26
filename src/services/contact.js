import { apiRequest } from './api';

const CONTACT_MESSAGES_KEY = "poe_contact_messages";

export async function getContactMessages() {
  try {
    const data = await apiRequest('/api/v1/contact');
    if (Array.isArray(data)) {
      return data.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        message: m.message,
        status: m.status === 'RESOLVED' ? 'Resuelto' : 'Pendiente',
        createdAt: m.createdAt
      }));
    }
  } catch (error) {
    console.warn('Backend contacto no disponible, leyendo local...', error.message);
  }

  const saved = localStorage.getItem(CONTACT_MESSAGES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

export async function saveContactMessage({ name = '', email = '', subject = '', message = '' }) {
  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanSubject = subject.trim();
  const cleanMessage = message.trim();

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return { ok: false, message: 'Por favor completa todos los campos requeridos.' };
  }

  try {
    const res = await apiRequest('/api/v1/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject || 'Consulta general',
        message: cleanMessage
      })
    });
    return { ok: true, message: '¡Mensaje enviado con éxito al servidor!', data: res };
  } catch (error) {
    console.warn('Backend contact error, guardando local...', error.message);
    const messages = JSON.parse(localStorage.getItem(CONTACT_MESSAGES_KEY) || '[]');
    const newMessage = {
      id: Date.now().toString(),
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject || 'Sin asunto',
      message: cleanMessage,
      status: 'Pendiente',
      createdAt: new Date().toLocaleDateString('es-CL')
    };
    messages.unshift(newMessage);
    localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(messages));
    return { ok: true, message: '¡Mensaje guardado con éxito! Nos comunicaremos contigo.' };
  }
}

export async function toggleMessageStatus(id) {
  const messages = await getContactMessages();
  const target = messages.find(m => m.id === id);
  if (!target) return { ok: false, message: 'Mensaje no encontrado' };

  const newStatus = target.status === 'Pendiente' ? 'RESOLVED' : 'UNREAD';

  try {
    await apiRequest(`/api/v1/contact/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    return { ok: true, messages: await getContactMessages() };
  } catch (error) {
    console.warn('Error cambiando status en backend, usando local...', error.message);
    const local = JSON.parse(localStorage.getItem(CONTACT_MESSAGES_KEY) || '[]');
    const idx = local.findIndex(m => m.id === id);
    if (idx !== -1) {
      local[idx].status = local[idx].status === 'Pendiente' ? 'Resuelto' : 'Pendiente';
      localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(local));
      return { ok: true, messages: local };
    }
  }
  return { ok: false, message: 'No se pudo actualizar el estado' };
}

export async function deleteContactMessage(id) {
  const local = JSON.parse(localStorage.getItem(CONTACT_MESSAGES_KEY) || '[]');
  const filtered = local.filter(m => m.id !== id);
  localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(filtered));
  return { ok: true, messages: filtered };
}
