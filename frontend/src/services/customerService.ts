import apiClient from './api';
import type { Customer, CreateCustomer, UpdateCustomer, CustomerList, PagedResult } from '../types/api';

export const customerService = {
  // Listar clientes com paginação, filtros e ordenação
  async list(params?: {
    page?: number;
    pageSize?: number;
    name?: string;
    email?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }): Promise<PagedResult<CustomerList>> {
    // Combinar name e email em searchTerm (backend busca em ambos)
    const searchTerm = params?.name || params?.email 
      ? `${params.name || ''} ${params.email || ''}`.trim() 
      : undefined;
    
    const response = await apiClient.get<PagedResult<CustomerList>>('/customers', { 
      params: {
        pageNumber: params?.page,
        pageSize: params?.pageSize,
        searchTerm,
        sortBy: params?.sortBy,
        sortDescending: params?.sortDescending,
      }
    });
    return response.data;
  },

  // Buscar cliente por ID
  async getById(id: number): Promise<Customer> {
    const response = await apiClient.get<Customer>(`/customers/${id}`);
    return response.data as Customer;
  },

  // Criar cliente
  async create(data: CreateCustomer): Promise<Customer> {
    const response = await apiClient.post<Customer>('/customers', data);
    return response.data as Customer;
  },

  // Atualizar cliente
  async update(id: number, data: UpdateCustomer): Promise<Customer> {
    const response = await apiClient.put<Customer>(`/customers/${id}`, data);
    return response.data as Customer;
  },

  // Deletar cliente
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },
};

