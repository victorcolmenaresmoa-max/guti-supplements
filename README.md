# GutiSupplements — Tienda premium

Tienda en Next.js 14 + TypeScript con catálogo, vista individual de productos,
pedidos directos, administración de inventario y contacto por WhatsApp.

## Flujo del cliente

1. El cliente explora el catálogo.
2. Abre la vista individual de un producto.
3. Selecciona la cantidad.
4. Completa un formulario breve con sus datos esenciales.
5. El pedido recibe un ID único y se guarda en Google Sheets.
6. El equipo lo gestiona desde `/admin` y puede contactar al cliente por WhatsApp.

No existe carrito: cada solicitud se realiza directamente desde el producto.
Cada navegador mantiene su propio formulario y Apps Script usa `LockService`
para procesar pedidos simultáneos sin mezclar filas.

## Funciones principales

- Identidad visual de **GutiSupplements** basada en el logo borgoña.
- Precios en dólares estadounidenses (USD).
- Catálogo con búsqueda y filtros.
- Vista individual con imagen, descripción, presentación, precio, stock y cantidad.
- Formulario directo y simplificado.
- Panel `/admin` con gestión de productos y pedidos.
- Estados de pedido y mensaje de WhatsApp preconfigurado.
- Google Sheets + Google Apps Script como base de datos/API.

## Configurar Google Apps Script

1. Abre **Extensiones → Apps Script** desde la hoja correcta.
2. Reemplaza el código por `google-apps-script/Codigo.gs`.
3. Configura:

```js
const ADMIN_TOKEN = 'tu-token-secreto';
const SPREADSHEET_ID = 'ID_DE_TU_GOOGLE_SHEET';
```

4. Ejecuta `setupGutiSupplements()` una vez y autoriza el script.
5. Revisa el registro para confirmar que muestra la hoja correcta.
6. Publica una **nueva versión** como Aplicación web:
   - Ejecutar como: tú.
   - Acceso: cualquier usuario.
7. Copia la URL terminada en `/exec`.

El script conserva las columnas existentes y agrega únicamente las que falten.
Consulta `PASOS_DESPLIEGUE.txt` para la guía completa.

## Variables de entorno

```env
NEXT_PUBLIC_GAS_URL=https://script.google.com/macros/s/.../exec
NEXT_PUBLIC_ADMIN_PASSWORD=tu-clave-admin
NEXT_PUBLIC_ADMIN_TOKEN=tu-token-secreto
```

`NEXT_PUBLIC_ADMIN_TOKEN` debe coincidir exactamente con `ADMIN_TOKEN`.

## Ejecutar en local

```bash
npm install
npm run dev
```

## Desplegar en Vercel

1. Sube el proyecto a GitHub.
2. Configura las tres variables de entorno en Vercel.
3. Haz push para iniciar el despliegue.
4. Cuando cambies `Codigo.gs`, publica también una nueva versión del Web App.

## Nota de seguridad

El acceso actual a `/admin` es una protección sencilla del lado del cliente,
apropiada para una primera versión. Para una operación de mayor escala conviene
mover la autenticación y las acciones administrativas a un backend con sesiones
seguras y variables privadas.
