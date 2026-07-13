'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminProductForm from '@/components/AdminProductForm';
import AdminProductList from '@/components/AdminProductList';
import AdminOrderList from '@/components/AdminOrderList';
import BrandLogo from '@/components/BrandLogo';
import Loader from '@/components/Loader';
import Icon from '@/components/Icons';
import {
  addProduct,
  deleteProduct,
  getOrders,
  getProducts,
  updateOrderStatus,
  updateProduct,
} from '@/lib/api';
import { OrderRecord, Product } from '@/types';

const AUTH_KEY = 'guti-supplements-admin-auth';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';

type AdminTab = 'orders' | 'products';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === 'true') setAuthenticated(true);
  }, []);

  useEffect(() => {
    if (authenticated) {
      void loadProducts();
      void loadOrders();
    }
  }, [authenticated]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    const response = await getProducts();
    if (response.ok && response.data) {
      setProducts(response.data);
    } else {
      setGlobalError(response.message || 'No se pudieron cargar los productos.');
    }
    setLoadingProducts(false);
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    const response = await getOrders();
    if (response.ok && response.data) {
      setOrders(response.data);
    } else {
      setGlobalError(response.message || 'No se pudieron cargar los pedidos.');
    }
    setLoadingOrders(false);
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!ADMIN_PASSWORD) {
      setAuthError('Falta configurar NEXT_PUBLIC_ADMIN_PASSWORD en las variables de entorno.');
      return;
    }
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('La contraseña ingresada no es correcta.');
    }
  };

  const handleAddOrUpdate = async (data: Omit<Product, 'id'>) => {
    setLoadingForm(true);
    setGlobalError('');

    const response = editingProduct
      ? await updateProduct({ ...data, id: editingProduct.id })
      : await addProduct(data);

    if (response.ok) {
      setEditingProduct(null);
      await loadProducts();
    } else {
      setGlobalError(response.message || 'No se pudo guardar el producto.');
    }
    setLoadingForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar este producto de forma permanente?')) return;
    setDeletingId(id);
    const response = await deleteProduct(id);
    if (response.ok) {
      await loadProducts();
    } else {
      setGlobalError(response.message || 'No se pudo eliminar el producto.');
    }
    setDeletingId(null);
  };

  const handleOrderStatus = async (id: string, status: string) => {
    setChangingStatusId(id);
    const previous = orders;
    setOrders((current) => current.map((order) => order.id === id ? { ...order, estado: status } : order));

    const response = await updateOrderStatus(id, status);
    if (!response.ok) {
      setOrders(previous);
      setGlobalError(response.message || 'No se pudo actualizar el estado del pedido.');
    }
    setChangingStatusId(null);
  };

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.estado === 'Pendiente').length;
    const activeOrders = orders.filter((order) => order.estado !== 'Cancelado');
    const requestedValue = activeOrders.reduce((sum, order) => sum + order.total, 0);
    const lowStock = products.filter((product) => product.stock <= 5).length;
    return { pending, requestedValue, lowStock };
  }, [orders, products]);

  if (!authenticated) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-decoration" />
        <section className="admin-login-card">
          <div className="admin-login-brand"><BrandLogo /></div>
          <span className="admin-login-icon"><Icon name="lock" size={26} /></span>
          <span className="eyebrow">Área privada</span>
          <h1>Panel administrativo</h1>
          <p>Gestiona productos, inventario y pedidos desde un solo lugar.</p>

          {authError && <div className="alert alert-error">{authError}</div>}

          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="admin-password">Contraseña</label>
              <input
                id="admin-password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg">
              Entrar al panel <Icon name="arrowRight" size={18} />
            </button>
          </form>
          <a href="/" className="admin-back-store"><Icon name="chevronLeft" size={16} /> Volver a la tienda</a>
        </section>
      </main>
    );
  }

  return (
    <div className="admin-app-shell">
      <aside className="admin-sidebar">
        <a href="/" className="admin-sidebar-brand"><BrandLogo /></a>
        <div className="admin-nav-label">Gestión</div>
        <nav className="admin-nav">
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
            <Icon name="orders" size={19} />
            <span>Pedidos</span>
            {stats.pending > 0 && <b>{stats.pending}</b>}
          </button>
          <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
            <Icon name="products" size={19} />
            <span>Productos</span>
            <b>{products.length}</b>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" className="admin-sidebar-link"><Icon name="store" size={18} /> Ver tienda</a>
          <button
            className="admin-sidebar-link"
            onClick={() => {
              sessionStorage.removeItem(AUTH_KEY);
              setAuthenticated(false);
            }}
          >
            <Icon name="logout" size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="eyebrow">GutiSupplements Admin</span>
            <h1>{activeTab === 'orders' ? 'Gestión de pedidos' : 'Gestión del catálogo'}</h1>
          </div>
          <div className="admin-topbar-actions">
            <button className="btn btn-outline btn-sm" onClick={() => activeTab === 'orders' ? void loadOrders() : void loadProducts()}>
              Actualizar
            </button>
            <a href="/" className="btn btn-primary btn-sm"><Icon name="store" size={16} /> Ver tienda</a>
          </div>
        </header>

        <div className="admin-content">
          {globalError && (
            <div className="alert alert-error admin-global-alert">
              <span>{globalError}</span>
              <button onClick={() => setGlobalError('')}><Icon name="close" size={16} /></button>
            </div>
          )}

          <section className="admin-stats-grid">
            <article>
              <span className="admin-stat-icon"><Icon name="orders" size={21} /></span>
              <div><small>Pedidos pendientes</small><strong>{stats.pending}</strong><p>Requieren contacto</p></div>
            </article>
            <article>
              <span className="admin-stat-icon"><Icon name="dollar" size={21} /></span>
              <div><small>Valor solicitado</small><strong>${stats.requestedValue.toFixed(2)}</strong><p>USD sin cancelados</p></div>
            </article>
            <article>
              <span className="admin-stat-icon"><Icon name="package" size={21} /></span>
              <div><small>Productos publicados</small><strong>{products.length}</strong><p>Catálogo activo</p></div>
            </article>
            <article>
              <span className="admin-stat-icon"><Icon name="clock" size={21} /></span>
              <div><small>Stock bajo</small><strong>{stats.lowStock}</strong><p>5 unidades o menos</p></div>
            </article>
          </section>

          {activeTab === 'orders' ? (
            loadingOrders ? <Loader label="Cargando pedidos..." /> : (
              <AdminOrderList
                orders={orders}
                changingStatusId={changingStatusId}
                onStatusChange={handleOrderStatus}
              />
            )
          ) : (
            <div className="admin-products-layout">
              <AdminProductForm
                editingProduct={editingProduct}
                onSubmit={handleAddOrUpdate}
                onCancelEdit={() => setEditingProduct(null)}
                loading={loadingForm}
              />
              {loadingProducts ? <Loader label="Cargando catálogo..." /> : (
                <AdminProductList
                  products={products}
                  onEdit={(product) => {
                    setEditingProduct(product);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
