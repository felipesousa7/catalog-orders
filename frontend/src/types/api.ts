// API Response Envelope
// Backend serializa em camelCase (padrão ASP.NET Core)
export interface ApiResponse<T> {
  codRetorno: number;
  mensagem: string | null;
  data: T | null;
}

// Order Status (usando const object ao invés de enum para compatibilidade com erasableSyntaxOnly)
export const OrderStatus = {
  CREATED: 0,
  PAID: 1,
  CANCELLED: 2,
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// Product Types
export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stockQty: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProduct {
  name: string;
  sku: string;
  price: number;
  stockQty: number;
  isActive?: boolean;
}

export interface UpdateProduct {
  name: string;
  price: number;
  stockQty: number;
  isActive: boolean;
}

export interface ProductList {
  id: number;
  name: string;
  sku: string;
  price: number;
  stockQty: number;
  isActive: boolean;
}

// Customer Types
export interface Customer {
  id: number;
  name: string;
  email: string;
  document: string;
  createdAt: string;
}

export interface CreateCustomer {
  name: string;
  email: string;
  document: string;
}

export interface UpdateCustomer {
  name: string;
  email: string;
  document: string;
}

export interface CustomerList {
  id: number;
  name: string;
  email: string;
  document: string;
}

// Order Types
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CreateOrderItem {
  productId: number;
  quantity: number;
}

export interface Order {
  id: number;
  customerId: number;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  orderItems: OrderItem[];
}

export interface CreateOrder {
  customerId: number;
  orderItems: CreateOrderItem[];
}

export interface UpdateOrderStatus {
  status: OrderStatus;
}

export interface OrderList {
  id: number;
  customerId: number;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  itemsCount: number;
}

// Pagination Types
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

