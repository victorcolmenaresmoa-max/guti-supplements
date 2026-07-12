'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types';

const EMPTY_FORM = {
  nombre: '',
  descripcion: '',
  precio: '',
  categoria: '',
  imagen: '',
  stock: '',
};

interface Props {
  editingProduct: Product | null;
  onSubmit: (data: Omit<Product, 'id'>) => Promise<void>;
  onCancelEdit: () => void;
  loading: boolean;
}

export default function AdminProductForm({
  editingProduct,
  onSubmit,
  onCancelEdit,
  loading,
}: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setForm({
        nombre: editingProduct.nombre,
        descripcion: editingProduct.descripcion,
        precio: String(editingProduct.precio),
        categoria: editingProduct.categoria,
        imagen: editingProduct.imagen,
        stock: String(editingProduct.stock),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingProduct]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.nombre.trim() || !form.precio.trim()) {
      setError('Nombre y precio son obligatorios.');
      return;
    }
    const precioNum = parseFloat(form.precio);
    if (isNaN(precioNum) || precioNum < 0) {
      setError('El precio debe ser un número válido.');
      return;
    }

    await onSubmit({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: precioNum,
      categoria: form.categoria.trim() || 'General',
      imagen: form.imagen.trim(),
      stock: form.stock.trim() ? parseInt(form.stock, 10) : 0,
    });

    if (!editingProduct) setForm(EMPTY_FORM);
  };

  return (
    <div className="panel">
      <h3>{editingProduct ? 'Editar producto' : 'Agregar nuevo producto'}</h3>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Nombre *</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej. Creatina Monohidratada"
          />
        </div>

        <div className="field">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Breve descripción del producto"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Precio (MXN) *</label>
            <input
              name="precio"
              value={form.precio}
              onChange={handleChange}
              placeholder="499"
              inputMode="decimal"
            />
          </div>
          <div className="field">
            <label>Stock</label>
            <input
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="20"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="field">
          <label>Categoría</label>
          <input
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            placeholder="Proteína / Fuerza / Volumen..."
          />
        </div>

        <div className="field">
          <label>URL de la imagen</label>
          <input
            name="imagen"
            value={form.imagen}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>
        <p className="tag-input-hint">
          Puedes usar un enlace directo a imagen (Imgur, Unsplash, Drive
          público, etc.)
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          {editingProduct && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={onCancelEdit}
              disabled={loading}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ flex: 2 }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" />
            ) : editingProduct ? (
              'Guardar cambios'
            ) : (
              'Agregar producto'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
