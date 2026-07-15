/**
 * =====================================================================
 * GUTISUPPLEMENTS - Google Sheets API
 * =====================================================================
 * Pestañas utilizadas:
 *   Productos
 *   Pedidos
 *
 * El script crea las pestañas y agrega automáticamente cualquier columna
 * nueva que falte. Esto permite actualizar una hoja que ya estaba usando
 * una versión anterior del proyecto sin perder sus datos.
 * =====================================================================
 */

// Debe coincidir exactamente con NEXT_PUBLIC_ADMIN_TOKEN en Vercel.
const ADMIN_TOKEN = 'un-token-secreto-largo-y-dificil-de-adivinar';

// ID de la hoja de Google Sheets, ubicado entre /d/ y /edit en su URL.
const SPREADSHEET_ID = 'PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET';

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
  'Presentacion',
  'Beneficios',
  'ModoUso',
  'Ingredientes',
  'Destacado',
];

const ORDER_HEADERS = [
  'ID',
  'Fecha',
  'Cliente',
  'Telefono',
  'Email',
  'Ubicacion',
  'Direccion',
  'MetodoEntrega',
  'MetodoPago',
  'Notas',
  'Items',
  'Total',
  'Estado',
];

const VALID_ORDER_STATUSES = [
  'Pendiente',
  'Contactado',
  'Confirmado',
  'En preparación',
  'Enviado',
  'Entregado',
  'Cancelado',
];

/**
 * Ejecuta esta función una sola vez desde el editor de Apps Script después
 * de configurar SPREADSHEET_ID y ADMIN_TOKEN. Crea las pestañas necesarias
 * y agrega las columnas faltantes sin eliminar pedidos ni productos previos.
 */
function setupGutiSupplements() {
  const spreadsheet = getSpreadsheet_();
  const productsSheet = getSheet_(SHEET_PRODUCTOS, PRODUCT_HEADERS);
  const ordersSheet = getSheet_(SHEET_PEDIDOS, ORDER_HEADERS);
  SpreadsheetApp.flush();

  const result = {
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    spreadsheetUrl: spreadsheet.getUrl(),
    productsSheet: productsSheet.getName(),
    ordersSheet: ordersSheet.getName(),
    orderHeaders: getHeaders_(ordersSheet),
  };

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

// ---------------------------------------------------------------------
// Utilidades de hojas
// ---------------------------------------------------------------------

function getSpreadsheet_() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET') {
    throw new Error('Debes configurar SPREADSHEET_ID dentro de Codigo.gs.');
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet_(name, requiredHeaders) {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    sheet.setFrozenRows(1);
    formatHeader_(sheet, requiredHeaders.length);
    return sheet;
  }

  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const currentHeaders = sheet
    .getRange(1, 1, 1, lastColumn)
    .getValues()[0]
    .map(function (value) {
      return String(value || '').trim();
    });

  let changed = false;
  requiredHeaders.forEach(function (header) {
    if (currentHeaders.indexOf(header) === -1) {
      currentHeaders.push(header);
      changed = true;
    }
  });

  if (changed) {
    sheet.getRange(1, 1, 1, currentHeaders.length).setValues([currentHeaders]);
    sheet.setFrozenRows(1);
    formatHeader_(sheet, currentHeaders.length);
  }

  return sheet;
}

function formatHeader_(sheet, columns) {
  sheet
    .getRange(1, 1, 1, columns)
    .setFontWeight('bold')
    .setBackground('#6b0b2d')
    .setFontColor('#ffffff');
}

function getHeaders_(sheet) {
  if (sheet.getLastColumn() === 0) return [];
  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map(function (value) {
      return String(value || '').trim();
    });
}

function getHeaderMap_(headers) {
  const map = {};
  headers.forEach(function (header, index) {
    map[header] = index;
  });
  return map;
}

function objectToRow_(headers, object) {
  return headers.map(function (header) {
    return object[header] !== undefined && object[header] !== null
      ? object[header]
      : '';
  });
}

