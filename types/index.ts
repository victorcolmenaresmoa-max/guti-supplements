export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
  /** Imágenes adicionales del mismo producto (galería). La portada sigue siendo `imagen`. */
  imagenes?: string[];
  stock: number;
  presentacion?: string;
  beneficios?: string;
  modoUso?: string;
  ingredientes?: string;
  destacado?: boolean;
}

/**
 * Oferta / combo promocional (por ejemplo "3 productos por un precio más bajo").
 */
export interface Promotion {
  id: string;
  titulo: string;
  descripcion: string;
  /** Lista de productos incluidos, un ítem por línea. */
  productos: string;
  /** Precio promocional en USD. */
  precio: number;
  /** Precio regular en USD (opcional), para mostrar el ahorro. */
  precioRegular?: number;
  imagen: string;
  activo?: boolean;
  destacado?: boolean;
}

/**
 * Configuración general de la tienda (tasa de cambio, etc.).
 */
export interface StoreConfig {
  /** Bolívares por 1 USD. Si es 0 o menor, los precios se muestran solo en USD. */
  tasaBs: number;
}

export interface OrderItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface OrderPayload {
  cliente: string;
  telefono: string;
  email: string;
  ubicacion: string;
  direccion: string;
  metodoEntrega: string;
  metodoPago: string;
  notas: string;
  items: OrderItem[];
  total: number;
}

export interface OrderRecord extends OrderPayload {
  id: string;
  fecha: string;
  estado: string;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  message?: string;
}
