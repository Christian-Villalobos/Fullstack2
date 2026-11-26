import { LoginTemplate } from '../components/templates/LoginTemplate';
import { loginUser } from '../services/auth';

const textos = [
    { variant: "h1", content: "Iniciar sesión", className: "titulo-principal" }
];

export function LoginPage({ navbar, footer, onLoginSuccess }) {
    const loginForm = {
        fields: [
            { label: "Email", type: "email", name: "email" },
            { label: "Contraseña", type: "password", name: "password" }
        ],
        buttonText: "Iniciar sesión",
        onSubmit: async (data) => {
            const result = await loginUser(data);

            if (result && result.ok && result.user) {
                alert('¡Bienvenido ' + result.user.name + '!');
                if (onLoginSuccess) onLoginSuccess(result.user);
                window.location.hash = '#perfil';
            } else {
                alert(result?.message || 'Correo o contraseña incorrectos.');
            }
        }
    };

    return (
        <LoginTemplate
            navbar={navbar}
            texts={textos}
            form={loginForm}
            footer={footer}
        />
    );
}
