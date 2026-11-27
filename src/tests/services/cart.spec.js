import { api } from '../../services/api';
import {
  getCart,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCartRemote,
} from '../../services/cart';

describe('cart service (Full API)', () => {
  const mockCartResponse = {
    cartId: 1,
    userId: 1,
    items: [
      {
        id: 10,
        productId: 1,
        productName: 'Divine Orb',
        unitPrice: 2.0,
        quantity: 2,
        subtotal: 4.0,
        imageUrl: '/images/divine.webp',
      },
    ],
    totalAmount: 4.0,
  };

  it('devuelve lista vacía si no hay userId', async () => {
    expect(await getCart(null)).toEqual([]);
  });

  it('obtiene y mapea el carrito desde el backend', async () => {
    spyOn(api, 'request').and.resolveTo({ data: mockCartResponse });

    const items = await getCart(1);
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(1);
    expect(items[0].itemId).toBe(10);
    expect(items[0].price).toBe('$2.00 USD');
    expect(items[0].qty).toBe(2);
  });

  it('agrega, actualiza cantidad, elimina ítem y vacía carrito', async () => {
    const spy = spyOn(api, 'request').and.resolveTo({ data: mockCartResponse });

    const added = await addCartItem(1, 1, 2);
    expect(added.ok).toBeTrue();

    const updated = await updateCartItemQuantity(1, 10, 3);
    expect(updated.ok).toBeTrue();

    const removed = await removeCartItem(1, 10);
    expect(removed.ok).toBeTrue();

    const cleared = await clearCartRemote(1);
    expect(cleared.ok).toBeTrue();
    expect(spy).toHaveBeenCalledTimes(4);
  });
});
