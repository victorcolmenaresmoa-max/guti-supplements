'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/api';
import Icon from './Icons';

const INITIAL_FORM = {
  cliente: '',
  cedula: '',
  email: '',
  telefono: '',
  telefonoAlternativo: '',
  pais: '',
  estadoProvincia: '',
  ciudad: '',
  codigoPostal: '',
  direccion: '',
  referencia: '',
  metodoEntrega: 'Envío a domicilio',
  metodoPago: 'Transferencia bancaria',
  horarioContacto: 'Cualquier horario',
  notas: '',
};

export default function CheckoutForm({ onClose }: { onClose: () => void }) {
  const { items, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState('');
  const [accepted, setAccepted] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const required = [
      form.cliente,
      form.email,
      form.telefono,
      form.pais,
      form.estadoProvincia,
      form.ciudad,
      form.direccion,
    ];

    if (required.some((value) => !value.trim())) {
      setError('Completa todos los campos marcados como obligatorios.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    if (form.telefono.replace(/\D/g, '').length < 8) {
      setError('Ingresa el teléfono con código de país para poder contactarte.');
      return;
    }

    if (!accepted) {
      setError('Debes autorizar el contacto para confirmar tu pedido.');
      return;
    }

    if (items.length === 0) {
      setError('Tu pedido está vacío.');
      return;
    }

    setLoading(true);
    const response = await createOrder({
      ...form,
      items: items.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
      })),
      total: totalPrice,
    });
    setLoading(false);

    if (response.ok && response.data) {
      setSuccessId(response.data.id);
      clearCart();
    } else {
      setError(response.message || 'No fue posible registrar el pedido.');
    }
  };

  if (successId) {
    return (
      <div className="modal-panel modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card success-card">
          <span className="success-icon"><Icon name="check" size={34} /></span>
          <span className="eyebrow">Solicitud registrada</span>
          <h3>¡Gracias, {form.cliente.split(' ')[0]}!</h3>
          <p>
            Tu pedido <strong>#{successId.slice(0, 8).toUpperCase()}</strong> fue recibido.
            GutiSupplements te contactará por WhatsApp o correo para confirmar
            disponibilidad, entrega y pago.
          </p>
          <div className="success-summary">
            <span>Total estimado</span>
            <strong>${totalPrice.toFixed(2)} USD</strong>
          </div>
          <button className="btn btn-primary btn-block" onClick={onClose}>
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-panel modal-backdrop" role="dialog" aria-modal="true">
      <div className="checkout-card">
        <div className="checkout-header">
          <div>
            <span className="eyebrow">Pedido personalizado</span>
            <h3>Completa tus datos</h3>
            <p>Usaremos esta información únicamente para procesar y coordinar tu compra.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar formulario">
            <Icon name="close" size={19} />
          </button>
        </div>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            <fieldset>
              <legend><span>01</span> Información personal</legend>
              <div className="field-row">
                <div className="field field-span-2">
                  <label htmlFor="cliente">Nombre y apellido *</label>
                  <input id="cliente" name="cliente" value={form.cliente} onChange={handleChange} placeholder="Nombre completo" autoComplete="name" />
                </div>
                <div className="field">
                  <label htmlFor="cedula">Documento de identidad</label>
                  <input id="cedula" name="cedula" value={form.cedula} onChange={handleChange} placeholder="Cédula / Pasaporte" />
                </div>
                <div className="field">
                  <label htmlFor="email">Correo electrónico *</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" autoComplete="email" />
                </div>
                <div className="field">
                  <label htmlFor="telefono">WhatsApp con código de país *</label>
                  <input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} placeholder="+1 555 000 0000" autoComplete="tel" />
                </div>
                <div className="field">
                  <label htmlFor="telefonoAlternativo">Teléfono alternativo</label>
                  <input id="telefonoAlternativo" name="telefonoAlternativo" value={form.telefonoAlternativo} onChange={handleChange} placeholder="Opcional" />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend><span>02</span> Datos de entrega</legend>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="pais">País *</label>
                  <input id="pais" name="pais" value={form.pais} onChange={handleChange} placeholder="País" autoComplete="country-name" />
                </div>
                <div className="field">
                  <label htmlFor="estadoProvincia">Estado / Provincia *</label>
                  <input id="estadoProvincia" name="estadoProvincia" value={form.estadoProvincia} onChange={handleChange} placeholder="Estado o provincia" autoComplete="address-level1" />
                </div>
                <div className="field">
                  <label htmlFor="ciudad">Ciudad *</label>
                  <input id="ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Ciudad" autoComplete="address-level2" />
                </div>
                <div className="field">
                  <label htmlFor="codigoPostal">Código postal</label>
                  <input id="codigoPostal" name="codigoPostal" value={form.codigoPostal} onChange={handleChange} placeholder="Código postal" autoComplete="postal-code" />
                </div>
                <div className="field field-span-2">
                  <label htmlFor="direccion">Dirección completa *</label>
                  <textarea id="direccion" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Calle, avenida, edificio, apartamento o casa" autoComplete="street-address" />
                </div>
                <div className="field field-span-2">
                  <label htmlFor="referencia">Punto de referencia</label>
                  <input id="referencia" name="referencia" value={form.referencia} onChange={handleChange} placeholder="Información útil para ubicar la dirección" />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend><span>03</span> Preferencias del pedido</legend>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="metodoEntrega">Método de entrega *</label>
                  <select id="metodoEntrega" name="metodoEntrega" value={form.metodoEntrega} onChange={handleChange}>
                    <option>Envío a domicilio</option>
                    <option>Retiro coordinado</option>
                    <option>Agencia de encomiendas</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="metodoPago">Método de pago preferido *</label>
                  <select id="metodoPago" name="metodoPago" value={form.metodoPago} onChange={handleChange}>
                    <option>Transferencia bancaria</option>
                    <option>Zelle</option>
                    <option>Pago móvil</option>
                    <option>Efectivo en USD</option>
                    <option>Por definir con el asesor</option>
                  </select>
                </div>
                <div className="field field-span-2">
                  <label htmlFor="horarioContacto">Horario preferido para contactarte</label>
                  <select id="horarioContacto" name="horarioContacto" value={form.horarioContacto} onChange={handleChange}>
                    <option>Cualquier horario</option>
                    <option>Mañana · 8:00 a. m. – 12:00 p. m.</option>
                    <option>Tarde · 12:00 p. m. – 5:00 p. m.</option>
                    <option>Noche · 5:00 p. m. – 8:00 p. m.</option>
                  </select>
                </div>
                <div className="field field-span-2">
                  <label htmlFor="notas">Notas adicionales</label>
                  <textarea id="notas" name="notas" value={form.notas} onChange={handleChange} placeholder="Sabor preferido, dudas, instrucciones especiales u otra información relevante" />
                </div>
              </div>
            </fieldset>

            <label className="consent-row">
              <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
              <span>Autorizo a GutiSupplements a contactarme por WhatsApp, llamada o correo para confirmar este pedido.</span>
            </label>

            <div className="checkout-mobile-total">
              <span>Total estimado</span>
              <strong>${totalPrice.toFixed(2)} USD</strong>
            </div>

            <div className="checkout-actions">
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : <><Icon name="check" size={17} /> Enviar pedido</>}
              </button>
            </div>
          </form>

          <aside className="checkout-summary">
            <span className="eyebrow">Tu selección</span>
            <h4>{items.length} producto{items.length === 1 ? '' : 's'}</h4>
            <div className="checkout-summary-items">
              {items.map((item) => (
                <div className="checkout-summary-item" key={item.id}>
                  <img src={item.imagen || 'https://placehold.co/120x120/5d0a2a/fff?text=GS'} alt="" />
                  <div>
                    <strong>{item.nombre}</strong>
                    <span>{item.cantidad} × ${item.precio.toFixed(2)}</span>
                  </div>
                  <b>${(item.cantidad * item.precio).toFixed(2)}</b>
                </div>
              ))}
            </div>
            <div className="summary-divider" />
            <div className="summary-total">
              <span>Total estimado</span>
              <strong>${totalPrice.toFixed(2)} <small>USD</small></strong>
            </div>
            <div className="summary-security">
              <Icon name="shield" size={18} />
              <p>Tu solicitud no genera un cobro automático. Un asesor confirmará todos los detalles antes del pago.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
