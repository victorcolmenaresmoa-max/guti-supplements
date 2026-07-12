'use client';

import { Product } from '@/types';

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

export default function AdminProductList({
  products,
  onEdit,
  onDelete,
  deletingId,
}: Props) {
  return (
    <div className="panel">
      <h3>Productos actuales ({products.length})</h3>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} style={{ color: 'var(--text-muted)' }}>
                  No hay productos todavía.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <img
                    src={
                      p.imagen ||
                      'https://placehold.co/60x60/191c24/39ff8f?text=F'
                    }
                    alt={p.nombre}
                  />
                </td>
                <td>{p.nombre}</td>
                <td>
                  <span className="badge">{p.categoria}</span>
                </td>
                <td>${p.precio.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>
                  <div className="row-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => onEdit(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(p.id)}
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? (
                        <span className="spinner" />
                      ) : (
                        'Eliminar'
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
