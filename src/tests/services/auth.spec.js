import { api } from '../../services/api';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  changePassword,
  resetPassword,
  updateProfile,
  fetchUsers,
  deleteUser,
  isAdminUser,
} from '../../services/auth';

describe('auth service (Full API)', () => {
  beforeEach(() => localStorage.clear());

  it('registra un usuario nuevo vía API', async () => {
    const mockUser = { id: 2, name: 'Ana', email: 'ana@mail.com', role: 'ROLE_USER' };
    const spy = spyOn(api, 'request').and.resolveTo({ data: mockUser });

    const result = await registerUser({ name: 'Ana', email: 'ANA@mail.com', password: '1234' });
    expect(result.ok).toBeTrue();
    expect(result.user).toEqual(mockUser);
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
      url: '/api/v1/auth/register',
      method: 'POST',
    }));
  });

  it('rechaza campos vacíos sin llamar a la API', async () => {
    const spy = spyOn(api, 'request');
    const result = await registerUser({ name: '   ', email: '', password: '' });
    expect(result.ok).toBeFalse();
    expect(spy).not.toHaveBeenCalled();
  });

  it('login correcto guarda la sesión y logout la borra', async () => {
    const admin = { id: 1, name: 'Administrador', email: 'admin@poe.com', role: 'ROLE_ADMIN' };
    spyOn(api, 'request').and.resolveTo({ data: admin });

    const res = await loginUser({ email: 'ADMIN@POE.COM', password: 'admin123' });
    expect(res.ok).toBeTrue();
    expect(res.user.name).toBe('Administrador');
    expect(getCurrentUser().email).toBe('admin@poe.com');
    expect(isAdminUser(getCurrentUser())).toBeTrue();

    logoutUser();
    expect(getCurrentUser()).toBeNull();
  });

  it('login fallido devuelve ok: false y no guarda la sesión', async () => {
    spyOn(api, 'request').and.rejectWith(new Error('Credenciales inválidas'));

    const res = await loginUser({ email: 'admin@poe.com', password: 'mal' });
    expect(res.ok).toBeFalse();
    expect(res.message).toBe('Credenciales inválidas');
    expect(getCurrentUser()).toBeNull();
  });

  it('permite cambiar y restablecer contraseña vía API', async () => {
    const spy = spyOn(api, 'request').and.resolveTo({ data: { message: 'OK' } });

    const changeRes = await changePassword({ id: 1 }, 'admin123', 'nueva1234');
    expect(changeRes.ok).toBeTrue();

    const resetRes = await resetPassword('admin@poe.com', 'reset1234');
    expect(resetRes.ok).toBeTrue();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('actualiza el perfil y sincroniza la sesión local', async () => {
    localStorage.setItem('poe_current_user', JSON.stringify({ id: 1, name: 'Viejo', role: 'ROLE_USER' }));
    spyOn(api, 'request').and.resolveTo({ data: { id: 1, name: 'Nuevo', role: 'ROLE_USER' } });

    const res = await updateProfile({ id: 1 }, { name: 'Nuevo' });
    expect(res.ok).toBeTrue();
    expect(getCurrentUser().name).toBe('Nuevo');
  });

  it('lista y elimina usuarios vía API', async () => {
    const spy = spyOn(api, 'request').and.returnValues(
      Promise.resolve({ data: [{ id: 2, name: 'Ana', email: 'ana@mail.com', role: 'ROLE_USER' }] }),
      Promise.resolve({ data: { message: 'Usuario eliminado correctamente' } })
    );

    const list = await fetchUsers();
    expect(list.length).toBe(1);

    const del = await deleteUser(2);
    expect(del.ok).toBeTrue();
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
      url: '/api/v1/users/2',
      method: 'DELETE',
    }));
  });
});