function appendObject_(sheet, object) {
  const headers = getHeaders_(sheet);
  sheet.appendRow(objectToRow_(headers, object));
}

function findRowById_(sheet, id) {
  const headers = getHeaders_(sheet);
  const map = getHeaderMap_(headers);
  const idColumn = map.ID;

  if (idColumn === undefined || sheet.getLastRow() < 2) return -1;

  const values = sheet
    .getRange(2, idColumn + 1, sheet.getLastRow() - 1, 1)
    .getValues();

  for (let index = 0; index < values.length; index++) {
    if (String(values[index][0]) === String(id)) return index + 2;
  }

  return -1;
}

function updateObjectRow_(sheet, rowNumber, updates) {
  const headers = getHeaders_(sheet);
  const map = getHeaderMap_(headers);

  Object.keys(updates).forEach(function (header) {
    if (map[header] !== undefined) {
      sheet.getRange(rowNumber, map[header] + 1).setValue(updates[header]);
    }
  });
}

function generateId_() {
  return Utilities.getUuid();
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function toBoolean_(value) {
  return value === true || String(value).toLowerCase() === 'true' || String(value) === '1';
}

function safeJsonParse_(value, fallback) {
  try {
    if (typeof value === 'object' && value !== null) return value;
    return JSON.parse(String(value || ''));
  } catch (error) {
    return fallback;
  }
}

function dateToIso_(value) {
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? String(value || '') : date.toISOString();
}

// ---------------------------------------------------------------------
// Conversión de filas
// ---------------------------------------------------------------------

function rowToProduct_(row, headers) {
  const map = getHeaderMap_(headers);
  return {
    id: String(row[map.ID] || ''),
    nombre: String(row[map.Nombre] || ''),
    descripcion: String(row[map.Descripcion] || ''),
    precio: Number(row[map.Precio]) || 0,
    categoria: String(row[map.Categoria] || ''),
    imagen: String(row[map.Imagen] || ''),
    stock: Number(row[map.Stock]) || 0,
    presentacion: map.Presentacion !== undefined ? String(row[map.Presentacion] || '') : '',
    beneficios: map.Beneficios !== undefined ? String(row[map.Beneficios] || '') : '',
    modoUso: map.ModoUso !== undefined ? String(row[map.ModoUso] || '') : '',
    ingredientes: map.Ingredientes !== undefined ? String(row[map.Ingredientes] || '') : '',
    destacado: map.Destacado !== undefined ? toBoolean_(row[map.Destacado]) : false,
  };
}

function rowToOrder_(row, headers) {
  const map = getHeaderMap_(headers);
  const read = function (header) {
    return map[header] !== undefined ? row[map[header]] : '';
  };

  const legacyLocation = [read('Ciudad'), read('EstadoProvincia'), read('Pais')]
    .filter(function (value) {
      return String(value || '').trim() !== '';
    })
    .join(', ');

  return {
    id: String(read('ID') || ''),
    fecha: dateToIso_(read('Fecha')),
    cliente: String(read('Cliente') || ''),
    telefono: String(read('Telefono') || ''),
    email: String(read('Email') || ''),
    ubicacion: String(read('Ubicacion') || legacyLocation || ''),
    direccion: String(read('Direccion') || ''),
    metodoEntrega: String(read('MetodoEntrega') || ''),
    metodoPago: String(read('MetodoPago') || ''),
    notas: String(read('Notas') || ''),
    items: safeJsonParse_(read('Items'), []),
    total: Number(read('Total')) || 0,
    estado: String(read('Estado') || 'Pendiente'),
  };
}

// ---------------------------------------------------------------------
// GET público: catálogo y detalle
// ---------------------------------------------------------------------

function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || 'getProducts';

    if (action === 'getProducts') return handleGetProducts_();
    if (action === 'getProduct') return handleGetProduct_(e.parameter.id);

    return jsonResponse_({ ok: false, message: 'Acción no reconocida.' });
  } catch (error) {
    return jsonResponse_({ ok: false, message: 'Error interno: ' + error.message });
  }
}

