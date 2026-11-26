import { apiRequest } from './api';

const ORDERS_KEY = 'poe_orders';

// Obtener órdenes locales de respaldo
function getLocalOrders() {
  const saved = localStorage.getItem(ORDERS_KEY);
  return saved ? JSON.parse(saved) : [];
}

// Guardar órdenes locales
function saveLocalOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// Realizar Checkout: POST /api/v1/orders/checkout/{userId}
export async function checkoutOrder(user, cartItems = []) {
  if (!user) {
    return { ok: false, message: 'Debes iniciar sesión para completar la compra.' };
  }

  const userId = user.id;

  if (userId) {
    try {
      const order = await apiRequest(`/api/v1/orders/checkout/${userId}`, {
        method: 'POST'
      });
      return { ok: true, message: `¡Orden creada con éxito! Código: ${order.orderNumber}`, order };
    } catch (error) {
      console.warn('Backend checkout falló, creando orden local...', error.message);
    }
  }

  // Fallback local: Generar orden simulada si el backend no está disponible
  const orderNumber = `ORD-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = typeof item.price === 'number'
      ? item.price
      : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
    return sum + price * (item.qty || 1);
  }, 0);

  const newOrder = {
    id: Date.now(),
    orderNumber,
    userId: user.id || 1,
    userName: user.name,
    userEmail: user.email,
    totalAmount,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    items: cartItems.map(item => ({
      id: Date.now() + Math.random(),
      productId: item.id || 1,
      productName: item.name,
      priceAtPurchase: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0,
      quantity: item.qty || 1,
      subtotal: (typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0) * (item.qty || 1),
      imageUrl: item.src
    }))
  };

  const orders = getLocalOrders();
  orders.unshift(newOrder);
  saveLocalOrders(orders);

  return {
    ok: true,
    message: `¡Orden ${orderNumber} generada exitosamente!`,
    order: newOrder
  };
}

// Obtener órdenes de un usuario: GET /api/v1/orders/user/{userId}
export async function getUserOrders(user) {
  if (!user) return [];

  if (user.id) {
    try {
      const data = await apiRequest(`/api/v1/orders/user/${user.id}`);
      if (Array.isArray(data)) return data;
    } catch (error) {
      console.warn('Backend orders falló, leyendo local...', error.message);
    }
  }

  // Fallback local
  const orders = getLocalOrders();
  return orders.filter(o => o.userEmail === user.email || o.userId === user.id);
}

// Obtener todas las órdenes (Admin): GET /api/v1/orders
export async function getAllOrders() {
  try {
    const data = await apiRequest('/api/v1/orders');
    if (Array.isArray(data)) return data;
  } catch (error) {
    console.warn('Backend all orders falló, leyendo local...', error.message);
  }

  return getLocalOrders();
}

// Actualizar estado de orden (Admin): PATCH /api/v1/orders/{orderId}/status
export async function updateOrderStatus(orderId, status) {
  try {
    const updated = await apiRequest(`/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return { ok: true, order: updated };
  } catch (error) {
    console.warn('Backend update order status falló, usando local...', error.message);
  }

  const orders = getLocalOrders();
  const idx = orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    saveLocalOrders(orders);
    return { ok: true, order: orders[idx] };
  }

  return { ok: false, message: 'Orden no encontrada' };
}
