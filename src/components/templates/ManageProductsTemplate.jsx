import { ProductManager } from '../organisms/ProductManager';
import { Navbar } from '../organisms/Navbar';
import { Footer } from '../organisms/Footer';
import { Texts } from '../molecules/Texts';
import { Button } from '../atoms/Button';

export function ManageProductsTemplate({
  navbar,
  products = [],
  onAddProduct,
  onDeleteProduct,
  onUpdateStock,
  footer
}) {
  return (
    <div className="manage-products-template">
      {navbar && <Navbar {...navbar} />}

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Texts
            texts={[
              { variant: "h1", content: "Administración de Productos", className: "titulo-principal" },
              { variant: "p", content: "Gestiona los artículos y orbes disponibles en la tienda oficial.", className: "subtitulo" }
            ]}
          />
          <Button
            className="btn-white text-sm"
            onClick={() => { window.location.hash = '#perfil'; }}
          >
            ← Volver al Perfil
          </Button>
        </div>

        <ProductManager
          products={products}
          onAddProduct={onAddProduct}
          onDeleteProduct={onDeleteProduct}
          onUpdateStock={onUpdateStock}
        />
      </div>

      {footer && <Footer {...footer} />}
    </div>
  );
}
