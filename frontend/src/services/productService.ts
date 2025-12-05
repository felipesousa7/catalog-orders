import apiClient from './api';
import type { Product, CreateProduct, UpdateProduct, ProductList, PagedResult } from '../types/api';

export const productService = {
  // Listar produtos com paginação, filtros e ordenação
  async list(params?: {
    page?: number;
    pageSize?: number;
    name?: string;
    sku?: string;
    isActive?: boolean;
    sortBy?: string;
    sortDescending?: boolean;
  }): Promise<PagedResult<ProductList>> {
    // Combinar name e sku em searchTerm (backend busca em ambos)
    const searchTerm = params?.name || params?.sku 
      ? `${params.name || ''} ${params.sku || ''}`.trim() 
      : undefined;
    
    const response = await apiClient.get<PagedResult<ProductList>>('/products', { 
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

  // Buscar produto por ID
  async getById(id: number): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data as Product;
  },

  // Criar produto
  async create(data: CreateProduct): Promise<Product> {
    const response = await apiClient.post<Product>('/products', data);
    return response.data as Product;
  },

  // Atualizar produto
  async update(id: number, data: UpdateProduct): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, data);
    return response.data as Product;
  },

  // Deletar produto
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};

