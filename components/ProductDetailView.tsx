'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FALLBACK_PRODUCTS } from '@/lib/fallbackProducts';
import { getProduct, getProducts } from '@/lib/api';
import { Product } from '@/types';
import Navbar from './Navbar';
import CheckoutForm from './CheckoutForm';
import Loader from './Loader';
import Icon from './Icons';

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeProductId(value: unknown) {
  return safeDecode(String(value ?? '')).trim().toLowerCase();
}

export default function ProductDetailView({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setProduct(null);

      const requestedId = normalizeProductId(productId);
      if (!requestedId) {
        if (active) setLoading(false);
        return;
      }

      const fallback = FALLBACK_PRODUCTS.find(
        (item) => normalizeProductId(item.id) === requestedId
      );

      if (fallback) {
        if (active) {
          setProduct(fallback);
          setQuantity(1);
          setLoading(false);
        }
        return;
      }

      const directResponse = await getProduct(productId);
      let foundProduct =
        directResponse.ok && directResponse.data ? directResponse.data : null;

      if (!foundProduct) {
        const catalogResponse = await getProducts();
        if (catalogResponse.ok && catalogResponse.data) {
          foundProduct =
            catalogResponse.data.find(
              (item) => normalizeProductId(item.id) === requestedId
            ) || null;
        }
      }

      if (active) {
        setProduct(foundProduct);
        setQuantity(1);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [productId]);

  const openCheckout = () => {
    if (!product || product.stock <= 0) return;
    setShowCheckout(true);
  };

  return (
    <>
      <Navbar />

      <main className="product-detail-page product-detail-page-compact">
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
            <div className="product-detail-grid product-detail-grid-compact">
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
                  <span><Icon name="shield" size={18} /> Solicitud segura</span>
                  <span><Icon name="message" size={18} /> Contacto directo</span>
                  <span><Icon name="truck" size={18} /> Entrega coordinada</span>
                </div>
              </section>

              <section className="product-info-panel product-info-panel-compact">
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
                    ? `Disponible · ${product.stock} unidades`
                    : 'Actualmente agotado'}
                </div>

                <div className="direct-order-block">
                  <div className="direct-order-labels">
                    <div>
                      <span>Cantidad</span>
                      <small>Selecciona cuántas unidades deseas</small>
                    </div>
                    <strong>${(product.precio * quantity).toFixed(2)} USD</strong>
                  </div>

                  <div className="direct-order-controls">
                    <div className="quantity-picker" aria-label="Cantidad del producto">
                      <button
                        type="button"
                        onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                        aria-label="Reducir cantidad"
                      >
                        −
                      </button>
                      <span>{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
                        disabled={quantity >= product.stock}
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="btn btn-primary btn-lg direct-order-button"
                      onClick={openCheckout}
                      disabled={product.stock <= 0}
                    >
                      {product.stock <= 0 ? 'Producto agotado' : 'Solicitar este producto'}
                      {product.stock > 0 && <Icon name="arrowRight" size={18} />}
                    </button>
                  </div>
                </div>

                <div className="purchase-helper-card">
                  <Icon name="shield" size={18} />
                  <p>
                    No se realizará ningún cobro automático. Un asesor confirmará
                    disponibilidad, entrega y pago directamente contigo.
                  </p>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {showCheckout && product && (
        <CheckoutForm
          product={product}
          quantity={quantity}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
}
