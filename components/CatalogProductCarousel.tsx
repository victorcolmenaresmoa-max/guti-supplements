'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type TransitionEvent } from 'react';
import { Product } from '@/types';

interface CatalogProductCarouselProps {
  products: Product[];
  variant: 'hero' | 'feature';
  intervalMs?: number;
  className?: string;
}

export default function CatalogProductCarousel({
  products,
  variant,
  intervalMs = 3600,
  className = '',
}: CatalogProductCarouselProps) {
  const items = useMemo(
    () => products.filter((product) => product.id && product.nombre),
    [products]
  );
  const productKey = useMemo(
    () => items.map((product) => product.id).join('|'),
    [items]
  );
  const slides = useMemo(
    () => (items.length > 1 ? [...items, items[0]] : items),
    [items]
  );

  const [position, setPosition] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setTransitionEnabled(false);
    setPosition(0);

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setTransitionEnabled(true));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [productKey]);

  useEffect(() => {
    if (items.length <= 1 || paused) return;

    const timer = window.setInterval(() => {
      setTransitionEnabled(true);
      setPosition((current) => current + 1);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [items.length, intervalMs, paused]);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;

    if (items.length > 1 && position === items.length) {
      setTransitionEnabled(false);
      setPosition(0);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setTransitionEnabled(true));
      });
    }
  };

  const visibleSlideIndex = position === items.length ? items.length : position;

  if (slides.length === 0) {
    return (
      <div className={`catalog-product-carousel catalog-product-carousel-${variant} ${className}`.trim()}>
        <div className="catalog-carousel-empty">
          <img src="/guti-logo.png" alt="GutiSupplements" />
          <strong>Catálogo GutiSupplements</strong>
          <span>Los productos disponibles aparecerán aquí.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`catalog-product-carousel catalog-product-carousel-${variant} ${className}`.trim()}
      aria-label="Productos disponibles en el catálogo"
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="catalog-carousel-track"
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translate3d(-${position * 100}%, 0, 0)`,
          transition: transitionEnabled
            ? 'transform 520ms cubic-bezier(0.22, 0.74, 0.24, 1)'
            : 'none',
        }}
      >
        {slides.map((product, index) => (
          <Link
            key={`${product.id}-${index}`}
            href={`/producto/${encodeURIComponent(product.id)}`}
            className="catalog-carousel-slide"
            aria-label={`Ver ${product.nombre}`}
            tabIndex={index === visibleSlideIndex ? 0 : -1}
          >
            <div className="catalog-carousel-image-wrap">
              <img
                src={product.imagen || '/guti-logo.png'}
                alt={product.nombre}
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={(event) => {
                  const image = event.currentTarget;
                  if (image.dataset.fallbackApplied) return;
                  image.dataset.fallbackApplied = 'true';
                  image.src = '/guti-logo.png';
                }}
              />
            </div>
            <div className="catalog-carousel-caption">
              {product.categoria && <span>{product.categoria}</span>}
              <strong>{product.nombre}</strong>
            </div>
          </Link>
        ))}
      </div>

      {items.length > 1 && (
        <div className="catalog-carousel-progress" aria-hidden="true">
          {items.map((product, index) => (
            <span
              key={product.id}
              className={index === position % items.length ? 'active' : ''}
            />
          ))}
        </div>
      )}
    </div>
  );
}
