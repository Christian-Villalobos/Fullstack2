import { useState, useEffect } from 'react';
import { EditProfileTemplate } from '../components/templates/EditProfileTemplate';
import { Navbar } from '../components/organisms/Navbar';
import { Footer } from '../components/organisms/Footer';
import { getCurrentUser, updateProfile, changePassword } from '../services/auth';

export function EditProfilePage({ navbar, footer, onUserUpdated }) {
  const [user, setUser] = useState(getCurrentUser);

  useEffect(() => {
    if (!user) {
      window.location.hash = '#login';
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleUpdateProfile = async ({ name }) => {
    const res = await updateProfile(user, { name });
    if (res.ok) {
      const updated = getCurrentUser();
      setUser(updated);
      if (onUserUpdated) onUserUpdated(updated);
    }
    return res;
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    const res = await changePassword(user, currentPassword, newPassword);
    if (res.ok) {
      const updated = getCurrentUser();
      setUser(updated);
      if (onUserUpdated) onUserUpdated(updated);
    }
    return res;
  };

  return (
    <EditProfileTemplate
      navbar={<Navbar {...navbar} />}
      user={user}
      onUpdateProfile={handleUpdateProfile}
      onChangePassword={handleChangePassword}
      footer={<Footer {...footer} />}
    />
  );
}
