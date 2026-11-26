import { useState, useEffect } from 'react';
import { ManageProductsTemplate } from '../components/templates/ManageProductsTemplate';
import { getCurrentUser, isAdminUser } from '../services/auth';
import { getProducts, addProduct, deleteProduct, updateProductStock, defaultProducts } from '../services/products';

export function ManageProductsPage({ navbar, footer }) {
  // Se lee una sola vez: así el objeto no cambia en cada render
  const [user] = useState(getCurrentUser);
  const isAdmin = isAdminUser(user);
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

    let isMounted = true;
    getProducts().then((data) => {
      if (isMounted && data) setProducts(data);
    });
    return () => { isMounted = false; };
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

  const handleUpdateStock = async (id, quantity) => {
    const res = await updateProductStock(id, quantity);
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
      onUpdateStock={handleUpdateStock}
      footer={footer}
    />
  );
}