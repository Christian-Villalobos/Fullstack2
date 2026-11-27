import { apiRequest } from './api';

const NEXT_STATUS = {
  UNREAD: 'IN_REVIEW',
  IN_REVIEW: 'RESOLVED',
  RESOLVED: 'UNREAD',
};

// Listar mensajes de contacto (Admin - 100% API, con filtro opcional por status)
export async function getContactMessages(status) {
  try {
    const params = status ? { status } : undefined;
    const data = await apiRequest('/api/v1/contact', { params });
    if (!Array.isArray(data)) return [];

    return data.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      status: m.status || 'UNREAD',
      createdAt: m.createdAt ? new Date(m.createdAt).toLocaleDateString('es-CL') : '',
    }));
  } catch (error) {
    console.error('Error al obtener mensajes de contacto:', error.message);
    return [];
  }
}

// Enviar mensaje de contacto (100% API)
export async function saveContactMessage({ name = '', email = '', subject = '', message = '' }) {
  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanSubject = subject.trim();
  const cleanMessage = message.trim();

  if (cleanName.length < 2 || !cleanEmail || cleanSubject.length < 3 || cleanMessage.length < 10) {
    return {
      ok: false,
      message: 'Completa todos los campos (nombre mín. 2, asunto mín. 3 y mensaje mín. 10 caracteres).',
    };
  }

  try {
    const res = await apiRequest('/api/v1/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
      }),
    });
    return { ok: true, message: '¡Mensaje enviado con éxito al servidor!', data: res };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// Rotar estado del mensaje (UNREAD -> IN_REVIEW -> RESOLVED -> UNREAD)
export async function toggleMessageStatus(id) {
  if (!id) return { ok: false, message: 'ID de mensaje inválido.' };

  try {
    const messages = await getContactMessages();
    const target = messages.find((m) => m.id === id);
    if (!target) return { ok: false, message: 'Mensaje no encontrado.' };

    const newStatus = NEXT_STATUS[target.status] || 'IN_REVIEW';

    await apiRequest(`/api/v1/contact/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    return { ok: true, messages: await getContactMessages() };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// Eliminar mensaje de contacto (Admin - 100% API)
export async function deleteContactMessage(id) {
  if (!id) return { ok: false, message: 'ID de mensaje inválido.' };

  try {
    await apiRequest(`/api/v1/contact/${id}`, { method: 'DELETE' });
    return { ok: true, messages: await getContactMessages() };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}
