'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/api';

export default function CheckoutForm({ onClose }: { onClose: () => void }) {
  const { items, totalPrice, clearCart } = useCart();

  const [form, setForm] = useState({
    cliente: '',
    direccion: '',
    telefono: '',
    metodoPago: 'Transferencia',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.cliente.trim() || !form.direccion.trim() || !form.telefono.trim()) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (items.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }

    setLoading(true);
    const res = await createOrder({
      cliente: form.cliente,
      direccion: form.direccion,
      telefono: form.telefono,
      metodoPago: form.metodoPago,
      items: items.map((i) => ({
        id: i.id,
        nombre: i.nombre,
        precio: i.precio,
        cantidad: i.cantidad,
      })),
      total: totalPrice,
    });
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      clearCart();
    } else {
      setError(res.message || 'Ocurrió un error al enviar tu pedido.');
    }
  };

  if (success) {
    return (
      <div className="modal-panel" role="dialog" aria-modal="true">
        <div className="modal-card" style={{ textAlign: 'center' }}>
          <div
            className="feature-icon"
            style={{ margin: '0 auto 18px' }}
          >
            ✅
          </div>
          <h3>¡Pedido recibido!</h3>
          <p>
            Gracias {form.cliente}, hemos registrado tu pedido correctamente.
            Te contactaremos al {form.telefono} para confirmar el pago y el
            envío.
          </p>
          <button className="btn btn-primary btn-block" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-panel" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h3>Finalizar compra</h3>
        <p>Completa tus datos y confirmaremos tu pedido por teléfono.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nombre completo *</label>
            <input
              name="cliente"
              value={form.cliente}
              onChange={handleChange}
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div className="field">
            <label>Dirección de envío *</label>
            <textarea
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Calle, número, colonia, ciudad, CP"
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Teléfono *</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="55 1234 5678"
              />
            </div>
            <div className="field">
              <label>Método de pago *</label>
              <select
                name="metodoPago"
                value={form.metodoPago}
                onChange={handleChange}
              >
                <option>Transferencia</option>
                <option>Tarjeta contra entrega</option>
                <option>Efectivo contra entrega</option>
              </select>
            </div>
          </div>

          <div
            className="cart-total-row"
            style={{ marginBottom: 18 }}
          >
            <span>Total a pagar</span>
            <span>${totalPrice.toFixed(2)} MXN</span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={onClose}
              disabled={loading}
            >
              Volver
            </button>
            <button
              type="submit"
              className="btn btn-cta"
              style={{ flex: 2 }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'Confirmar pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
