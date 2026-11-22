import { apiRequest } from './api';

const PRODUCTS_KEY = "poe_products";

export const defaultProducts = [
  { id: 1, name: "Divine Orb", price: "$2.00 USD", src: "/images/divine.webp", alt: "Divine Orb", stock: 500 },
  { id: 2, name: "Chaos Orb", price: "$0.15 USD", src: "/images/chaos.webp", alt: "Chaos Orb", stock: 1000 },
  { id: 3, name: "Mirror of Kalandra", price: "$250.00 USD", src: "/images/mirror.webp", alt: "Mirror of Kalandra", stock: 10 },
  { id: 4, name: "Exalted Orb", price: "$0.50 USD", src: "/images/exalted.webp", alt: "Exalted Orb", stock: 800 }
];

export async function getProducts() {
  try {
    const data = await apiRequest('/api/v1/products');
    if (Array.isArray(data) && data.length > 0) {
      // Normalizar formato para que funcione con los componentes de la tienda
      const mapped = data.map(p => ({
        id: p.id,
        name: p.name,
        price: typeof p.price === 'number' ? `$${p.price.toFixed(2)} USD` : p.price,
        numericPrice: typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, '')),
        src: p.imageUrl || '/images/divine.webp',
        alt: p.altText || p.name,
        stock: p.stock
      }));
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mapped));
      return mapped;
    }
  } catch (error) {
    console.warn('No se pudo conectar con /api/v1/products, cargando local...', error.message);
  }

  // Fallback a localStorage o por defecto
  const saved = localStorage.getItem(PRODUCTS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultProducts;
    }
  }
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
  return defaultProducts;
}

export async function addProduct({ name = '', price = '', src = '', alt = '', stock = 100 }) {
  const cleanName = name.trim();
  const cleanPrice = String(price).trim();
  const cleanSrc = src.trim() || '/images/divine.webp';
  const cleanAlt = alt.trim() || cleanName;
  const numPrice = parseFloat(cleanPrice.replace('$', '').replace('USD', '').trim());

  if (!cleanName || isNaN(numPrice)) {
    return { ok: false, message: 'El nombre y un precio numérico válido son obligatorios.' };
  }

  try {
    const created = await apiRequest('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify({
        name: cleanName,
        price: numPrice,
        imageUrl: cleanSrc,
        altText: cleanAlt,
        stock: Number(stock) || 100,
        active: true
      })
    });
    return { ok: true, message: 'Producto agregado exitosamente al backend.', product: created };
  } catch (error) {
    console.warn('Backend addProduct error, guardando local...', error.message);
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
    if (products.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
      return { ok: false, message: 'Ya existe un producto con ese nombre.' };
    }
    const newProduct = {
      id: Date.now(),
      name: cleanName,
      price: cleanPrice.startsWith('$') ? cleanPrice : `$${cleanPrice} USD`,
      src: cleanSrc,
      alt: cleanAlt,
      stock: Number(stock) || 100
    };
    products.push(newProduct);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return { ok: true, message: 'Producto agregado exitosamente (modo local).', product: newProduct };
  }
}

export async function deleteProduct(nameOrId) {
  // Manejo local y de interfaz
  const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
  const filtered = products.filter(p => p.name.toLowerCase() !== String(nameOrId).toLowerCase() && p.id !== nameOrId);

  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
  return { ok: true, message: 'Producto eliminado correctamente.' };
}
