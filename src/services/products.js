import { apiRequest } from './api';
import { IMAGES } from '../constants/images';

// Listar productos activos (100% API)
export async function getProducts() {
  try {
    const data = await apiRequest('/api/v1/products');
    if (!Array.isArray(data)) return [];

    return data.map((p) => ({
      id: p.id,
      name: p.name,
      price: typeof p.price === 'number' ? `$${p.price.toFixed(2)} USD` : p.price,
      numericPrice:
        typeof p.price === 'number'
          ? p.price
          : parseFloat(String(p.price).replace(/[^0-9.]/g, '')),
      src: p.imageUrl || IMAGES.divine,
      alt: p.altText || p.name,
      stock: p.stock,
    }));
  } catch (error) {
    console.error('Error al obtener productos del backend:', error.message);
    return [];
  }
}

// Crear producto (Admin - 100% API)
export async function addProduct({ name = '', price = '', src = '', alt = '', stock = 100 }) {
  const cleanName = name.trim();
  const cleanPrice = String(price).trim();
  const cleanSrc = src.trim() || IMAGES.divine;
  const cleanAlt = alt.trim() || cleanName;
  const numPrice = parseFloat(cleanPrice.replace('$', '').replace('USD', '').trim());
  const numStock = Number(stock);

  if (!cleanName || isNaN(numPrice) || numPrice < 0.01) {
    return { ok: false, message: 'El nombre y un precio válido (mínimo 0.01) son obligatorios.' };
  }

  if (isNaN(numStock) || numStock < 0) {
    return { ok: false, message: 'El stock debe ser un número mayor o igual a 0.' };
  }

  try {
    const created = await apiRequest('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify({
        name: cleanName,
        price: numPrice,
        imageUrl: cleanSrc,
        altText: cleanAlt,
        stock: numStock,
        active: true,
      }),
    });
    return { ok: true, message: 'Producto agregado exitosamente.', product: created };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// Actualizar stock de producto (Admin - 100% API)
export async function updateProductStock(id, quantity) {
  const numQuantity = Number(quantity);
  if (!id || isNaN(numQuantity) || numQuantity < 0) {
    return { ok: false, message: 'ID o cantidad de stock inválida.' };
  }

  try {
    const updated = await apiRequest(`/api/v1/products/${id}/stock?quantity=${numQuantity}`, {
      method: 'PATCH',
    });
    return { ok: true, message: 'Stock actualizado con éxito.', product: updated };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// Eliminar producto (Admin - Soft Delete 100% API)
export async function deleteProduct(nameOrId) {
  try {
    let targetId = typeof nameOrId === 'number' ? nameOrId : null;

    if (!targetId) {
      const list = await getProducts();
      const target = list.find(
        (p) => p.id === nameOrId || p.name.toLowerCase() === String(nameOrId).toLowerCase()
      );
      if (!target) {
        return { ok: false, message: 'Producto no encontrado.' };
      }
      targetId = target.id;
    }

    const res = await apiRequest(`/api/v1/products/${targetId}`, { method: 'DELETE' });
    return { ok: true, message: res?.message || 'Producto eliminado correctamente.' };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}
