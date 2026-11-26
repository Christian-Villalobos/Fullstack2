import { useState } from 'react';
import { Navbar } from '../organisms/Navbar';
import { Footer } from '../organisms/Footer';
import { Texts } from '../molecules/Texts';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';

export function ForgotPasswordTemplate({ navbar, onSubmit, footer }) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setMsg({ text: 'Las nuevas contraseñas no coinciden.', type: 'error' });
      return;
    }

    const res = await onSubmit({ email, newPassword });
    setMsg({ text: res.message, type: res.ok ? 'success' : 'error' });

    if (res.ok) {
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        window.location.hash = '#login';
      }, 1500);
    }
  };

  return (
    <div className="login">
      {navbar && <Navbar {...navbar} />}

      <Texts
        texts={[
          { variant: 'h1', content: 'Recuperar Contraseña', className: 'titulo-principal' },
          { variant: 'p', content: 'Ingresa tu correo y define una nueva contraseña', className: 'subtitulo' },
        ]}
      />

      <form onSubmit={handleSubmit} className="form">
        {msg.text && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              backgroundColor: msg.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: msg.type === 'success' ? '#4ade80' : '#f87171',
              border: `1px solid ${msg.type === 'success' ? '#22c55e' : '#ef4444'}`,
            }}
          >
            {msg.text}
          </div>
        )}

        <FormField
          label="Correo registrado"
          type="email"
          name="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <FormField
          label="Nueva Contraseña"
          type="password"
          name="newPassword"
          placeholder="Mínimo 6 caracteres"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <FormField
          label="Confirmar Nueva Contraseña"
          type="password"
          name="confirmPassword"
          placeholder="Repite la contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button className="btn-gold" type="submit">
          Restablecer Contraseña
        </Button>

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <a
            href="#login"
            style={{
              color: '#d6a85f',
              fontSize: '0.85rem',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            ← Volver a Iniciar Sesión
          </a>
        </div>
      </form>

      {footer && <Footer {...footer} />}
    </div>
  );
}