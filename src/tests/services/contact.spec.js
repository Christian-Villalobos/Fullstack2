import { api } from '../../services/api';
import {
  getContactMessages,
  saveContactMessage,
  toggleMessageStatus,
  deleteContactMessage,
} from '../../services/contact';

describe('Contact Service (Full API)', () => {
  it('obtiene mensajes mapeados desde el backend', async () => {
    spyOn(api, 'request').and.resolveTo({
      data: [{
        id: 1,
        name: 'Exiliado',
        email: 'exil@poe.com',
        subject: 'Duda',
        message: '¿Cuándo entregan mis Divine Orbs?',
        status: 'UNREAD',
        createdAt: '2026-11-24T23:50:00',
      }],
    });

    const list = await getContactMessages();
    expect(list.length).toBe(1);
    expect(list[0].status).toBe('UNREAD');
  });

  it('envía un mensaje válido y rechaza campos cortos', async () => {
    const spy = spyOn(api, 'request').and.resolveTo({ data: { id: 1 } });

    const invalid = await saveContactMessage({ name: 'A', email: 'a@b.com', subject: 'Hi', message: 'Corto' });
    expect(invalid.ok).toBeFalse();
    expect(spy).not.toHaveBeenCalled();

    const valid = await saveContactMessage({
      name: 'Exiliado',
      email: 'exil@poe.com',
      subject: 'Duda con orden',
      message: '¿Cuándo entregan mis Divine Orbs?',
    });
    expect(valid.ok).toBeTrue();
  });

  it('cambia el estado de UNREAD a IN_REVIEW y elimina mensajes', async () => {
    const spy = spyOn(api, 'request').and.returnValues(
      Promise.resolve({ data: [{ id: 1, status: 'UNREAD' }] }),
      Promise.resolve({ data: { id: 1, status: 'IN_REVIEW' } }),
      Promise.resolve({ data: [{ id: 1, status: 'IN_REVIEW' }] }),
      Promise.resolve({ data: { message: 'Eliminado' } }),
      Promise.resolve({ data: [] })
    );

    const toggled = await toggleMessageStatus(1);
    expect(toggled.ok).toBeTrue();
    expect(toggled.messages[0].status).toBe('IN_REVIEW');

    const deleted = await deleteContactMessage(1);
    expect(deleted.ok).toBeTrue();
    expect(deleted.messages.length).toBe(0);
    expect(spy).toHaveBeenCalledTimes(5);
  });
});
