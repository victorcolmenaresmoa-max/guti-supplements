import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GutiSupplements | Suplementos Premium',
  description:
    'Catálogo premium de suplementos con atención personalizada, pedidos en USD y confirmación directa.',
  icons: {
    icon: '/guti-logo.png',
    apple: '/guti-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
