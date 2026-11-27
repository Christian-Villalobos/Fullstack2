import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfilePage } from '../../pages/ProfilePage';
import { api } from '../../services/api';

describe('ProfilePage', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('un usuario normal ve su perfil pero no la lista de usuarios', async () => {
    localStorage.setItem('poe_current_user', JSON.stringify({ id: 2, name: 'Ana', email: 'ana@mail.com', role: 'ROLE_USER' }));
    spyOn(api, 'request').and.resolveTo({ data: [] });

    render(<ProfilePage navbar={{}} />);

    await waitFor(() => {
      expect(screen.getByText('Mi Perfil')).toBeTruthy();
    });
    expect(screen.queryByText(/Usuarios registrados/)).toBeNull();
  });

  it('el administrador ve el panel y puede eliminar usuarios', async () => {
    localStorage.setItem('poe_current_user', JSON.stringify({ id: 1, name: 'Admin', email: 'admin@poe.com', role: 'ROLE_ADMIN' }));
    const initialUsers = [
      { id: 1, name: 'Admin', email: 'admin@poe.com', role: 'ROLE_ADMIN' },
      { id: 2, name: 'Ana', email: 'ana@mail.com', role: 'ROLE_USER' },
    ];
    let usersList = [...initialUsers];

    spyOn(api, 'request').and.callFake(async ({ url, method }) => {
      if (url === '/api/v1/users' && (!method || method === 'GET')) return { data: usersList };
      if (url === '/api/v1/users/2' && method === 'DELETE') {
        usersList = usersList.filter((u) => u.id !== 2);
        return { data: { message: 'Usuario eliminado correctamente' } };
      }
      return { data: [] };
    });
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    render(<ProfilePage navbar={{}} />);

    await waitFor(() => {
      expect(screen.getByText('Panel de Administrador')).toBeTruthy();
      expect(screen.getByText('Usuarios registrados (2)')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => {
      expect(screen.getByText('Usuarios registrados (1)')).toBeTruthy();
    });
  });

  it('no elimina nada si el administrador cancela la confirmación', async () => {
    localStorage.setItem('poe_current_user', JSON.stringify({ id: 1, name: 'Admin', email: 'admin@poe.com', role: 'ROLE_ADMIN' }));
    const spy = spyOn(api, 'request').and.callFake(async ({ url }) => {
      if (url === '/api/v1/users') {
        return {
          data: [
            { id: 1, name: 'Admin', email: 'admin@poe.com', role: 'ROLE_ADMIN' },
            { id: 2, name: 'Ana', email: 'ana@mail.com', role: 'ROLE_USER' },
          ],
        };
      }
      return { data: [] };
    });
    spyOn(window, 'confirm').and.returnValue(false);

    render(<ProfilePage navbar={{}} />);
    await waitFor(() => {
      expect(screen.getByText('Usuarios registrados (2)')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(spy).not.toHaveBeenCalledWith(jasmine.objectContaining({ method: 'DELETE' }));
  });

  it('sin sesión redirige al login y no muestra nada', () => {
    const { container } = render(<ProfilePage navbar={{}} />);
    expect(container.innerHTML).toBe('');
    expect(window.location.hash).toBe('#login');
  });
});
