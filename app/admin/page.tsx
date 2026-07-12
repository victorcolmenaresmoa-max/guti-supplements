'use client';

import { useEffect, useState } from 'react';
import AdminProductForm from '@/components/AdminProductForm';
import AdminProductList from '@/components/AdminProductList';
import Loader from '@/components/Loader';
import {
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '@/lib/api';
import { Product } from '@/types';

const AUTH_KEY = 'supps-admin-auth';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    // NOTA DE SEGURIDAD: esta protección es solo client-side (MVP) y
    // NO reemplaza autenticación real. El token real que protege las
    // escrituras es NEXT_PUBLIC_ADMIN_TOKEN, validado en Codigo.gs.
    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) loadProducts();
  }, [authenticated]);

  const loadProducts = async () => {
    setLoadingList(true);
    setGlobalError('');
    const res = await getProducts();
    if (res.ok && res.data) {
      setProducts(res.data);
    } else {
      setGlobalError(res.message || 'No se pudieron cargar los productos.');
    }
    setLoadingList(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ADMIN_PASSWORD) {
      setAuthError(
        'No se configuró NEXT_PUBLIC_ADMIN_PASSWORD en las variables de entorno.'
      );
      return;
    }
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Contraseña incorrecta.');
    }
  };

  const handleAddOrUpdate = async (data: Omit<Product, 'id'>) => {
    setLoadingForm(true);
    setGlobalError('');

    const res = editingProduct
      ? await updateProduct({ ...data, id: editingProduct.id })
      : await addProduct(data);

    if (res.ok) {
      setEditingProduct(null);
      await loadProducts();
    } else {
      setGlobalError(res.message || 'No se pudo guardar el producto.');
    }
    setLoadingForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    setDeletingId(id);
    const res = await deleteProduct(id);
    if (res.ok) {
      await loadProducts();
    } else {
      setGlobalError(res.message || 'No se pudo eliminar el producto.');
    }
    setDeletingId(null);
  };

  if (!authenticated) {
    return (
      <div className="admin-shell">
        <div className="admin-login">
          <div className="admin-login-card">
            <div className="feature-icon">🔒</div>
            <h3 style={{ marginBottom: 8 }}>Acceso administrador</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              Ingresa la contraseña para gestionar el catálogo.
            </p>
            {authError && <div className="alert alert-error">{authError}</div>}
            <form onSubmit={handleLogin}>
              <div className="field">
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <span className="logo">
          FOR<span>ZA</span> · Admin
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/" className="btn btn-outline btn-sm">
            Ver tienda
          </a>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              sessionStorage.removeItem(AUTH_KEY);
              setAuthenticated(false);
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="admin-body">
        <AdminProductForm
          editingProduct={editingProduct}
          onSubmit={handleAddOrUpdate}
          onCancelEdit={() => setEditingProduct(null)}
          loading={loadingForm}
        />

        <div>
          {globalError && <div className="alert alert-error">{globalError}</div>}
          {loadingList ? (
            <Loader label="Cargando catálogo..." />
          ) : (
            <AdminProductList
              products={products}
              onEdit={(p) => setEditingProduct(p)}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
