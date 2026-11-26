import { ContactTemplate } from '../components/templates/ContactTemplate';
import { saveContactMessage } from '../services/contact';

const contactTitles = [
  { variant: "h1", content: "Contacto y Soporte", className: "titulo-principal" },
  { variant: "p", content: "¿Tienes dudas sobre un intercambio, una entrega o problemas con tu cuenta? Déjanos un mensaje.", className: "subtitulo" }
];

const contactCards = [
  {
    src: '/images/poe2-soldier.webp',
    alt: 'Soporte 24/7',
    title: 'Soporte 24/7',
    description: 'Atención personalizada para que tus orbes lleguen a salvo y a tiempo a tu alijo.'
  },
  {
    src: '/images/Path-of-Exile-Logo.webp',
    alt: 'Comunidad Oficial',
    title: 'Comunidad Oficial',
    description: 'Únete a nuestra comunidad para verificar cotizaciones y reputación en tiempo real.'
  }
];

export function ContactPage({ navbar, footer }) {
  const contactForm = {
    fields: [
      { label: "Nombre o IGN (In-Game Name)", type: "text", name: "name", placeholder: "Ej. Marauder99" },
      { label: "Correo electrónico", type: "email", name: "email", placeholder: "tu@correo.com" },
      { label: "Asunto", type: "text", name: "subject", placeholder: "¿En qué podemos ayudarte?" },
      { label: "Mensaje", type: "text", name: "message", placeholder: "Describe los detalles de tu consulta u orden..." }
    ],
    buttonText: "Enviar Mensaje",
    onSubmit: async (data) => {
      if ((data.subject?.trim() || '').length < 3) {
        alert('El asunto debe tener al menos 3 caracteres.');
        return;
      }
      if ((data.message?.trim() || '').length < 10) {
        alert('El mensaje debe tener al menos 10 caracteres.');
        return;
      }
      const res = await saveContactMessage(data);
      alert(res.message);
    }
  };

  return (
    <ContactTemplate
      navbar={navbar}
      titles={contactTitles}
      contactCards={contactCards}
      form={contactForm}
      footer={footer}
    />
  );
}
