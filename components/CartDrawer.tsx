'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import CheckoutForm from './CheckoutForm';
import Icon from './Icons';

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

  const startCheckout = () => {
    closeCart();
    setShowCheckout(true);
  };

  return (
    <>
      <div className={`overlay ${isOpen ? 'open' : ''}`} onClick={closeCart} />

      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
        <div className="cart-header">
          <div>
            <span className="eyebrow">Resumen de compra</span>
            <h3>Tu pedido</h3>
          </div>
          <button className="icon-btn" onClick={closeCart} aria-label="Cerrar">
            <Icon name="close" size={19} />
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 && (
            <div className="cart-empty">
              <span className="empty-icon"><Icon name="bag" size={30} /></span>
              <h4>Tu pedido está vacío</h4>
              <p>Explora el catálogo y agrega los productos que deseas consultar.</p>
            </div>
          )}

          {items.map((item) => (
            <article className="cart-item" key={item.id}>
              <img
                src={
                  item.imagen ||
                  'https://placehold.co/200x200/5d0a2a/ffffff?text=GS'
                }
                alt={item.nombre}
              />
              <div className="cart-item-info">
                <div className="cart-item-title-row">
                  <div>
                    <h4>{item.nombre}</h4>
                    {item.presentacion && <small>{item.presentacion}</small>}
                  </div>
                  <button
                    className="remove-icon-btn"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Eliminar ${item.nombre}`}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>

                <div className="cart-item-bottom">
                  <div className="qty-control">
                    <button onClick={() => decreaseQty(item.id)} aria-label="Reducir cantidad">−</button>
                    <span>{item.cantidad}</span>
                    <button
                      onClick={() => increaseQty(item.id)}
                      disabled={item.cantidad >= item.stock}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                  <span className="cart-item-price">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="cart-footer">
          <div className="cart-total-row muted-row">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="cart-total-row">
            <span>Total estimado</span>
            <span>${totalPrice.toFixed(2)} USD</span>
          </div>
          <p className="cart-note">
            El equipo confirmará disponibilidad, entrega y datos de pago contigo.
          </p>
          <button
            className="btn btn-primary btn-block btn-lg"
            disabled={items.length === 0}
            onClick={startCheckout}
          >
            Completar pedido <Icon name="arrowRight" size={18} />
          </button>
        </div>
      </aside>

      {showCheckout && <CheckoutForm onClose={() => setShowCheckout(false)} />}
    </>
  );
}
