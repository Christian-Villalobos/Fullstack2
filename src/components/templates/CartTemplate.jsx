import { Navbar } from '../organisms/Navbar';
import { Texts } from '../molecules/Texts';
import { CartList } from '../organisms/CartList';
import { Footer } from '../organisms/Footer';

export function CartTemplate({ navbar, titles, cart, onAdd, onRemove, onClear, onCheckout, footer }) {
    return (
        <div className="cart-template">
            {/* 1. Barra superior */}
            <Navbar {...navbar} />

            {/* 2. Título */}
            {titles && <Texts texts={titles} />}

            {/* 3. Lista del carrito */}
            <CartList
                cart={cart}
                onAdd={onAdd}
                onRemove={onRemove}
                onClear={onClear}
                onCheckout={onCheckout}
            />

            {/* 4. Footer */}
            {footer && <Footer {...footer} />}
        </div>
    );
}
