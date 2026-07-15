export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
  stock: number;
  presentacion?: string;
  beneficios?: string;
  modoUso?: string;
  ingredientes?: string;
  destacado?: boolean;
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
