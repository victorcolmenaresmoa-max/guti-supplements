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

export interface CartItem extends Product {
  cantidad: number;
}

export interface OrderItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface OrderPayload {
  cliente: string;
  cedula: string;
  email: string;
  telefono: string;
  telefonoAlternativo: string;
  pais: string;
  estadoProvincia: string;
  ciudad: string;
  codigoPostal: string;
  direccion: string;
  referencia: string;
  metodoEntrega: string;
  metodoPago: string;
  horarioContacto: string;
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
