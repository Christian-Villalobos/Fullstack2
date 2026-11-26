const CART_KEY = 'poe_cart';

// El carrito vive solo en el navegador; el backend lo crea al hacer checkout
export function getLocalCart() {
  const saved = localStorage.getItem(CART_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveLocalCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}