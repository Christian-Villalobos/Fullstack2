import { ForgotPasswordTemplate } from '../components/templates/ForgotPasswordTemplate';
import { resetPassword } from '../services/auth';

export function ForgotPasswordPage({ navbar, footer }) {
  const handleResetPassword = async ({ email, newPassword }) => {
    return await resetPassword(email, newPassword);
  };

  return (
    <ForgotPasswordTemplate
      navbar={navbar}
      onSubmit={handleResetPassword}
      footer={footer}
    />
  );
}
