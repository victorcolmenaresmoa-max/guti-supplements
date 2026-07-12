import { ApiResponse, OrderPayload, Product } from '@/types';

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || '';
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || '';

/**
 * IMPORTANTE sobre CORS con Google Apps Script:
 * GAS no procesa correctamente las peticiones "preflight" (OPTIONS) que el
 * navegador dispara automáticamente cuando el Content-Type es
 * "application/json". Por eso, para todas las peticiones POST usamos
 * Content-Type "text/plain;charset=utf-8", lo cual el navegador considera
 * una petición "simple" y NO dispara preflight. El body sigue siendo un
 * JSON.stringify normal, y en Codigo.gs lo parseamos con JSON.parse.
 */

async function gasFetch<T>(options: {
  method: 'GET' | 'POST';
  action?: string;
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
      const url = options.action
        ? `${GAS_URL}?action=${encodeURIComponent(options.action)}`
        : GAS_URL;
      response = await fetch(url, { method: 'GET', redirect: 'follow' });
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

    const json = (await response.json()) as ApiResponse<T>;
    return json;
  } catch (error) {
    console.error('Error de red al llamar a Google Apps Script:', error);
    return {
      ok: false,
      message:
        'No se pudo conectar con el servidor. Verifica tu conexión o la URL del Web App.',
    };
  }
}

// ---------------------------------------------------------------
// PRODUCTOS
// ---------------------------------------------------------------

export async function getProducts(): Promise<ApiResponse<Product[]>> {
  return gasFetch<Product[]>({ method: 'GET', action: 'getProducts' });
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

export async function deleteProduct(
  id: string
): Promise<ApiResponse<null>> {
  return gasFetch<null>({
    method: 'POST',
    action: 'deleteProduct',
    body: { id },
  });
}

// ---------------------------------------------------------------
// PEDIDOS
// ---------------------------------------------------------------

export async function createOrder(
  order: OrderPayload
): Promise<ApiResponse<{ id: string }>> {
  return gasFetch<{ id: string }>({
    method: 'POST',
    action: 'createOrder',
    body: { order },
  });
}
