import { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ShopPage } from './pages/ShopPage';
import { CartPage } from './pages/CartPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ManageProductsPage } from './pages/ManageProductsPage';
import { getCurrentUser, logoutUser, isAdminUser } from './services/auth';
import {
  getCart,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCartRemote,
} from './services/cart';
import { checkoutOrder } from './services/orders';
import { IMAGES } from './constants/images';

// Estilos globales y modulares
import './styles/global.css';
import './styles/atoms/Button.css';
import './styles/organisms/Navbar.css';
import './styles/templates/HomeTemplate.css';
import './styles/templates/AboutTemplate.css';
import './styles/templates/ContactTemplate.css';
import './styles/templates/LegalTemplate.css';
import './styles/templates/CartTemplate.css';
import './styles/templates/ProfileTemplate.css';
import './styles/molecules/TextImage.css';
import './styles/molecules/TextsImages.css';
import './styles/molecules/ImageCards.css';
import './styles/molecules/CartItem.css';
import './styles/organisms/Footer.css';
import './styles/organisms/CartList.css';
import './styles/molecules/ProductCard.css';
import './styles/organisms/ProductList.css';
import './styles/organisms/Formulario.css';
import './styles/organisms/ProfileCard.css';
import './styles/organisms/UserList.css';

function App() {
  // ── Sesión ──
  const [currentUser, setCurrentUser] = useState(getCurrentUser);

  // ── Estado del carrito (sincronizado con Backend) ──
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!currentUser?.id) return;

    let isMounted = true;
    getCart(currentUser.id).then((items) => {
      if (isMounted) setCart(items);
    });
    return () => { isMounted = false; };
  }, [currentUser?.id]);

  const activeCart = currentUser?.id ? cart : [];

  const addToCart = async (product) => {
    if (!currentUser?.id) {
      alert('Debes iniciar sesión para comprar.');
      window.location.hash = '#login';
      return;
    }

    const res = await addCartItem(currentUser.id, product.id, 1);
    if (res.ok) {
      setCart(res.items);
    } else {
      alert(res.message);
    }
  };

  const removeFromCart = async (name) => {
    if (!currentUser?.id) return;
    const target = cart.find((item) => item.name === name);
    if (!target || !target.itemId) return;

    const res =
      target.qty <= 1
        ? await removeCartItem(currentUser.id, target.itemId)
        : await updateCartItemQuantity(currentUser.id, target.itemId, target.qty - 1);

    if (res.ok) {
      setCart(res.items);
    } else {
      alert(res.message);
    }
  };

  const clearCart = async () => {
    if (!currentUser?.id) {
      setCart([]);
      return;
    }

    const res = await clearCartRemote(currentUser.id);
    if (res.ok) {
      setCart(res.items);
    } else {
      alert(res.message);
    }
  };

  const handleCheckout = async () => {
    if (!currentUser?.id) {
      alert('Debes iniciar sesión para finalizar la compra.');
      window.location.hash = '#login';
      return;
    }

    if (cart.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    const res = await checkoutOrder(currentUser);
    alert(res.message);

    if (res.ok) {
      setCart([]);
      window.location.hash = '#perfil'; // Llevar al perfil para ver la orden creada
    }
  };

  const cartCount = activeCart.reduce((sum, item) => sum + item.qty, 0);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCart([]);
    window.location.hash = '#inicio';
  };

  // ── Navegación por hash ──
  const getPageFromHash = () => {
    const rawHash = window.location.hash || '';
    let hash;
    try {
      hash = decodeURIComponent(rawHash).toLowerCase().trim();
    } catch {
      hash = rawHash.toLowerCase().trim();
    }

    if (hash === '#inicio') return 'home';
    if (hash === '#quienes-somos') return 'about';
    if (hash === '#tienda') return 'shop';
    if (hash === '#carrito') return 'cart';
    if (hash === '#contacto') return 'contact';
    if (hash === '#privacidad') return 'privacy';
    if (hash === '#terminos') return 'terms';
    if (hash === '#registro') return 'register';
    if (hash === '#login') return 'login';
    if (hash === '#perfil') return 'profile';
    if (hash === '#editar-perfil') return 'edit-profile';
    if (hash === '#admin-productos') return 'manage-products';

    if (
      hash === '#recuperar-contrasena' ||
      hash === '#recuperar-contraseña' ||
      hash.includes('recuperar') ||
      hash.includes('olvido')
    ) {
      return 'forgot-password';
    }

    return 'home';
  };

  const [currentPage, setCurrentPage] = useState(getPageFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isAdmin = isAdminUser(currentUser);

  const navbarLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Quienes somos', href: '#quienes-somos' },
    { label: 'Tienda', href: '#tienda' },
    { label: cartCount > 0 ? `🛒 Carrito (${cartCount})` : '🛒 Carrito', href: '#carrito' },
  ];

  if (isAdmin) {
    navbarLinks.push({ label: '📦 Gestión Productos', href: '#admin-productos' });
  }

  const navbarData = {
    logo: {
      src: IMAGES.logo,
      alt: 'Logo del sitio',
      className: 'navbar-logo',
    },
    links: navbarLinks,
    buttons: currentUser
      ? [
          { label: 'Mi perfil', onClick: () => { window.location.hash = '#perfil'; }, className: 'btn-gold' },
          { label: 'Cerrar sesión', onClick: handleLogout, className: 'btn-white' },
        ]
      : [
          { label: 'Iniciar sesión', onClick: () => { window.location.hash = '#login'; }, className: 'btn-gold' },
          { label: 'Registrarse', onClick: () => { window.location.hash = '#registro'; }, className: 'btn-white' },
        ],
  };

  const footerData = {
    links: [
      { label: 'Términos y condiciones', href: '#terminos' },
      { label: 'Privacidad', href: '#privacidad' },
      { label: 'Contacto', href: '#contacto' },
    ],
    text: '© 2026 Path of Exile Currency Exchange. Todos los derechos reservados.',
  };

  return (
    <>
      {currentPage === 'home' && <HomePage navbar={navbarData} footer={footerData} />}
      {currentPage === 'about' && <AboutPage navbar={navbarData} footer={footerData} />}
      {currentPage === 'shop' && <ShopPage navbar={navbarData} footer={footerData} onAddToCart={addToCart} />}
      {currentPage === 'cart' && (
        <CartPage
          navbar={navbarData}
          footer={footerData}
          cart={activeCart}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onClear={clearCart}
          onCheckout={handleCheckout}
        />
      )}
      {currentPage === 'contact' && <ContactPage navbar={navbarData} footer={footerData} />}
      {currentPage === 'privacy' && <PrivacyPage navbar={navbarData} footer={footerData} />}
      {currentPage === 'terms' && <TermsPage navbar={navbarData} footer={footerData} />}
      {currentPage === 'register' && <RegisterPage navbar={navbarData} footer={footerData} />}
      {currentPage === 'login' && (
        <LoginPage navbar={navbarData} footer={footerData} onLoginSuccess={(u) => setCurrentUser(u)} />
      )}
      {currentPage === 'profile' && <ProfilePage navbar={navbarData} footer={footerData} />}
      {currentPage === 'edit-profile' && (
        <EditProfilePage navbar={navbarData} footer={footerData} onUserUpdated={(u) => setCurrentUser(u)} />
      )}
      {currentPage === 'forgot-password' && <ForgotPasswordPage navbar={navbarData} footer={footerData} />}
      {currentPage === 'manage-products' && <ManageProductsPage navbar={navbarData} footer={footerData} />}
    </>
  );
}

export default App;