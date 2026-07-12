# FORZA — E-commerce de Suplementos Deportivos

Aplicación Next.js 14 (App Router + TypeScript) con tema oscuro premium,
carrito de compras, checkout y panel de administración, usando **Google
Sheets + Google Apps Script como base de datos/API**.

---

## 1. Estructura del proyecto

```
ecommerce-suplementos/
├── app/
│   ├── admin/page.tsx        # Panel de administración (protegido)
│   ├── layout.tsx
│   ├── page.tsx              # Home + catálogo
│   └── globals.css           # Tema oscuro / neón
├── components/
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   ├── CartDrawer.tsx
│   ├── CheckoutForm.tsx
│   ├── AdminProductForm.tsx
│   ├── AdminProductList.tsx
│   └── Loader.tsx
├── context/
│   └── CartContext.tsx       # Estado global del carrito
├── lib/
│   └── api.ts                # Comunicación fetch con Google Apps Script
├── types/
│   └── index.ts
├── google-apps-script/
│   └── Codigo.gs             # Pega esto en tu Google Sheet
├── .env.example
├── package.json
└── next.config.js
```

---

## 2. Configurar Google Sheets + Apps Script (la "base de datos")

1. Crea una **Google Sheet nueva** (sheets.new).
2. Crea dos pestañas con **estos nombres exactos**:

   **Pestaña `Productos`** — encabezados en la fila 1:
   | ID | Nombre | Descripcion | Precio | Categoria | Imagen | Stock |

   **Pestaña `Pedidos`** — encabezados en la fila 1:
   | ID | Fecha | Cliente | Direccion | Telefono | MetodoPago | Items | Total | Estado |

   > No necesitas escribir los encabezados a mano: el script los crea
   > automáticamente la primera vez si no existen, pero es más seguro
   > crearlos tú para evitar errores de orden.

3. Ve a **Extensiones → Apps Script**.
4. Borra el código de ejemplo y pega **todo** el contenido de
   `google-apps-script/Codigo.gs`.
5. Dentro del script, cambia esta línea por un valor secreto propio:
   ```js
   const ADMIN_TOKEN = 'un-token-secreto-largo-y-dificil-de-adivinar';
   ```
6. Guarda el proyecto (icono de disco o Ctrl+S).
7. Haz clic en **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**
   - Descripción: la que quieras (ej. "API Forza v1")
   - Ejecutar como: **Yo (tu cuenta)**
   - Quién tiene acceso: **Cualquier usuario**
8. Google te pedirá autorizar permisos (acceso a tu propia hoja). Acepta.
9. Copia la URL que termina en `/exec`. Esa es tu `NEXT_PUBLIC_GAS_URL`.

**Importante:** cada vez que modifiques el código del `.gs`, debes crear
una **nueva implementación** (o "Gestionar implementaciones" → editar →
nueva versión) para que los cambios se reflejen en la URL pública.

---

## 3. Variables de entorno

Copia `.env.example` como `.env.local` para desarrollo local, y crea las
mismas variables en Vercel (Project → Settings → Environment Variables).

| Variable | Qué es | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_GAS_URL` | URL `/exec` de tu Web App de Apps Script | `https://script.google.com/macros/s/AKfycb.../exec` |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Contraseña para entrar a `/admin` en el navegador (protección simple de MVP) | `MiClaveSegura2024!` |
| `NEXT_PUBLIC_ADMIN_TOKEN` | Token secreto que el frontend envía al hacer cambios de productos. **Debe coincidir exactamente** con `ADMIN_TOKEN` dentro de `Codigo.gs` | `un-token-secreto-largo-y-dificil-de-adivinar` |

⚠️ **Nota de seguridad honesta:** como todo vive en variables
`NEXT_PUBLIC_*`, son visibles en el navegador (es una limitación
inherente de un MVP 100% frontend sin backend propio). El `ADMIN_TOKEN`
evita que cualquier persona anónima escriba en tu hoja sin conocerlo,
pero no es una seguridad de nivel producción. Para un proyecto real,
se recomendaría mover la escritura a una API intermedia (por ejemplo,
Vercel Serverless Functions) que oculte el token en el servidor.

---

## 4. Ejecutar en local

Requisitos: Node.js 18.18 o superior.

```bash
npm install
cp .env.example .env.local
# edita .env.local con tus valores reales
npm run dev
```

Abre `http://localhost:3000` para la tienda y
`http://localhost:3000/admin` para el panel de administración.

---

## 5. Subir a GitHub

```bash
git init
git add .
git commit -m "Primer commit: e-commerce FORZA"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

El `.gitignore` ya excluye `node_modules`, `.next` y los archivos
`.env*`, así que tus claves nunca se suben al repositorio.

---

## 6. Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) e importa el repositorio de
   GitHub que acabas de crear.
2. Vercel detecta automáticamente que es un proyecto **Next.js** (no
   necesitas tocar el "Build Command" ni el "Output Directory").
3. En **Environment Variables**, agrega las 3 variables de la tabla del
   punto 3 (mismos nombres y valores que usaste en `.env.local`).
4. Haz clic en **Deploy**.
5. Cuando termine, tendrás una URL pública tipo
   `https://tu-proyecto.vercel.app`.
6. La tienda estará en `/` y el panel de administración en `/admin`.

Cada vez que hagas `git push` a `main`, Vercel volverá a desplegar
automáticamente.

---

## 7. Flujo de datos (resumen técnico)

- **Catálogo:** `page.tsx` llama a `getProducts()` (GET a Apps Script
  con `?action=getProducts`) → Apps Script lee la pestaña `Productos` →
  devuelve JSON → se renderizan las `ProductCard`.
- **Carrito:** vive en `CartContext` (estado en memoria + `localStorage`
  para persistencia en el navegador del comprador).
- **Checkout:** al confirmar, `createOrder()` hace un POST con
  `action: "createOrder"` → Apps Script agrega una fila en `Pedidos`.
- **Admin:** `addProduct` / `updateProduct` / `deleteProduct` hacen POST
  incluyendo `token` → Apps Script valida el token contra `ADMIN_TOKEN`
  antes de escribir en `Productos`.
- **CORS:** todas las peticiones POST usan
  `Content-Type: text/plain;charset=utf-8` para evitar que el navegador
  dispare una petición preflight `OPTIONS` (que Apps Script no maneja).
  El body sigue siendo JSON válido, parseado en el `.gs` con
  `JSON.parse(e.postData.contents)`.

---

## 8. Personalización rápida

- **Colores/tema:** variables CSS en `app/globals.css` (`:root`), en
  especial `--accent-green`, `--accent-orange`, `--gradient-primary`.
- **Nombre de marca:** cambia "FORZA" en `Navbar.tsx`,
  `admin/page.tsx` y `layout.tsx` (metadata).
- **Productos de demostración:** editables en `FALLBACK_PRODUCTS` dentro
  de `app/page.tsx` (solo se muestran si aún no configuraste
  `NEXT_PUBLIC_GAS_URL` o si tu hoja está vacía).
