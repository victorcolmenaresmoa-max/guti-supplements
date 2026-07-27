import {
  ApiResponse,
  OrderPayload,
  OrderRecord,
  Product,
  Promotion,
  Seller,
  StoreConfig,
} from '@/types';

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || '';
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || '';

async function gasFetch<T>(options: {
  method: 'GET' | 'POST';
  action?: string;
  query?: Record<string, string>;
  body?: Record<string, unknown>;
}): Promise<ApiResponse<T>> {
  if (!GAS_URL) {
    return {
      ok: false,
      message:
        'Falta configurar NEXT_PUBLIC_GAS_URL en las variables de entorno.',
    };
  }

  try {
    let response: Response;

    if (options.method === 'GET') {
      const url = new URL(GAS_URL);
      if (options.action) url.searchParams.set('action', options.action);
      Object.entries(options.query || {}).forEach(([key, value]) =>
        url.searchParams.set(key, value)
      );
      response = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store',
      });
    } else {
      response = await fetch(GAS_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: options.action,
          token: ADMIN_TOKEN,
          ...options.body,
        }),
      });
    }

    if (!response.ok) {
      return { ok: false, message: `Error HTTP ${response.status}` };
    }

    return (await response.json()) as ApiResponse<T>;
  } catch (error) {
    console.error('Error de red al llamar a Google Apps Script:', error);
    return {
      ok: false,
      message:
        'No se pudo conectar con el servidor. Verifica tu conexión o la URL del Web App.',
    };
  }
}

export async function getProducts(): Promise<ApiResponse<Product[]>> {
  return gasFetch<Product[]>({ method: 'GET', action: 'getProducts' });
}

export async function getProduct(id: string): Promise<ApiResponse<Product>> {
  return gasFetch<Product>({
    method: 'GET',
    action: 'getProduct',
    query: { id },
  });
}

export async function addProduct(
  product: Omit<Product, 'id'>
): Promise<ApiResponse<Product>> {
  return gasFetch<Product>({
    method: 'POST',
    action: 'addProduct',
    body: { product },
  });
}

export async function updateProduct(
  product: Product
): Promise<ApiResponse<Product>> {
  return gasFetch<Product>({
    method: 'POST',
    action: 'updateProduct',
    body: { product },
  });
}

export async function deleteProduct(id: string): Promise<ApiResponse<null>> {
  return gasFetch<null>({
    method: 'POST',
    action: 'deleteProduct',
    body: { id },
  });
}

export async function createOrder(
  order: OrderPayload
): Promise<ApiResponse<{ id: string }>> {
  return gasFetch<{ id: string }>({
    method: 'POST',
    action: 'createOrder',
    body: { order },
  });
}

export async function getOrders(): Promise<ApiResponse<OrderRecord[]>> {
  return gasFetch<OrderRecord[]>({
    method: 'POST',
    action: 'getOrders',
  });
}

export async function updateOrderStatus(
  id: string,
  estado: string
): Promise<ApiResponse<OrderRecord>> {
  return gasFetch<OrderRecord>({
    method: 'POST',
    action: 'updateOrderStatus',
    body: { id, estado },
  });
}

// ---------------------------------------------------------------------
// Promociones (ofertas / combos)
// ---------------------------------------------------------------------

export async function getPromotions(): Promise<ApiResponse<Promotion[]>> {
  return gasFetch<Promotion[]>({ method: 'GET', action: 'getPromotions' });
}

export async function addPromotion(
  promotion: Omit<Promotion, 'id'>
): Promise<ApiResponse<Promotion>> {
  return gasFetch<Promotion>({
    method: 'POST',
    action: 'addPromotion',
    body: { promotion },
  });
}

export async function updatePromotion(
  promotion: Promotion
): Promise<ApiResponse<Promotion>> {
  return gasFetch<Promotion>({
    method: 'POST',
    action: 'updatePromotion',
    body: { promotion },
  });
}

export async function deletePromotion(id: string): Promise<ApiResponse<null>> {
  return gasFetch<null>({
    method: 'POST',
    action: 'deletePromotion',
    body: { id },
  });
}

// ---------------------------------------------------------------------
// Configuración de la tienda (tasa de cambio Bs)
// ---------------------------------------------------------------------

export async function getConfig(): Promise<ApiResponse<StoreConfig>> {
  return gasFetch<StoreConfig>({ method: 'GET', action: 'getConfig' });
}

export async function updateConfig(
  config: StoreConfig
): Promise<ApiResponse<StoreConfig>> {
  return gasFetch<StoreConfig>({
    method: 'POST',
    action: 'updateConfig',
    body: { config },
  });
}


// ---------------------------------------------------------------------
// Vendedores y enlaces de referencia
// ---------------------------------------------------------------------

export async function getSellers(): Promise<ApiResponse<Seller[]>> {
  return gasFetch<Seller[]>({
    method: 'POST',
    action: 'getSellers',
  });
}

export async function addSeller(
  seller: Omit<Seller, 'id' | 'fechaCreacion'>
): Promise<ApiResponse<Seller>> {
  return gasFetch<Seller>({
    method: 'POST',
    action: 'addSeller',
    body: { seller },
  });
}

export async function updateSeller(
  seller: Seller
): Promise<ApiResponse<Seller>> {
  return gasFetch<Seller>({
    method: 'POST',
    action: 'updateSeller',
    body: { seller },
  });
}
