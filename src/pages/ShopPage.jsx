import { useState, useEffect } from 'react';
import { ShopTemplate } from '../components/templates/ShopTemplate';
import { getProducts, defaultProducts } from '../services/products';

const shopTitles = [
  { variant: "h1", content: "Tienda de Divisas", className: "titulo-principal" },
  { variant: "p", content: "Compra y vende los mejores orbes y objetos de Path of Exile con entrega inmediata", className: "subtitulo" }
];

export function ShopPage({ navbar, footer, onAddToCart }) {
  const [products, setProducts] = useState(defaultProducts);

  useEffect(() => {
    let isMounted = true;
    getProducts().then(data => {
      if (isMounted && data) {
        setProducts(data);
      }
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <ShopTemplate
      navbar={navbar}
      titles={shopTitles}
      products={products}
      onAddToCart={onAddToCart}
      footer={footer}
    />
  );
}
