import apiClient from './api';
import type { Order, CreateOrder, UpdateOrderStatus, OrderList, PagedResult } from '../types/api';

export const orderService = {
  // Listar pedidos com paginação, filtros e ordenação
  async list(params?: {
    page?: number;
    pageSize?: number;
    customerId?: number;
    status?: number;
    sortBy?: string;
    sortDescending?: boolean;
  }): Promise<PagedResult<OrderList>> {
    const response = await apiClient.get<PagedResult<OrderList>>('/orders', { 
      params: {
        pageNumber: params?.page,
        pageSize: params?.pageSize,
        searchTerm: params?.customerId ? params.customerId.toString() : undefined,
        sortBy: params?.sortBy,
        sortDescending: params?.sortDescending,
      }
    });
    return response.data;
  },

  // Buscar pedido por ID
  async getById(id: number): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data as Order;
  },

  // Criar pedido
  async create(data: CreateOrder): Promise<Order> {
    const response = await apiClient.post<Order>('/orders', data);
    return response.data as Order;
  },

  // Atualizar status do pedido
  async updateStatus(id: number, data: UpdateOrderStatus): Promise<Order> {
    const response = await apiClient.patch<Order>(`/orders/${id}/status`, data);
    return response.data as Order;
  },
};

