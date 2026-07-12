'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import CheckoutForm from './CheckoutForm';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    totalPrice,
    increaseQty,
    decreaseQty,
    removeFromCart,
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <>
      <div
        className={`overlay ${isOpen ? 'open' : ''}`}
        onClick={closeCart}
      />

      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Tu carrito</h3>
          <button className="icon-btn" onClick={closeCart} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 && (
            <div className="cart-empty">
              Tu carrito está vacío.
              <br />
              Añade productos desde el catálogo.
            </div>
          )}

          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <img
                src={
                  item.imagen ||
                  'https://placehold.co/100x100/191c24/39ff8f?text=FORZA'
                }
                alt={item.nombre}
              />
              <div className="cart-item-info">
                <h4>{item.nombre}</h4>
                <span className="cart-item-price">
                  ${(item.precio * item.cantidad).toFixed(2)}
                </span>
                <div className="qty-control">
                  <button onClick={() => decreaseQty(item.id)}>−</button>
                  <span>{item.cantidad}</span>
                  <button onClick={() => increaseQty(item.id)}>+</button>
                </div>
                <button
                  className="remove-link"
                  onClick={() => removeFromCart(item.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-footer">
          <div className="cart-total-row">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <button
            className="btn btn-cta btn-block"
            disabled={items.length === 0}
            onClick={() => setShowCheckout(true)}
          >
            Proceder al pago
          </button>
        </div>
      </aside>

      {showCheckout && (
        <CheckoutForm
          onClose={() => {
            setShowCheckout(false);
            closeCart();
          }}
        />
      )}
    </>
  );
}
