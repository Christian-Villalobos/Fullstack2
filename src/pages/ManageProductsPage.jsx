import { useState, useEffect } from 'react';
import { ManageProductsTemplate } from '../components/templates/ManageProductsTemplate';
import { getCurrentUser } from '../services/auth';
import { getProducts, addProduct, deleteProduct, defaultProducts } from '../services/products';

export function ManageProductsPage({ navbar, footer }) {
  const user = getCurrentUser();
  const isAdmin = user && (user.role === 'admin' || user.role === 'ROLE_ADMIN');
  const [products, setProducts] = useState(defaultProducts);

  const loadProducts = async () => {
    const data = await getProducts();
    if (data) setProducts(data);
  };

  useEffect(() => {
    if (!user || !isAdmin) {
      alert('Acceso restringido solo para administradores.');
      window.location.hash = '#inicio';
      return;
    }
    loadProducts();
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return null;
  }

  const handleAddProduct = async ({ name, price, src }) => {
    const res = await addProduct({ name, price, src });
    if (res.ok) {
      await loadProducts();
    }
    return res;
  };

  const handleDeleteProduct = async (name) => {
    const confirmed = window.confirm(`¿Seguro que quieres eliminar "${name}" de la tienda?`);
    if (!confirmed) return;

    const res = await deleteProduct(name);
    alert(res.message);
    if (res.ok) {
      await loadProducts();
    }
  };

  return (
    <ManageProductsTemplate
      navbar={navbar}
      products={products}
      onAddProduct={handleAddProduct}
      onDeleteProduct={handleDeleteProduct}
      footer={footer}
    />
  );
}
