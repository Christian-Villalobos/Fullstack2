import { apiRequest } from './api';
import { IMAGES } from '../constants/images';

function mapCartResponse(data) {
  if (!data || !Array.isArray(data.items)) return [];

  return data.items.map((item) => ({
    id: item.productId,
    itemId: item.id,
    name: item.productName,
    price: `$${Number(item.unitPrice).toFixed(2)} USD`,
    numericPrice: Number(item.unitPrice),
    qty: item.quantity,
    subtotal: Number(item.subtotal),
    src: item.imageUrl || IMAGES.divine,
    alt: item.productName,
  }));
}

// Obtener carrito del usuario (100% API)
export async function getCart(userId) {
  if (!userId) return [];

  try {
    const data = await apiRequest(`/api/v1/cart/${userId}`);
    return mapCartResponse(data);
  } catch (error) {
    console.error('Error al obtener carrito:', error.message);
    return [];
  }
}

// Agregar producto al carrito (100% API)
export async function addCartItem(userId, productId, quantity = 1) {
  if (!userId || !productId) {
    return { ok: false, message: 'Usuario o producto inválido.' };
  }

  try {
    const data = await apiRequest(`/api/v1/cart/${userId}/items`, {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    return { ok: true, items: mapCartResponse(data) };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// Actualizar cantidad de un ítem del carrito (si quantity <= 0 el backend lo elimina)
export async function updateCartItemQuantity(userId, itemId, quantity) {
  if (!userId || !itemId) {
    return { ok: false, message: 'Usuario o ítem inválido.' };
  }

  try {
    const data = await apiRequest(`/api/v1/cart/${userId}/items/${itemId}?quantity=${quantity}`, {
      method: 'PATCH',
    });
    return { ok: true, items: mapCartResponse(data) };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// Quitar un ítem específico del carrito
export async function removeCartItem(userId, itemId) {
  if (!userId || !itemId) {
    return { ok: false, message: 'Usuario o ítem inválido.' };
  }

  try {
    const data = await apiRequest(`/api/v1/cart/${userId}/items/${itemId}`, {
      method: 'DELETE',
    });
    return { ok: true, items: mapCartResponse(data) };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// Vaciar carrito completo (100% API)
export async function clearCartRemote(userId) {
  if (!userId) {
    return { ok: false, message: 'Usuario inválido.' };
  }

  try {
    const data = await apiRequest(`/api/v1/cart/${userId}`, {
      method: 'DELETE',
    });
    return { ok: true, items: mapCartResponse(data) };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}
