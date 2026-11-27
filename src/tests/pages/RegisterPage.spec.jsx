import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterPage } from '../../pages/RegisterPage';
import { api } from '../../services/api';

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  function llenarFormulario(nombre, email, password) {
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: nombre } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));
  }

  it('registra al usuario vía API y redirige al login', async () => {
    spyOn(api, 'request').and.resolveTo({ data: { id: 2, name: 'Ana', email: 'ana@mail.com', role: 'ROLE_USER' } });
    spyOn(window, 'alert');
    render(<RegisterPage navbar={{}} />);

    llenarFormulario('Ana', 'ana@mail.com', '1234');

    await waitFor(() => {
      expect(window.location.hash).toBe('#login');
    });
  });

  it('no redirige si el correo ya está registrado', async () => {
    spyOn(api, 'request').and.rejectWith(new Error('El correo ya está registrado.'));
    spyOn(window, 'alert');
    render(<RegisterPage navbar={{}} />);
    llenarFormulario('Ana', 'admin@poe.com', '1234');

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('El correo ya está registrado.');
    });
    expect(window.location.hash).not.toBe('#login');
  });
});
