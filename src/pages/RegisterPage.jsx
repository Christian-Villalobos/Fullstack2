import { RegisterTemplate } from "../components/templates/RegisterTemplate";
import { registerUser } from "../services/auth";

const textos = [
    { variant: "h1", content: "Registro", className: "titulo-principal" },
    { variant: "p", content: "Compra y vende los mejores orbes y objetos de Path of Exile con entrega inmediata", className: "subtitulo" }
];

const registerForm = {
    fields: [
        { label: "Nombre", type: "text", name: "name" },
        { label: "Email", type: "email", name: "email" },
        { label: "Contraseña", type: "password", name: "password" }
    ],
    buttonText: "Registrarse",
    onSubmit: async (data) => {
        const result = await registerUser(data);
        alert(result.message);

        if (result.ok) {
            window.location.hash = '#login';
        }
    }
};

export function RegisterPage({ navbar, footer }) {
    return (
        <RegisterTemplate
            navbar={navbar}
            texts={textos}
            form={registerForm}
            footer={footer}
        />
    );
}
