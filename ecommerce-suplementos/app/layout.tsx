import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'FORZA | Suplementos Deportivos Premium',
  description:
    'Creatina, Proteína Whey Isolate y Ganadores de Peso de máxima calidad. Rinde más, recupera mejor.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
