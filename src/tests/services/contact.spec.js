import {
  getContactMessages,
  saveContactMessage,
  toggleMessageStatus,
  deleteContactMessage
} from '../../services/contact';

describe('Contact Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe iniciar con lista vacía de mensajes', () => {
    expect(getContactMessages()).toEqual([]);
  });

  it('debe guardar un mensaje de contacto', () => {
    const res = saveContactMessage({
      name: 'Exiliado',
      email: 'exil@poe.com',
      subject: 'Duda con orden',
      message: '¿Cuándo entregan mis Divine Orbs?'
    });

    expect(res.ok).toBeTrue();
    const list = getContactMessages();
    expect(list.length).toBe(1);
    expect(list[0].name).toBe('Exiliado');
    expect(list[0].status).toBe('Pendiente');
  });

  it('debe cambiar el estado de un mensaje a Resuelto', () => {
    saveContactMessage({
      name: 'Exiliado',
      email: 'exil@poe.com',
      message: 'Mensaje'
    });

    const [firstMsg] = getContactMessages();
    const res = toggleMessageStatus(firstMsg.id);

    expect(res.ok).toBeTrue();
    expect(getContactMessages()[0].status).toBe('Resuelto');
  });

  it('debe eliminar un mensaje de contacto', () => {
    saveContactMessage({
      name: 'Exiliado',
      email: 'exil@poe.com',
      message: 'Mensaje a borrar'
    });

    const [firstMsg] = getContactMessages();
    const res = deleteContactMessage(firstMsg.id);

    expect(res.ok).toBeTrue();
    expect(getContactMessages().length).toBe(0);
  });
});
