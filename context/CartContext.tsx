'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { CartItem, Product } from '@/types';

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number, openAfterAdd?: boolean) => void;
  removeFromCart: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'guti-supplements-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (error) {
      console.warn('No se pudo leer el carrito guardado', error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addToCart = (
    product: Product,
    quantity = 1,
    openAfterAdd = true
  ) => {
    const safeQuantity = Math.max(1, Math.floor(quantity));

    setItems((previous) => {
      const existing = previous.find((item) => item.id === product.id);
      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? {
                ...item,
                cantidad: Math.min(
                  product.stock > 0 ? product.stock : item.cantidad + safeQuantity,
                  item.cantidad + safeQuantity
                ),
              }
            : item
        );
      }
      return [
        ...previous,
        {
          ...product,
          cantidad: Math.min(product.stock > 0 ? product.stock : safeQuantity, safeQuantity),
        },
      ];
    });

    if (openAfterAdd) setIsOpen(true);
  };

  const removeFromCart = (id: string) =>
    setItems((previous) => previous.filter((item) => item.id !== id));

  const increaseQty = (id: string) =>
    setItems((previous) =>
      previous.map((item) =>
        item.id === id && item.cantidad < item.stock
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );

  const decreaseQty = (id: string) =>
    setItems((previous) =>
      previous
        .map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
        )
        .filter((item) => item.cantidad > 0)
    );

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.cantidad, 0),
    [items]
  );

  const totalPrice = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.cantidad * item.precio,
        0
      ),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        totalItems,
        totalPrice,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de <CartProvider>');
  }
  return context;
}
