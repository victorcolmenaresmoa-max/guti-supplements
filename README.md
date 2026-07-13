# GutiSupplements — Tienda premium

Frontend rediseñado en Next.js 14 + TypeScript con catálogo detallado, carrito,
formulario completo de pedidos, panel administrativo, gestión de inventario y
contacto directo por WhatsApp.

## Funciones principales

- Identidad visual completa de **GutiSupplements** basada en el logo borgoña.
- Precios mostrados exclusivamente en **dólares estadounidenses (USD)**.
- Catálogo con búsqueda y filtros por categoría.
- Página individual para cada producto con descripción amplia, beneficios,
  presentación, modo de uso e ingredientes.
- Carrito persistente en el navegador.
- Formulario de pedido con datos personales, contacto, ubicación, entrega,
  pago, horario preferido y notas.
- Panel `/admin` con:
  - resumen de pedidos e inventario;
  - creación, edición y eliminación de productos;
  - bandeja de pedidos;
  - cambio de estado del pedido;
  - botón de WhatsApp con mensaje preconfigurado;
  - opción para copiar el mensaje.
- Google Sheets + Google Apps Script como base de datos/API.

## Configurar Google Sheets

1. Crea una hoja de Google Sheets.
2. Ve a **Extensiones → Apps Script**.
3. Pega el contenido completo de `google-apps-script/Codigo.gs`.
4. Dentro de ese archivo cambia:

```js
const ADMIN_TOKEN = 'tu-token-secreto';
const SPREADSHEET_ID = 'ID_DE_TU_GOOGLE_SHEET';
```

El ID de la hoja está entre `/d/` y `/edit` en su URL.

5. Implementa el script como **Aplicación web**:
   - Ejecutar como: tú.
   - Acceso: cualquier usuario.
6. Copia la URL terminada en `/exec`.

El script crea automáticamente las pestañas `Productos` y `Pedidos`, además
de agregar columnas nuevas si tu hoja ya provenía de una versión anterior.

## Variables de entorno

Crea `.env.local` en local y las mismas variables en Vercel:

```env
NEXT_PUBLIC_GAS_URL=https://script.google.com/macros/s/.../exec
NEXT_PUBLIC_ADMIN_PASSWORD=tu-clave-admin
NEXT_PUBLIC_ADMIN_TOKEN=tu-token-secreto
```

`NEXT_PUBLIC_ADMIN_TOKEN` debe coincidir exactamente con `ADMIN_TOKEN` en
`Codigo.gs`.

## Ejecutar en local

```bash
npm install
npm run dev
```

- Tienda: `http://localhost:3000`
- Administración: `http://localhost:3000/admin`

## Desplegar en Vercel

1. Sube la carpeta a GitHub.
2. Importa el repositorio en Vercel.
3. Agrega las tres variables de entorno.
4. Haz el deploy.

Cuando modifiques `Codigo.gs`, actualiza la implementación de Apps Script con
una nueva versión para que los cambios se publiquen.

## Nota de seguridad

La contraseña del panel es una protección sencilla del lado del cliente,
apropiada para un MVP. Para una operación de mayor escala conviene mover la
autenticación y las escrituras a un backend privado con sesiones seguras.
