import { api } from './api';

// TransaccionResponseDTO → formato que usa OrderList
const toOrder = (t) => ({
  id: t.idTransaccion,
  orderNumber: `ORD-${t.idTransaccion}`,
  userName: t.usuario?.nombreUsuario,
  userEmail: t.usuario?.email,
  totalAmount: t.total,
  createdAt: t.fechaTransaccion,
  status: t.estado === 'PAGADO' ? 'PENDING' : t.estado === 'CANCELADO' ? 'CANCELLED' : t.estado,
  items: (t.items || []).map((i) => ({
    quantity: i.cantidadProducto,
    productName: i.nombreProducto,
  })),
});

// Checkout: crea/recupera el carrito en el backend con los ítems locales y lo paga
export async function checkoutOrder(user, cartItems = []) {
  if (!user) {
    return { ok: false, message: 'Debes iniciar sesión para completar la compra.' };
  }

  try {
    const { data: carrito } = await api.post('/api/v1/transacciones/carrito', {
      idUsuario: user.id,
      items: cartItems.map((i) => ({ productoId: i.id, cantidad: i.qty })),
    });

    const { data: order } = await api.post(
      `/api/v1/transacciones/${carrito.idTransaccion}/checkout`,
      { idMedioDePago: 1 } // TARJETA_CREDITO (seed)
    );

    return { ok: true, message: `¡Orden creada! Código: ORD-${order.idTransaccion}`, order };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

export async function getUserOrders(user) {
  if (!user?.id) return [];
  try {
    const { data } = await api.get('/api/v1/transacciones', { params: { idUsuario: user.id } });
    return data.filter((t) => t.estado !== 'EN_CARRITO').map(toOrder);
  } catch (error) {
    console.warn('No se pudieron cargar las órdenes:', error.message);
    return [];
  }
}

export async function getAllOrders() {
  try {
    const { data } = await api.get('/api/v1/transacciones');
    return data.filter((t) => t.estado !== 'EN_CARRITO').map(toOrder);
  } catch (error) {
    console.warn('No se pudieron cargar las órdenes:', error.message);
    return [];
  }
}

// El backend aún no tiene estado ENTREGADO ni endpoint para cambiarlo
export async function updateOrderStatus() {
  return { ok: false, message: 'Esta acción aún no está disponible.' };
}