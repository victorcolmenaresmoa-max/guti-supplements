export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
  stock: number;
}

export interface CartItem extends Product {
  cantidad: number;
}

export interface OrderPayload {
  cliente: string;
  direccion: string;
  telefono: string;
  metodoPago: string;
  items: { id: string; nombre: string; precio: number; cantidad: number }[];
  total: number;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  message?: string;
}
