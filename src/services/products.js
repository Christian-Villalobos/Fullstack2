import { api } from './api';

const PRODUCTS_KEY = 'poe_products';

export const defaultProducts = [
  { id: 1, name: 'Divine Orb', price: '$2.00 USD', src: '/images/divine.webp', alt: 'Divine Orb', stock: 500 },
  { id: 2, name: 'Chaos Orb', price: '$0.15 USD', src: '/images/chaos.webp', alt: 'Chaos Orb', stock: 1000 },
  { id: 3, name: 'Mirror of Kalandra', price: '$250.00 USD', src: '/images/mirror.webp', alt: 'Mirror of Kalandra', stock: 10 },
  { id: 4, name: 'Exalted Orb', price: '$0.50 USD', src: '/images/exalted.webp', alt: 'Exalted Orb', stock: 800 },
];

// Backend (ProductoResponseDTO) → formato que usan los componentes
const toProduct = (p) => ({
  id: p.idProducto,
  name: p.nombreProducto,
  price: `$${Number(p.precio).toFixed(2)} USD`,
  numericPrice: Number(p.precio),
  src: p.imagen || '/images/divine.webp',
  alt: p.alt || p.nombreProducto,
  stock: p.stock,
});

// Lectura: si el backend no responde, se muestra la última copia local (o los de ejemplo)
export async function getProducts() {
  try {
    const { data } = await api.get('/api/v1/productos');
    if (Array.isArray(data) && data.length > 0) {
      const mapped = data.map(toProduct);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mapped));
      return mapped;
    }
  } catch (error) {
    console.warn('Backend de productos no disponible, usando copia local...', error.message);
  }

  const saved = localStorage.getItem(PRODUCTS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultProducts;
    }
  }
  return defaultProducts;
}

// Escritura: solo contra el backend (un producto local no existiría para el checkout)
export async function addProduct({ name = '', price = '', src = '', alt = '', stock = 100 }) {
  const cleanName = name.trim();
  const cleanSrc = src.trim() || '/images/divine.webp';
  const cleanAlt = alt.trim() || cleanName;
  const numPrice = parseFloat(String(price).replace('$', '').replace('USD', '').trim());

  if (!cleanName || isNaN(numPrice)) {
    return { ok: false, message: 'El nombre y un precio numérico válido son obligatorios.' };
  }

  try {
    const { data } = await api.post('/api/v1/productos', {
      nombreProducto: cleanName,
      precio: numPrice,
      imagen: cleanSrc,
      alt: cleanAlt,
      stock: Number(stock) || 100,
      categoriaId: 1, // Currency (seed de servicio-productos)
    });
    return { ok: true, message: 'Producto agregado exitosamente.', product: toProduct(data) };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

export async function deleteProduct(nameOrId) {
  try {
    const list = await getProducts();
    const target = list.find((p) => p.id === nameOrId || p.name === nameOrId);
    if (!target) return { ok: false, message: 'Producto no encontrado.' };

    await api.delete(`/api/v1/productos/${target.id}`);
    return { ok: true, message: 'Producto eliminado correctamente.' };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}