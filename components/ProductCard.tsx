'use client';

import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <div className="product-media">
        {product.categoria && (
          <span className="product-tag">{product.categoria}</span>
        )}
        {/* Usamos <img> nativo para admitir cualquier URL pegada por el admin sin configurar dominios extra */}
        <img
          src={product.imagen || 'https://placehold.co/600x450/191c24/39ff8f?text=FORZA'}
          alt={product.nombre}
          loading="lazy"
        />
      </div>
      <div className="product-body">
        <h3>{product.nombre}</h3>
        <p>{product.descripcion}</p>
        <div className="product-footer">
          <div className="product-price">
            ${product.precio.toFixed(2)}
            <br />
            <small>MXN</small>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
          >
            {product.stock <= 0 ? 'Agotado' : 'Añadir al carrito'}
          </button>
        </div>
      </div>
    </div>
  );
}
