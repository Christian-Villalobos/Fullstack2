import {
  getProducts,
  addProduct,
  deleteProduct,
  defaultProducts
} from '../../services/products';

describe('Products Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe devolver los productos por defecto si no hay nada guardado', () => {
    const products = getProducts();
    expect(products.length).toBe(defaultProducts.length);
    expect(products[0].name).toBe('Divine Orb');
  });

  it('debe agregar un nuevo producto exitosamente', () => {
    const res = addProduct({
      name: 'Vaal Orb',
      price: '0.80',
      src: '/images/vaal.webp'
    });

    expect(res.ok).toBeTrue();
    const updated = getProducts();
    expect(updated.some(p => p.name === 'Vaal Orb')).toBeTrue();
  });

  it('no debe permitir agregar un producto duplicado', () => {
    const res = addProduct({ name: 'Divine Orb', price: '2.00' });
    expect(res.ok).toBeFalse();
    expect(res.message).toContain('Ya existe un producto con ese nombre');
  });

  it('debe eliminar un producto existente', () => {
    getProducts(); // inicializa con default
    const res = deleteProduct('Divine Orb');
    expect(res.ok).toBeTrue();

    const updated = getProducts();
    expect(updated.some(p => p.name === 'Divine Orb')).toBeFalse();
  });
});