// ---------------------------------------------------------------------
// POST: pedidos públicos y acciones privadas de administración
// ---------------------------------------------------------------------

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action;
    const adminActions = [
      'addProduct',
      'updateProduct',
      'deleteProduct',
      'getOrders',
      'updateOrderStatus',
    ];

    if (adminActions.indexOf(action) !== -1 && body.token !== ADMIN_TOKEN) {
      return jsonResponse_({ ok: false, message: 'No autorizado.' });
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
      case 'getOrders':
        return handleGetOrders_();
      case 'updateOrderStatus':
        return handleUpdateOrderStatus_(body.id, body.estado);
      default:
        return jsonResponse_({ ok: false, message: 'Acción no reconocida.' });
    }
  } catch (error) {
    return jsonResponse_({ ok: false, message: 'Error interno: ' + error.message });
  }
}

// ---------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------

function handleGetProducts_() {
  const sheet = getSheet_(SHEET_PRODUCTOS, PRODUCT_HEADERS);
  const headers = getHeaders_(sheet);

  if (sheet.getLastRow() < 2) return jsonResponse_({ ok: true, data: [] });

  const rows = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, headers.length)
    .getValues();

  const products = rows
    .map(function (row) {
      return rowToProduct_(row, headers);
    })
    .filter(function (product) {
      return product.id !== '';
    });

  return jsonResponse_({ ok: true, data: products });
}

function handleGetProduct_(id) {
  if (!id) return jsonResponse_({ ok: false, message: 'ID de producto requerido.' });

  const sheet = getSheet_(SHEET_PRODUCTOS, PRODUCT_HEADERS);
  const rowNumber = findRowById_(sheet, id);

  if (rowNumber === -1) {
    return jsonResponse_({ ok: false, message: 'Producto no encontrado.' });
  }

  const headers = getHeaders_(sheet);
  const row = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
  return jsonResponse_({ ok: true, data: rowToProduct_(row, headers) });
}

function handleAddProduct_(product) {
  if (!product || !product.nombre || product.precio === undefined) {
    return jsonResponse_({ ok: false, message: 'Datos de producto incompletos.' });
  }

  const sheet = getSheet_(SHEET_PRODUCTOS, PRODUCT_HEADERS);
  const id = generateId_();

  appendObject_(sheet, {
    ID: id,
    Nombre: product.nombre,
    Descripcion: product.descripcion || '',
    Precio: Number(product.precio) || 0,
    Categoria: product.categoria || 'General',
    Imagen: product.imagen || '',
    Stock: Number(product.stock) || 0,
    Presentacion: product.presentacion || '',
    Beneficios: product.beneficios || '',
    ModoUso: product.modoUso || '',
    Ingredientes: product.ingredientes || '',
    Destacado: Boolean(product.destacado),
  });

  return jsonResponse_({
    ok: true,
    data: Object.assign({}, product, { id: id }),
  });
}

function handleUpdateProduct_(product) {
  if (!product || !product.id) {
    return jsonResponse_({ ok: false, message: 'ID de producto requerido.' });
  }

  const sheet = getSheet_(SHEET_PRODUCTOS, PRODUCT_HEADERS);
  const rowNumber = findRowById_(sheet, product.id);

  if (rowNumber === -1) {
    return jsonResponse_({ ok: false, message: 'Producto no encontrado.' });
  }

  updateObjectRow_(sheet, rowNumber, {
    Nombre: product.nombre,
    Descripcion: product.descripcion || '',
    Precio: Number(product.precio) || 0,
    Categoria: product.categoria || 'General',
    Imagen: product.imagen || '',
    Stock: Number(product.stock) || 0,
    Presentacion: product.presentacion || '',
    Beneficios: product.beneficios || '',
    ModoUso: product.modoUso || '',
    Ingredientes: product.ingredientes || '',
    Destacado: Boolean(product.destacado),
  });

  return jsonResponse_({ ok: true, data: product });
}

