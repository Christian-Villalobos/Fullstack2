import {
  getUsers,
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  deleteUser,
  updateProfile,
  changePassword,
  resetPassword
} from '../../services/auth';

describe('auth service', () => {
  beforeEach(() => localStorage.clear());

  it('crea el administrador por defecto', () => {
    const users = getUsers();
    expect(users.length).toBe(1);
    expect(users[0].role).toBe('admin');
  });

  it('los usuarios quedan guardados entre llamadas', () => {
    registerUser({ name: 'Ana', email: 'ana@mail.com', password: '123' });
    expect(getUsers().length).toBe(2);
    expect(getUsers().length).toBe(2);
  });

  it('registra un usuario nuevo con rol "user"', () => {
    const result = registerUser({ name: 'Ana', email: 'ANA@mail.com', password: '123' });
    expect(result.ok).toBeTrue();
    expect(getUsers().find(u => u.email === 'ana@mail.com').role).toBe('user');
  });

  it('rechaza campos vacíos', () => {
    expect(registerUser({ name: '', email: '', password: '' }).ok).toBeFalse();
  });

  it('rechaza un nombre formado solo por espacios', () => {
    expect(registerUser({ name: '   ', email: 'a@b.com', password: '123' }).ok).toBeFalse();
  });

  it('rechaza correos duplicados', () => {
    registerUser({ name: 'Ana', email: 'ana@mail.com', password: '123' });
    const result = registerUser({ name: 'Otra', email: 'ana@mail.com', password: '456' });
    expect(result.ok).toBeFalse();
  });

  it('login correcto guarda la sesión y logout la borra', () => {
    const user = loginUser({ email: 'admin@poe.com', password: 'admin123' });
    expect(user.name).toBe('Administrador');
    expect(getCurrentUser().email).toBe('admin@poe.com');

    logoutUser();
    expect(getCurrentUser()).toBeNull();
  });

  it('login fallido devuelve null y no guarda la sesión', () => {
    expect(loginUser({ email: 'admin@poe.com', password: 'mal' })).toBeNull();
    expect(getCurrentUser()).toBeNull();
  });

  it('el login no es sensible a mayúsculas en el correo', () => {
    expect(loginUser({ email: 'ADMIN@POE.COM', password: 'admin123' })).not.toBeNull();
  });

  it('permite cambiar la contraseña con la contraseña actual correcta', () => {
    const res = changePassword('admin@poe.com', 'admin123', 'nueva1234');
    expect(res.ok).toBeTrue();
    expect(loginUser({ email: 'admin@poe.com', password: 'nueva1234' })).not.toBeNull();
  });

  it('permite restablecer la contraseña olvidada con resetPassword', () => {
    const res = resetPassword('admin@poe.com', 'reset1234');
    expect(res.ok).toBeTrue();
    expect(loginUser({ email: 'admin@poe.com', password: 'reset1234' })).not.toBeNull();
  });

  it('rechaza restablecer contraseña si el correo no existe', () => {
    const res = resetPassword('fantasma@poe.com', 'reset1234');
    expect(res.ok).toBeFalse();
  });
});
