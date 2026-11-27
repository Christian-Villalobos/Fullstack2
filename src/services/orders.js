import { apiRequest } from './api';

// Realizar Checkout (100% API): el backend lee el carrito persistente del usuario
export async function checkoutOrder(user) {
  if (!user || !user.id) {
    return { ok: false, message: 'Debes iniciar sesión para completar la compra.' };
  }

  try {
    const order = await apiRequest(`/api/v1/orders/checkout/${user.id}`, {
      method: 'POST',
    });
    return {
      ok: true,
      message: `¡Orden creada con éxito! Código: ${order.orderNumber}`,
      order,
    };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// Obtener órdenes de un usuario: GET /api/v1/orders/user/{userId}
export async function getUserOrders(user) {
  if (!user || !user.id) return [];

  try {
    const data = await apiRequest(`/api/v1/orders/user/${user.id}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error al obtener órdenes del usuario:', error.message);
    return [];
  }
}

// Obtener todas las órdenes (Admin): GET /api/v1/orders
export async function getAllOrders() {
  try {
    const data = await apiRequest('/api/v1/orders');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error al obtener todas las órdenes:', error.message);
    return [];
  }
}

// Actualizar estado de orden (Admin): PATCH /api/v1/orders/{orderId}/status
export async function updateOrderStatus(orderId, status) {
  if (!orderId || !status) {
    return { ok: false, message: 'Orden o estado inválido.' };
  }

  try {
    const updated = await apiRequest(`/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return { ok: true, order: updated };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}
