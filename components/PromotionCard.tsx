'use client';

import { Promotion } from '@/types';
import Icon from './Icons';
import { useCurrency } from '@/context/CurrencyContext';
import { formatUSD, formatBs, hasRate } from '@/lib/currency';

interface Props {
  promotion: Promotion;
  onRequest: (promotion: Promotion) => void;
}

export default function PromotionCard({ promotion, onRequest }: Props) {
  const { rate } = useCurrency();

  const items = promotion.productos
    .split(/[\r\n]+/)
    .map((item) => item.trim())
    .filter((item) => item !== '');

  const hasDiscount =
    typeof promotion.precioRegular === 'number' &&
    promotion.precioRegular > promotion.precio &&
    promotion.precio > 0;

  const discountPercent = hasDiscount
    ? Math.round((1 - promotion.precio / (promotion.precioRegular as number)) * 100)
    : 0;

  return (
    <article className="promo-card">
      <div className="promo-media">
        <img
          src={
            promotion.imagen ||
            'https://placehold.co/900x600/6d0b2f/ffffff?text=Oferta+GutiSupplements'
          }
          alt={promotion.titulo}
          loading="lazy"
        />
        <span className="promo-ribbon">
          <Icon name="tag" size={13} /> Oferta
        </span>
        {hasDiscount && discountPercent > 0 && (
          <span className="promo-discount">-{discountPercent}%</span>
        )}
      </div>

      <div className="promo-body">
        <h3>{promotion.titulo}</h3>
        {promotion.descripcion && <p className="promo-desc">{promotion.descripcion}</p>}

        {items.length > 0 && (
          <ul className="promo-items">
            {items.map((item, index) => (
              <li key={index}>
                <Icon name="check" size={14} /> {item}
              </li>
            ))}
          </ul>
        )}

        <div className="promo-price-block">
          <div className="promo-price-main">
            <strong>{formatUSD(promotion.precio)}</strong>
            {hasDiscount && (
              <span className="promo-price-old">{formatUSD(promotion.precioRegular as number)}</span>
            )}
          </div>
          {hasRate(rate) && (
            <span className="promo-price-bs">{formatBs(promotion.precio, rate)}</span>
          )}
        </div>

        <button className="btn btn-primary btn-block" onClick={() => onRequest(promotion)}>
          <Icon name="gift" size={17} /> Solicitar esta oferta
        </button>
      </div>
    </article>
  );
}
