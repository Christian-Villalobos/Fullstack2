import { Formulario } from '../organisms/Formulario'
import { Navbar } from '../organisms/Navbar'
import { Footer } from '../organisms/Footer'
import { Texts } from '../molecules/Texts'

export function LoginTemplate({ navbar, texts, form, footer }) {
    return (
        <div className="login">
            <Navbar {...navbar} />
            <Texts texts={texts} />
            <Formulario {...form}>
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <a
                        href="#recuperar-contrasena"
                        style={{
                            color: '#d6a85f',
                            fontSize: '0.85rem',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                        }}
                    >
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>
            </Formulario>
            {footer && <Footer {...footer} />}
        </div>
    );
}
