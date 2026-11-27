import { api } from '../../services/api';
import {
  getProducts,
  addProduct,
  updateProductStock,
  deleteProduct,
} from '../../services/products';

describe('Products Service (Full API)', () => {
  it('obtiene y normaliza productos activos del backend', async () => {
    spyOn(api, 'request').and.resolveTo({
      data: [{ id: 1, name: 'Divine Orb', price: 2.0, imageUrl: '/img/d.webp', altText: 'Divine', stock: 50 }],
    });

    const products = await getProducts();
    expect(products.length).toBe(1);
    expect(products[0].price).toBe('$2.00 USD');
    expect(products[0].numericPrice).toBe(2.0);
  });

  it('agrega un producto válido y valida precio mínimo', async () => {
    const spy = spyOn(api, 'request').and.resolveTo({ data: { id: 5, name: 'Vaal Orb', price: 0.8 } });

    const invalid = await addProduct({ name: 'Malo', price: '0' });
    expect(invalid.ok).toBeFalse();
    expect(spy).not.toHaveBeenCalled();

    const valid = await addProduct({ name: 'Vaal Orb', price: '0.80', src: '/images/vaal.webp', stock: 10 });
    expect(valid.ok).toBeTrue();
  });

  it('actualiza stock y elimina producto vía API', async () => {
    const spy = spyOn(api, 'request').and.resolveTo({ data: { message: 'OK' } });

    const stockRes = await updateProductStock(1, 200);
    expect(stockRes.ok).toBeTrue();

    const delRes = await deleteProduct(1);
    expect(delRes.ok).toBeTrue();
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
      url: '/api/v1/products/1',
      method: 'DELETE',
    }));
  });
});
