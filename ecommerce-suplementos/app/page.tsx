'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import Loader from '@/components/Loader';
import { getProducts } from '@/lib/api';
import { Product } from '@/types';

// Datos de prueba (placeholders) que se muestran mientras carga la API real
// o si Google Apps Script aún no está configurado.
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'demo-1',
    nombre: 'Creatina Monohidratada',
    descripcion:
      'Aumenta tu fuerza y potencia muscular. 300g, 100% pura, micronizada para mejor absorción.',
    precio: 449,
    categoria: 'Fuerza',
    imagen:
      'https://images.unsplash.com/photo-1579722821273-0f6c1b5d0d0a?q=80&w=800&auto=format&fit=crop',
    stock: 25,
  },
  {
    id: 'demo-2',
    nombre: 'Proteína Whey Isolate',
    descripcion:
      'Aislado de proteína de suero de alta pureza. 25g de proteína por dosis, bajo en grasas y azúcares.',
    precio: 899,
    categoria: 'Proteína',
    imagen:
      'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=800&auto=format&fit=crop',
    stock: 18,
  },
  {
    id: 'demo-3',
    nombre: 'Ganador de Peso (Mass Gainer)',
    descripcion:
      'Sabor moderado, no excesivamente dulce. Combinación de carbohidratos y proteína para ganar masa de calidad.',
    precio: 749,
    categoria: 'Volumen',
    imagen:
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop',
    stock: 12,
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getProducts();
      if (res.ok && res.data && res.data.length > 0) {
        setProducts(res.data);
      } else {
        setProducts(FALLBACK_PRODUCTS);
        setUsingFallback(true);
        if (!res.ok) setError(res.message || '');
      }
      setLoading(false);
    })();
  }, []);

  const categorias = useMemo(() => {
    const set = new Set(products.map((p) => p.categoria).filter(Boolean));
    return ['Todos', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (filter === 'Todos') return products;
    return products.filter((p) => p.categoria === filter);
  }, [products, filter]);

  return (
    <>
      <div id="top" />
      <Navbar />
      <CartDrawer />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <span className="hero-badge">🔥 Envíos 24-48h · Calidad certificada</span>
          <h1>
            Lleva tu rendimiento al <span className="accent">siguiente nivel</span>
          </h1>
          <p>
            Suplementos deportivos de máxima pureza para atletas que no
            aceptan atajos. Fuerza, recuperación y resultados reales.
          </p>
          <div className="hero-actions">
            <a href="#catalogo" className="btn btn-primary">
              Ver catálogo
            </a>
            <a href="#ventajas" className="btn btn-outline">
              Por qué elegirnos
            </a>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <b>+12,000</b>
              <span>Clientes activos</span>
            </div>
            <div className="hero-stat">
              <b>100%</b>
              <span>Producto certificado</span>
            </div>
            <div className="hero-stat">
              <b>4.9/5</b>
              <span>Valoración media</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section className="section" id="catalogo">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Catálogo</h2>
              <p>Fórmulas diseñadas para maximizar tu progreso, sin rellenos.</p>
            </div>
            <div className="filters">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  className={`filter-chip ${filter === cat ? 'active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {usingFallback && (
            <div className="alert alert-error" style={{ marginBottom: 24 }}>
              Mostrando catálogo de demostración. Configura{' '}
              <code>NEXT_PUBLIC_GAS_URL</code> para conectar tu Google Sheet real.
              {error ? ` (${error})` : ''}
            </div>
          )}

          {loading ? (
            <Loader label="Cargando productos..." />
          ) : (
            <div className="grid-products">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* VENTAJAS */}
      <section className="section" id="ventajas">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Por qué elegir FORZA</h2>
              <p>Transparencia y calidad en cada dosis.</p>
            </div>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🧪</div>
              <h4>Pureza garantizada</h4>
              <p>Materias primas testeadas en laboratorio, libres de rellenos.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h4>Envío rápido</h4>
              <p>Recibe tu pedido en 24-48h en zonas urbanas principales.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h4>Asesoría real</h4>
              <p>Te ayudamos a elegir el suplemento correcto para tu objetivo.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer" id="contacto">
        <div className="container">
          <p>© {new Date().getFullYear()} FORZA Suplementos. Todos los derechos reservados.</p>
          <p style={{ marginTop: 6 }}>
            <a href="/admin">Acceso administrador</a>
          </p>
        </div>
      </footer>
    </>
  );
}
