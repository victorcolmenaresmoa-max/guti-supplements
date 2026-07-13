GutiSupplements — corrección de detalle de producto y scroll del pedido

Reemplaza únicamente estos tres archivos respetando sus rutas:

1. app/producto/[id]/page.tsx
2. components/ProductDetailView.tsx
3. app/globals.css

No necesitas reemplazar api.ts, ProductCard.tsx, CheckoutForm.tsx ni Codigo.gs para estas dos correcciones.

Qué se corrigió:
- Compatibilidad de params con las versiones modernas de Next.js.
- Normalización del ID del producto.
- Recuperación alternativa desde el catálogo completo cuando el Apps Script desplegado todavía no responde a getProduct.
- Scroll interno real en el formulario de pedido para escritorio.
- Scroll adaptable de pantalla completa en teléfonos.
