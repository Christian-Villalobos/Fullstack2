import { apiRequest } from './api';

const CART_KEY = "poe_cart";

// Devuelve el carrito guardado localmente
export function getLocalCart() {
  const saved = localStorage.getItem(CART_KEY);
  return saved ? JSON.parse(saved) : [];
}

// Guarda el carrito localmente
export function saveLocalCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Obtener carrito del usuario (Backend con fallback a local)
export async function getCart(userId) {
  if (userId) {
    try {
      const data = await apiRequest(`/api/v1/cart/${userId}`);
      if (data && Array.isArray(data.items)) {
        const mapped = data.items.map(item => ({
          id: item.productId,
          itemId: item.id,
          name: item.productName,
          price: `$${item.unitPrice.toFixed(2)} USD`,
          qty: item.quantity,
          src: item.imageUrl || '/images/divine.webp',
          alt: item.productName
        }));
        saveLocalCart(mapped);
        return mapped;
      }
    } catch (error) {
      console.warn('Backend cart inaccesible, usando local...', error.message);
    }
  }
  return getLocalCart();
}

// Sincronizar item agregado al carrito
export async function syncAddToCart(userId, product, quantity = 1) {
  if (userId && product.id) {
    try {
      await apiRequest(`/api/v1/cart/${userId}/items`, {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        })
      });
    } catch (error) {
      console.warn('Backend syncAddToCart falló...', error.message);
    }
  }
}

// Vaciar carrito
export async function syncClearCart(userId) {
  if (userId) {
    try {
      await apiRequest(`/api/v1/cart/${userId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('Backend syncClearCart falló...', error.message);
    }
  }
  saveLocalCart([]);
}
