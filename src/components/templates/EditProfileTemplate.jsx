import { useState } from 'react';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

export function EditProfileTemplate({
  navbar,
  user,
  onUpdateProfile,
  onChangePassword,
  footer
}) {
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    const res = await onUpdateProfile({ name });
    setProfileMsg({ text: res.message, type: res.ok ? 'success' : 'error' });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setPassMsg({ text: 'La nueva contraseña y la confirmación no coinciden.', type: 'error' });
      return;
    }

    const res = await onChangePassword(currentPassword, newPassword);
    setPassMsg({ text: res.message, type: res.ok ? 'success' : 'error' });
    if (res.ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="profile-template">
      {navbar && <div className="nav-container">{navbar}</div>}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Text variant="h1" className="titulo-principal">Configuración de Cuenta</Text>
            <Text variant="p" className="subtitulo">Modifica tus datos personales y gestiona tu contraseña</Text>
          </div>
          <Button
            className="btn-white text-sm"
            onClick={() => { window.location.hash = '#perfil'; }}
          >
            ← Volver al Perfil
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bloque 1: Modificar Información Personal */}
          <div className="bg-[#181614] border border-[#a37938]/40 p-6 rounded-lg shadow-lg">
            <Text variant="h2" className="text-xl text-[#f3caa1] font-bold mb-4">
              👤 Datos del Perfil
            </Text>

            {profileMsg.text && (
              <div className={`p-3 mb-4 rounded text-sm ${profileMsg.type === 'success' ? 'bg-green-900/60 text-green-200 border border-green-600' : 'bg-red-900/60 text-red-200 border border-red-600'}`}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-[#ceaa7b] mb-1">Nombre / IGN</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre o IGN"
                  required
                  className="w-full bg-[#100e0d] border border-[#524434] text-white p-2 rounded focus:border-[#a37938] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-[#ceaa7b] mb-1">Correo Electrónico (Registrado)</label>
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-[#100e0d]/50 border border-[#524434] text-gray-400 p-2 rounded cursor-not-allowed outline-none"
                />
              </div>

              <Button type="submit" className="btn-gold mt-2">
                Guardar Cambios
              </Button>
            </form>
          </div>

          {/* Bloque 2: Cambiar Contraseña */}
          <div className="bg-[#181614] border border-[#a37938]/40 p-6 rounded-lg shadow-lg">
            <Text variant="h2" className="text-xl text-[#f3caa1] font-bold mb-4">
              🔒 Seguridad & Contraseña
            </Text>

            {passMsg.text && (
              <div className={`p-3 mb-4 rounded text-sm ${passMsg.type === 'success' ? 'bg-green-900/60 text-green-200 border border-green-600' : 'bg-red-900/60 text-red-200 border border-red-600'}`}>
                {passMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-[#ceaa7b] mb-1">Contraseña Actual</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#100e0d] border border-[#524434] text-white p-2 rounded focus:border-[#a37938] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-[#ceaa7b] mb-1">Nueva Contraseña</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#100e0d] border border-[#524434] text-white p-2 rounded focus:border-[#a37938] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-[#ceaa7b] mb-1">Confirmar Nueva Contraseña</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#100e0d] border border-[#524434] text-white p-2 rounded focus:border-[#a37938] outline-none"
                />
              </div>

              <Button type="submit" className="btn-gold mt-2">
                Actualizar Contraseña
              </Button>
            </form>
          </div>
        </div>
      </div>

      {footer && <div className="footer-container">{footer}</div>}
    </div>
  );
}
