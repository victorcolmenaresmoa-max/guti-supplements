'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { FALLBACK_PRODUCTS } from '@/lib/fallbackProducts';
import { getProduct } from '@/lib/api';
import { Product } from '@/types';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';
import Loader from './Loader';
import Icon from './Icons';

export default function ProductDetailView({ productId }: { productId: string }) {
  const { addToCart, openCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let active = true;

    (async () => {
      const fallback = FALLBACK_PRODUCTS.find((item) => item.id === productId);
      if (fallback) {
        if (active) {
          setProduct(fallback);
          setLoading(false);
        }
        return;
      }

      const response = await getProduct(productId);
      if (active) {
        setProduct(response.ok && response.data ? response.data : null);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [productId]);

  const benefits = useMemo(
    () =>
      (product?.beneficios || '')
        .split(/\n|•/)
        .map((item) => item.trim())
        .filter(Boolean),
    [product]
  );

  const addOnly = () => {
    if (!product) return;
    addToCart(product, quantity, false);
  };

  const buyNow = () => {
    if (!product) return;
    addToCart(product, quantity, false);
    openCart();
  };

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="product-detail-page">
        <div className="container">
          <Link href="/#catalogo" className="back-link">
            <Icon name="chevronLeft" size={17} /> Volver al catálogo
          </Link>

          {loading ? (
            <Loader label="Cargando producto..." />
          ) : !product ? (
            <div className="not-found-card">
              <span className="empty-icon"><Icon name="package" size={34} /></span>
              <h1>Producto no encontrado</h1>
              <p>Este producto ya no está disponible o el enlace cambió.</p>
              <Link href="/#catalogo" className="btn btn-primary">Explorar catálogo</Link>
            </div>
          ) : (
            <div className="product-detail-grid">
              <section className="product-gallery-card">
                <div className="product-detail-image">
                  <img
                    src={product.imagen || 'https://placehold.co/1000x1000/5d0a2a/ffffff?text=GutiSupplements'}
                    alt={product.nombre}
                  />
                  {product.destacado && (
                    <span className="product-featured product-featured-detail">
                      <Icon name="sparkles" size={14} /> Selección destacada
                    </span>
                  )}
                </div>
                <div className="product-assurance-row">
                  <span><Icon name="shield" size={18} /> Compra coordinada</span>
                  <span><Icon name="message" size={18} /> Asesoría personalizada</span>
                  <span><Icon name="truck" size={18} /> Entrega confirmada</span>
                </div>
              </section>

              <section className="product-info-panel">
                <span className="product-detail-category">{product.categoria || 'Suplementos'}</span>
                <h1>{product.nombre}</h1>
                {product.presentacion && <p className="product-presentation">{product.presentacion}</p>}
                <div className="product-detail-price">
                  ${product.precio.toFixed(2)} <small>USD</small>
                </div>
                <p className="product-long-description">{product.descripcion}</p>

                <div className="stock-line">
                  <span className={product.stock > 0 ? 'status-dot available' : 'status-dot'} />
                  {product.stock > 0
                    ? `Disponible · ${product.stock} unidades en inventario`
                    : 'Actualmente agotado'}
                </div>

                <div className="quantity-purchase-row">
                  <div className="quantity-picker">
                    <button onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                    <span>{quantity}</span>
                    <button
                      onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
                      disabled={quantity >= product.stock}
                    >+
                    </button>
                  </div>
                  <button className="btn btn-outline" onClick={addOnly} disabled={product.stock <= 0}>
                    <Icon name="bag" size={17} /> Agregar
                  </button>
                  <button className="btn btn-primary buy-now-btn" onClick={buyNow} disabled={product.stock <= 0}>
                    Hacer pedido <Icon name="arrowRight" size={18} />
                  </button>
                </div>

                <p className="purchase-helper">
                  No se realizará un cobro automático. Recibirás confirmación personalizada antes de completar el pago.
                </p>
              </section>

              <section className="product-description-card product-detail-wide">
                <div className="detail-section-heading">
                  <span className="eyebrow">Información completa</span>
                  <h2>Conoce el producto</h2>
                </div>

                <div className="product-information-grid">
                  <article>
                    <span className="detail-number">01</span>
                    <h3>Beneficios principales</h3>
                    {benefits.length > 0 ? (
                      <ul className="benefits-list">
                        {benefits.map((benefit) => (
                          <li key={benefit}><Icon name="check" size={16} /> {benefit}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>Consulta con nuestro equipo para conocer los beneficios y características específicas de esta presentación.</p>
                    )}
                  </article>
                  <article>
                    <span className="detail-number">02</span>
                    <h3>Modo de uso</h3>
                    <p>{product.modoUso || 'Sigue las instrucciones indicadas en la etiqueta y ajusta el consumo a tus necesidades personales.'}</p>
                  </article>
                  <article>
                    <span className="detail-number">03</span>
                    <h3>Ingredientes</h3>
                    <p>{product.ingredientes || 'La información detallada de ingredientes está disponible en la etiqueta del producto.'}</p>
                  </article>
                </div>

                <div className="health-note">
                  <Icon name="shield" size={20} />
                  <p>
                    Los suplementos no sustituyen una alimentación equilibrada. Ante condiciones médicas, embarazo, lactancia o uso de medicamentos, consulta a un profesional de salud antes de consumirlos.
                  </p>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
