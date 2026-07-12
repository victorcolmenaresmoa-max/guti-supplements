'use client';

import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { totalItems, openCart } = useCart();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a href="#top" className="logo">
          FOR<span>ZA</span>
        </a>

        <nav className="nav-links">
          <a href="#catalogo">Catálogo</a>
          <a href="#ventajas">Por qué elegirnos</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <div className="nav-actions">
          <button className="cart-btn" onClick={openCart} aria-label="Abrir carrito">
            🛒
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