function handleDeleteProduct_(id) {
  if (!id) return jsonResponse_({ ok: false, message: 'ID de producto requerido.' });

  const sheet = getSheet_(SHEET_PRODUCTOS, PRODUCT_HEADERS);
  const rowNumber = findRowById_(sheet, id);

  if (rowNumber === -1) {
    return jsonResponse_({ ok: false, message: 'Producto no encontrado.' });
  }

  sheet.deleteRow(rowNumber);
  return jsonResponse_({ ok: true, data: null });
}

// ---------------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------------

function handleCreateOrder_(order) {
  const location = order
    ? String(
        order.ubicacion ||
          [order.ciudad, order.estadoProvincia, order.pais]
            .filter(function (value) {
              return String(value || '').trim() !== '';
            })
            .join(', ') ||
          ''
      ).trim()
    : '';

  if (
    !order ||
    !String(order.cliente || '').trim() ||
    !String(order.telefono || '').trim() ||
    !location ||
    !Array.isArray(order.items) ||
    order.items.length === 0
  ) {
    return jsonResponse_({ ok: false, message: 'Datos de pedido incompletos.' });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) {
    return jsonResponse_({
      ok: false,
      message: 'Hay varios pedidos procesándose. Inténtalo nuevamente en unos segundos.',
    });
  }

  try {
    const sheet = getSheet_(SHEET_PEDIDOS, ORDER_HEADERS);
    const id = generateId_();

    appendObject_(sheet, {
      ID: id,
      Fecha: new Date(),
      Cliente: String(order.cliente || '').trim(),
      Telefono: String(order.telefono || '').trim(),
      Email: String(order.email || '').trim(),
      Ubicacion: location,
      Direccion: String(order.direccion || '').trim(),
      MetodoEntrega: String(order.metodoEntrega || 'Por confirmar').trim(),
      MetodoPago: String(order.metodoPago || 'Por definir con el asesor').trim(),
      Notas: String(order.notas || '').trim(),
      Items: JSON.stringify(order.items),
      Total: Number(order.total) || 0,
      Estado: 'Pendiente',

      // Compatibilidad con columnas antiguas que puedan seguir en la hoja.
      Ciudad: location,
      EstadoProvincia: '',
      Pais: '',
      Cedula: '',
      TelefonoAlternativo: '',
      CodigoPostal: '',
      Referencia: '',
      HorarioContacto: '',
    });

    SpreadsheetApp.flush();

    if (findRowById_(sheet, id) === -1) {
      throw new Error('La fila del pedido no pudo verificarse después de guardarla.');
    }

    return jsonResponse_({ ok: true, data: { id: id, saved: true } });
  } finally {
    lock.releaseLock();
  }
}

function handleGetOrders_() {
  const sheet = getSheet_(SHEET_PEDIDOS, ORDER_HEADERS);
  const headers = getHeaders_(sheet);

  if (sheet.getLastRow() < 2) return jsonResponse_({ ok: true, data: [] });

  const rows = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, headers.length)
    .getValues();

  const orders = rows
    .map(function (row) {
      return rowToOrder_(row, headers);
    })
    .filter(function (order) {
      return order.id !== '';
    })
    .sort(function (a, b) {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

  return jsonResponse_({ ok: true, data: orders });
}

function handleUpdateOrderStatus_(id, status) {
  if (!id || !status) {
    return jsonResponse_({ ok: false, message: 'ID y estado son obligatorios.' });
  }

  if (VALID_ORDER_STATUSES.indexOf(status) === -1) {
    return jsonResponse_({ ok: false, message: 'Estado de pedido no válido.' });
  }

  const sheet = getSheet_(SHEET_PEDIDOS, ORDER_HEADERS);
  const rowNumber = findRowById_(sheet, id);

  if (rowNumber === -1) {
    return jsonResponse_({ ok: false, message: 'Pedido no encontrado.' });
  }

  updateObjectRow_(sheet, rowNumber, { Estado: status });

  const headers = getHeaders_(sheet);
  const row = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
  return jsonResponse_({ ok: true, data: rowToOrder_(row, headers) });
}
