/**
 * =================================================================
 * FORZA SUPLEMENTOS - Backend en Google Apps Script
 * =================================================================
 * Este script convierte una Google Sheet en una API REST sencilla
 * para servir el catálogo de productos y recibir pedidos/cambios
 * desde el panel de administración.
 *
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. Crea una Google Sheet nueva.
 * 2. Crea 2 pestañas exactamente con estos nombres:
 *
 *    Pestaña "Productos" con las columnas (fila 1, en este orden):
 *    ID | Nombre | Descripcion | Precio | Categoria | Imagen | Stock
 *
 *    Pestaña "Pedidos" con las columnas (fila 1, en este orden):
 *    ID | Fecha | Cliente | Direccion | Telefono | MetodoPago | Items | Total | Estado
 *
 * 3. Ve a Extensiones > Apps Script, borra el contenido por defecto
 *    y pega TODO este archivo.
 * 4. Cambia el valor de ADMIN_TOKEN más abajo por un texto secreto
 *    largo. Debe ser EXACTAMENTE igual al valor que pongas en la
 *    variable de entorno NEXT_PUBLIC_ADMIN_TOKEN en tu proyecto Next.js.
 * 5. Haz clic en "Implementar" > "Nueva implementación".
 *    - Tipo: Aplicación web
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Quién tiene acceso: Cualquier usuario
 * 6. Copia la URL que termina en "/exec". Esa es tu NEXT_PUBLIC_GAS_URL.
 * 7. La primera vez Google pedirá autorizar permisos: acéptalos.
 * =================================================================
 */

// ⚠️ CAMBIA ESTE VALOR por un token secreto propio.
const ADMIN_TOKEN = 'un-token-secreto-largo-y-dificil-de-adivinar';

const SHEET_PRODUCTOS = 'Productos';
const SHEET_PEDIDOS = 'Pedidos';

const PRODUCT_HEADERS = [
  'ID',
  'Nombre',
  'Descripcion',
  'Precio',
  'Categoria',
  'Imagen',
  'Stock',
];

const ORDER_HEADERS = [
  'ID',
  'Fecha',
  'Cliente',
  'Direccion',
  'Telefono',
  'MetodoPago',
  'Items',
  'Total',
  'Estado',
];

// -----------------------------------------------------------------
// UTILIDADES
// -----------------------------------------------------------------

function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function generateId_() {
  return Utilities.getUuid();
}

function rowToProduct_(row) {
  return {
    id: String(row[0]),
    nombre: row[1] || '',
    descripcion: row[2] || '',
    precio: Number(row[3]) || 0,
    categoria: row[4] || '',
    imagen: row[5] || '',
    stock: Number(row[6]) || 0,
  };
}

// -----------------------------------------------------------------
// doGet - Lectura pública del catálogo
// -----------------------------------------------------------------

function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || 'getProducts';

    if (action === 'getProducts') {
      const sheet = getSheet_(SHEET_PRODUCTOS, PRODUCT_HEADERS);
      const values = sheet.getDataRange().getValues();
      const rows = values.slice(1); // quitamos encabezados
      const products = rows
        .filter((r) => r[0] !== '' && r[0] !== undefined)
        .map(rowToProduct_);
      return jsonResponse_({ ok: true, data: products });
    }

    return jsonResponse_({ ok: false, message: 'Acción no reconocida.' });
  } catch (err) {
    return jsonResponse_({ ok: false, message: 'Error interno: ' + err.message });
  }
}

// -----------------------------------------------------------------
// doPost - Escrituras: productos (admin) y pedidos (clientes)
// -----------------------------------------------------------------

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    // Los pedidos de clientes NO requieren token (cualquier comprador
    // debe poder enviar su pedido). Las acciones de administración
    // (agregar/editar/borrar producto) SÍ requieren el token secreto.
    const adminActions = ['addProduct', 'updateProduct', 'deleteProduct'];
    if (adminActions.indexOf(action) !== -1) {
      if (body.token !== ADMIN_TOKEN) {
        return jsonResponse_({ ok: false, message: 'No autorizado.' });
      }
    }

    switch (action) {
      case 'addProduct':
        return handleAddProduct_(body.product);
      case 'updateProduct':
        return handleUpdateProduct_(body.product);
      case 'deleteProduct':
        return handleDeleteProduct_(body.id);
      case 'createOrder':
        return handleCreateOrder_(body.order);
      default:
        return jsonResponse_({ ok: false, message: 'Acción no reconocida.' });
    }
  } catch (err) {
    return jsonResponse_({ ok: false, message: 'Error interno: ' + err.message });
  }
}

// -----------------------------------------------------------------
// Handlers de productos
// -----------------------------------------------------------------

function handleAddProduct_(product) {
  if (!product || !product.nombre || product.precio === undefined) {
    return jsonResponse_({ ok: false, message: 'Datos de producto incompletos.' });
  }
  const sheet = getSheet_(SHEET_PRODUCTOS, PRODUCT_HEADERS);
  const id = generateId_();
  sheet.appendRow([
    id,
    product.nombre,
    product.descripcion || '',
    Number(product.precio) || 0,
    product.categoria || 'General',
    product.imagen || '',
    Number(product.stock) || 0,
  ]);
  return jsonResponse_({ ok: true, data: { id: id, ...product } });
}

function handleUpdateProduct_(product) {
  if (!product || !product.id) {
    return jsonResponse_({ ok: false, message: 'ID de producto requerido.' });
  }
  const sheet = getSheet_(SHEET_PRODUCTOS, PRODUCT_HEADERS);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(product.id)) {
      const rowIndex = i + 1; // +1 porque las filas de sheet empiezan en 1
      sheet.getRange(rowIndex, 2).setValue(product.nombre);
      sheet.getRange(rowIndex, 3).setValue(product.descripcion || '');
      sheet.getRange(rowIndex, 4).setValue(Number(product.precio) || 0);
      sheet.getRange(rowIndex, 5).setValue(product.categoria || 'General');
      sheet.getRange(rowIndex, 6).setValue(product.imagen || '');
      sheet.getRange(rowIndex, 7).setValue(Number(product.stock) || 0);
      return jsonResponse_({ ok: true, data: product });
    }
  }
  return jsonResponse_({ ok: false, message: 'Producto no encontrado.' });
}

function handleDeleteProduct_(id) {
  if (!id) {
    return jsonResponse_({ ok: false, message: 'ID de producto requerido.' });
  }
  const sheet = getSheet_(SHEET_PRODUCTOS, PRODUCT_HEADERS);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return jsonResponse_({ ok: true, data: null });
    }
  }
  return jsonResponse_({ ok: false, message: 'Producto no encontrado.' });
}

// -----------------------------------------------------------------
// Handler de pedidos
// -----------------------------------------------------------------

function handleCreateOrder_(order) {
  if (!order || !order.cliente || !order.items || order.items.length === 0) {
    return jsonResponse_({ ok: false, message: 'Datos de pedido incompletos.' });
  }
  const sheet = getSheet_(SHEET_PEDIDOS, ORDER_HEADERS);
  const id = generateId_();
  const fecha = new Date();

  sheet.appendRow([
    id,
    fecha,
    order.cliente,
    order.direccion || '',
    order.telefono || '',
    order.metodoPago || '',
    JSON.stringify(order.items),
    Number(order.total) || 0,
    'Pendiente',
  ]);

  return jsonResponse_({ ok: true, data: { id: id } });
}
