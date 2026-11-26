const CONTACT_MESSAGES_KEY = 'poe_contact_messages';

const readMessages = () => {
  try {
    return JSON.parse(localStorage.getItem(CONTACT_MESSAGES_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeMessages = (messages) =>
  localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(messages));

export async function getContactMessages() {
  return readMessages();
}

export async function saveContactMessage({ name = '', email = '', subject = '', message = '' }) {
  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMessage = message.trim();

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return { ok: false, message: 'Por favor completa todos los campos requeridos.' };
  }

  const messages = readMessages();
  messages.unshift({
    id: Date.now().toString(),
    name: cleanName,
    email: cleanEmail,
    subject: subject.trim() || 'Sin asunto',
    message: cleanMessage,
    status: 'Pendiente',
    createdAt: new Date().toLocaleDateString('es-CL'),
  });
  writeMessages(messages);

  return { ok: true, message: '¡Mensaje guardado con éxito! Nos comunicaremos contigo.' };
}

export async function toggleMessageStatus(id) {
  const messages = readMessages();
  const target = messages.find((m) => m.id === id);
  if (!target) return { ok: false, message: 'Mensaje no encontrado' };

  target.status = target.status === 'Pendiente' ? 'Resuelto' : 'Pendiente';
  writeMessages(messages);
  return { ok: true, messages };
}

export async function deleteContactMessage(id) {
  const filtered = readMessages().filter((m) => m.id !== id);
  writeMessages(filtered);
  return { ok: true, messages: filtered };
}