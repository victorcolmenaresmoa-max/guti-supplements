'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import Loader from '@/components/Loader';
import Icon from '@/components/Icons';
import { getProducts } from '@/lib/api';
import { FALLBACK_PRODUCTS } from '@/lib/fallbackProducts';
import { Product } from '@/types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      const response = await getProducts();
      if (!active) return;

      setProducts(
        response.ok && response.data && response.data.length > 0
          ? response.data
          : FALLBACK_PRODUCTS
      );
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const values = new Set(products.map((product) => product.categoria).filter(Boolean));
    return ['Todos', ...Array.from(values)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = filter === 'Todos' || product.categoria === filter;
      const matchesSearch =
        !normalizedSearch ||
        product.nombre.toLowerCase().includes(normalizedSearch) ||
        product.descripcion.toLowerCase().includes(normalizedSearch) ||
        product.categoria.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [products, filter, search]);

  const visualProducts = products.length > 0 ? products : FALLBACK_PRODUCTS;
  const getVisualProduct = (index: number) => visualProducts[index % visualProducts.length];
  const featuredProducts = visualProducts.filter((product) => product.destacado);
  const editorialProducts = (featuredProducts.length > 0 ? featuredProducts : visualProducts).slice(0, 3);
  const categoryCards = categories
    .filter((category) => category !== 'Todos')
    .map((category) => ({
      category,
      product: visualProducts.find((product) => product.categoria === category),
    }))
    .filter((item): item is { category: string; product: Product } => Boolean(item.product))
    .slice(0, 4);

  return (
    <>
      <Navbar />
      <main>
        <section className="hero hero-redesign" id="inicio">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="container hero-grid hero-grid-redesign">
            <div className="hero-content hero-content-redesign">
              <span className="hero-badge">
                <Icon name="sparkles" size={15} /> Bienestar y rendimiento, mejor presentados
              </span>
              <h1>
                Eleva tu rutina con una selección que <em>se siente premium.</em>
              </h1>
              <p>
                Explora suplementos organizados con claridad, imágenes protagonistas y
                una experiencia de compra acompañada de principio a fin.
              </p>
              <div className="hero-actions">
                <a href="#catalogo" className="btn btn-primary btn-lg">
                  Explorar catálogo <Icon name="arrowRight" size={18} />
                </a>
                <a href="#colecciones" className="btn btn-outline btn-lg">
                  Descubrir colecciones
                </a>
              </div>

              <div className="hero-feature-grid">
                <article>
                  <span><Icon name="shield" size={18} /></span>
                  <div><strong>Selección cuidada</strong><small>Información clara y completa</small></div>
                </article>
                <article>
                  <span><Icon name="message" size={18} /></span>
                  <div><strong>Compra guiada</strong><small>Confirmación personalizada</small></div>
                </article>
                <article>
                  <span><Icon name="truck" size={18} /></span>
                  <div><strong>Entrega coordinada</strong><small>Cada detalle se valida contigo</small></div>
                </article>
              </div>
            </div>

            <div className="hero-product-stage" aria-label="Selección GutiSupplements">
              <div className="hero-stage-frame hero-stage-main">
                <img src={getVisualProduct(0).imagen} alt={getVisualProduct(0).nombre} />
                <div className="hero-stage-overlay">
                  <span>{getVisualProduct(0).categoria}</span>
                  <strong>{getVisualProduct(0).nombre}</strong>
                  <small>${getVisualProduct(0).precio.toFixed(2)} USD</small>
                </div>
              </div>
              <div className="hero-stage-frame hero-stage-top">
                <img src={getVisualProduct(1).imagen} alt={getVisualProduct(1).nombre} />
              </div>
              <div className="hero-stage-frame hero-stage-bottom">
                <img src={getVisualProduct(2).imagen} alt={getVisualProduct(2).nombre} />
              </div>
              <div className="hero-stage-brand">
                <img src="/guti-logo.png" alt="GutiSupplements" />
              </div>
              <div className="hero-stage-note hero-stage-note-top">
                <Icon name="sparkles" size={16} />
                <span><strong>Curado para ti</strong><small>Una vitrina más visual</small></span>
              </div>
              <div className="hero-stage-note hero-stage-note-bottom">
                <Icon name="package" size={16} />
                <span><strong>{visualProducts.length} productos</strong><small>Listos para explorar</small></span>
              </div>
            </div>
          </div>
        </section>

        <section className="brand-marquee" aria-label="Valores de GutiSupplements">
          <div className="brand-marquee-track">
            <span>Performance</span><b>✦</b><span>Wellness</span><b>✦</b>
            <span>Calidad visual</span><b>✦</b><span>Compra acompañada</span><b>✦</b>
            <span>Información clara</span><b>✦</b><span>Selección premium</span><b>✦</b>
          </div>
        </section>

        <section className="section collection-section" id="colecciones">
          <div className="container">
            <div className="section-heading collection-heading">
              <div>
                <span className="eyebrow">Explora de otra manera</span>
                <h2>Una vitrina diseñada para inspirar tu próxima elección</h2>
                <p>
                  Descubre productos destacados, categorías y presentaciones en una
                  composición más rica, dinámica y fácil de recorrer.
                </p>
              </div>
              <a href="#catalogo" className="text-link">
                Ver colección completa <Icon name="arrowRight" size={17} />
              </a>
            </div>

            <div className="editorial-grid">
              {editorialProducts.map((product, index) => (
                <Link
                  href={`/producto/${encodeURIComponent(product.id)}`}
                  className={`editorial-card editorial-card-${index + 1}`}
                  key={product.id}
                >
                  <img src={product.imagen} alt={product.nombre} />
                  <div className="editorial-shade" />
                  <span className="editorial-index">0{index + 1}</span>
                  <div className="editorial-copy">
                    <small>{product.categoria}</small>
                    <strong>{product.nombre}</strong>
                    <span>Conocer producto <Icon name="arrowRight" size={15} /></span>
                  </div>
                </Link>
              ))}
            </div>

            {categoryCards.length > 0 && (
              <div className="category-showcase">
                {categoryCards.map(({ category, product }) => (
                  <button
                    key={category}
                    className="category-visual-card"
                    onClick={() => {
                      setFilter(category);
                      document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <img src={product.imagen} alt="" />
                    <span className="category-visual-shade" />
                    <span className="category-visual-copy">
                      <small>Explorar categoría</small>
                      <strong>{category}</strong>
                    </span>
                    <span className="category-visual-arrow"><Icon name="arrowRight" size={17} /></span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section catalog-section catalog-section-redesign" id="catalogo">
          <div className="catalog-backdrop-word" aria-hidden="true">GUTI</div>
          <div className="container">
            <div className="section-heading catalog-heading-redesign">
              <div>
                <span className="eyebrow">Colección GutiSupplements</span>
                <h2>Encuentra tu próximo aliado</h2>
                <p>
                  Consulta descripción, presentación, precio y disponibilidad antes de
                  enviar tu solicitud directa.
                </p>
              </div>
              <div className="catalog-search">
                <Icon name="search" size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar producto o categoría"
                  aria-label="Buscar productos"
                />
              </div>
            </div>

            <div className="catalog-toolbar catalog-toolbar-redesign">
              <div className="filters" aria-label="Filtrar por categoría">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`filter-chip ${filter === category ? 'active' : ''}`}
                    onClick={() => setFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <span className="results-count">
                {filteredProducts.length} producto{filteredProducts.length === 1 ? '' : 's'}
              </span>
            </div>

            {loading ? (
              <Loader label="Preparando el catálogo..." />
            ) : filteredProducts.length > 0 ? (
              <div className="grid-products grid-products-redesign">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-results">
                <span className="empty-icon"><Icon name="search" size={30} /></span>
                <h3>No encontramos coincidencias</h3>
                <p>Prueba otra palabra o selecciona una categoría diferente.</p>
                <button className="btn btn-outline" onClick={() => { setSearch(''); setFilter('Todos'); }}>
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="section experience-gallery-section" id="experiencia">
          <div className="container experience-gallery-grid">
            <div className="experience-collage">
              <div className="experience-image experience-image-large">
                <img src={getVisualProduct(1).imagen} alt={getVisualProduct(1).nombre} />
              </div>
              <div className="experience-image experience-image-small">
                <img src={getVisualProduct(2).imagen} alt={getVisualProduct(2).nombre} />
              </div>
              <div className="experience-logo-card">
                <img src="/guti-logo.png" alt="" />
                <span>GutiSupplements</span>
                <small>Performance · Wellness</small>
              </div>
              <div className="experience-number-card">
                <strong>01</strong>
                <span>Explora con calma</span>
              </div>
            </div>

            <div className="experience-content">
              <span className="eyebrow">Más claridad, más confianza</span>
              <h2>Una experiencia que te muestra todo antes de solicitar.</h2>
              <p>
                Cada ficha está pensada para ayudarte a comparar, entender la presentación
                y revisar la disponibilidad sin perderte entre pantallas vacías o información dispersa.
              </p>
              <div className="experience-list">
                <article>
                  <span>01</span>
                  <div><strong>Información visual</strong><p>Imágenes amplias, categorías claras y datos esenciales a la vista.</p></div>
                </article>
                <article>
                  <span>02</span>
                  <div><strong>Solicitud directa</strong><p>Elige tu producto y completa únicamente los datos necesarios.</p></div>
                </article>
                <article>
                  <span>03</span>
                  <div><strong>Confirmación humana</strong><p>El equipo valida stock, entrega y método de pago contigo.</p></div>
                </article>
              </div>
              <a href="#catalogo" className="btn btn-primary">
                Empezar a explorar <Icon name="arrowRight" size={18} />
              </a>
            </div>
          </div>
        </section>

        <section className="section process-section" id="asesoria">
          <div className="container">
            <div className="process-header">
              <div>
                <span className="eyebrow">Tu compra, paso a paso</span>
                <h2>Un proceso simple con una presentación extraordinaria.</h2>
              </div>
              <p>
                Sin cobros automáticos inesperados. Tú eliges, envías la solicitud y recibes
                la confirmación con toda la información organizada.
              </p>
            </div>

            <div className="process-grid">
              <article>
                <div className="process-card-top"><span>01</span><Icon name="search" size={24} /></div>
                <h3>Descubre</h3>
                <p>Explora el catálogo y abre la ficha completa del producto que te interesa.</p>
              </article>
              <article>
                <div className="process-card-top"><span>02</span><Icon name="products" size={24} /></div>
                <h3>Selecciona</h3>
                <p>Revisa presentación, precio y disponibilidad antes de continuar.</p>
              </article>
              <article>
                <div className="process-card-top"><span>03</span><Icon name="message" size={24} /></div>
                <h3>Solicita</h3>
                <p>Completa el formulario breve con tus datos esenciales de entrega.</p>
              </article>
              <article>
                <div className="process-card-top"><span>04</span><Icon name="check" size={24} /></div>
                <h3>Confirma</h3>
                <p>Recibe atención por WhatsApp y coordina cada detalle de tu pedido.</p>
              </article>
            </div>

            <div className="process-cta-card">
              <div className="process-cta-images">
                {[0, 1, 2].map((index) => (
                  <img key={index} src={getVisualProduct(index).imagen} alt="" />
                ))}
              </div>
              <div>
                <small>Todo comienza con una buena elección</small>
                <strong>Tu próxima rutina puede empezar aquí.</strong>
              </div>
              <a href="#catalogo" className="btn btn-primary">
                Ver productos <Icon name="arrowRight" size={17} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer footer-redesign">
        <div className="container footer-showcase">
          <div className="footer-brand-large">
            <img src="/guti-logo.png" alt="GutiSupplements" />
            <div>
              <span className="eyebrow">Performance · Wellness</span>
              <strong>GutiSupplements</strong>
              <p>Una selección premium, una experiencia clara y una atención más humana.</p>
            </div>
          </div>
          <div className="footer-navigation">
            <div><small>Explorar</small><a href="#catalogo">Catálogo</a><a href="#colecciones">Colecciones</a></div>
            <div><small>Experiencia</small><a href="#experiencia">Cómo funciona</a><a href="#asesoria">Proceso de compra</a></div>
            <div><small>Gestión</small><a href="/admin">Administración</a><a href="#inicio">Volver arriba</a></div>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>© {new Date().getFullYear()} GutiSupplements. Todos los derechos reservados.</p>
          <span>Diseñado para una experiencia de compra más completa.</span>
        </div>
      </footer>
    </>
  );
}
