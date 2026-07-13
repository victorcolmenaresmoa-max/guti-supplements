'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
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

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main>
        <section className="hero" id="inicio">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="container hero-grid">
            <div className="hero-content">
              <span className="hero-badge">
                <Icon name="sparkles" size={15} /> Selección premium de suplementos
              </span>
              <h1>
                Tu progreso merece una elección <em>más inteligente.</em>
              </h1>
              <p>
                Descubre productos cuidadosamente seleccionados y recibe atención
                personalizada para construir un pedido alineado con tus objetivos.
              </p>
              <div className="hero-actions">
                <a href="#catalogo" className="btn btn-primary btn-lg">
                  Explorar catálogo <Icon name="arrowRight" size={18} />
                </a>
                <a href="#asesoria" className="btn btn-outline btn-lg">
                  Conocer la experiencia
                </a>
              </div>

              <div className="hero-trust-row">
                <span><Icon name="shield" size={18} /> Atención segura</span>
                <span><Icon name="message" size={18} /> Confirmación personal</span>
                <span><Icon name="dollar" size={18} /> Precios en USD</span>
              </div>
            </div>

            <div className="hero-visual" aria-label="GutiSupplements">
              <div className="hero-logo-halo">
                <img src="/guti-logo.png" alt="GutiSupplements" />
              </div>
              <div className="floating-card floating-card-top">
                <span className="floating-icon"><Icon name="shield" size={19} /></span>
                <div><strong>Compra acompañada</strong><small>Confirmamos cada detalle</small></div>
              </div>
              <div className="floating-card floating-card-bottom">
                <span className="floating-icon"><Icon name="package" size={19} /></span>
                <div><strong>Catálogo curado</strong><small>Información amplia y clara</small></div>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-strip" id="experiencia">
          <div className="container trust-strip-grid">
            <article>
              <span><Icon name="shield" size={23} /></span>
              <div><strong>Selección responsable</strong><p>Información transparente para elegir con mayor confianza.</p></div>
            </article>
            <article>
              <span><Icon name="message" size={23} /></span>
              <div><strong>Atención personalizada</strong><p>Un asesor revisa tu solicitud antes de confirmar la compra.</p></div>
            </article>
            <article>
              <span><Icon name="truck" size={23} /></span>
              <div><strong>Entrega coordinada</strong><p>Disponibilidad, ubicación y método de envío se validan contigo.</p></div>
            </article>
          </div>
        </section>

        <section className="section catalog-section" id="catalogo">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Colección GutiSupplements</span>
                <h2>Encuentra tu próximo aliado</h2>
                <p>
                  Entra en cada producto para consultar beneficios, presentación,
                  modo de uso, ingredientes y disponibilidad.
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

            <div className="catalog-toolbar">
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
              <div className="grid-products">
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

        <section className="section advisory-section" id="asesoria">
          <div className="container advisory-grid">
            <div className="advisory-visual">
              <div className="advisory-monogram">GS</div>
              <div className="advisory-card">
                <span className="eyebrow">Proceso claro</span>
                <strong>De la selección a la confirmación</strong>
                <ol>
                  <li><span>1</span> Explora la información completa.</li>
                  <li><span>2</span> Añade tus productos al pedido.</li>
                  <li><span>3</span> Completa tus datos de entrega.</li>
                  <li><span>4</span> Recibe confirmación por WhatsApp.</li>
                </ol>
              </div>
            </div>

            <div className="advisory-content">
              <span className="eyebrow">Una experiencia más humana</span>
              <h2>No solo compras un producto. Recibes acompañamiento.</h2>
              <p>
                Cada solicitud llega directamente al panel de GutiSupplements.
                El equipo puede revisar los productos elegidos, tus datos de entrega
                y preferencias para contactarte con toda la información preparada.
              </p>
              <div className="advisory-points">
                <div><Icon name="check" size={17} /><span>Sin cobros automáticos inesperados.</span></div>
                <div><Icon name="check" size={17} /><span>Confirmación de stock antes del pago.</span></div>
                <div><Icon name="check" size={17} /><span>Comunicación directa y organizada.</span></div>
              </div>
              <a href="#catalogo" className="btn btn-primary">
                Comenzar mi pedido <Icon name="arrowRight" size={18} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <img src="/guti-logo.png" alt="" />
            <div><strong>GutiSupplements</strong><p>Performance · Wellness · Atención personalizada</p></div>
          </div>
          <div className="footer-links">
            <a href="#catalogo">Catálogo</a>
            <a href="#experiencia">Experiencia</a>
            <a href="#asesoria">Cómo comprar</a>
            <a href="/admin">Administración</a>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} GutiSupplements. Todos los derechos reservados.</p>
        </div>
      </footer>
    </>
  );
}
