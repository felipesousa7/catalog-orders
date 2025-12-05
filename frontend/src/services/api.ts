import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types/api';

// URL da API: usa variável de ambiente ou padrão
// No Docker, a variável VITE_API_BASE_URL é definida no build
// Em desenvolvimento local, usa localhost:8080
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Criar instância do Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request: Adiciona Idempotency-Key se necessário
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Para métodos POST/PUT/PATCH, gerar Idempotency-Key se não existir
    if (['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '') && !config.headers['Idempotency-Key']) {
      const idempotencyKey = crypto.randomUUID();
      config.headers['Idempotency-Key'] = idempotencyKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response: Extrai data do envelope e trata erros
apiClient.interceptors.response.use(
  (response) => {
    // A resposta já vem no formato ApiResponse<T>
    const apiResponse = response.data as ApiResponse<unknown>;
    
    // Verificar se a resposta tem a estrutura esperada
    if (!apiResponse || typeof apiResponse !== 'object') {
      console.error('Resposta da API não tem formato esperado:', response.data);
      return response; // Retornar resposta original se não tiver envelope
    }
    
    // Se codRetorno !== 0, tratar como erro
    if (apiResponse.codRetorno !== 0) {
      const error = new Error(apiResponse.mensagem || 'Erro desconhecido');
      (error as any).response = response;
      return Promise.reject(error);
    }
    
    // Retornar apenas o data (pode ser null em alguns casos)
    return {
      ...response,
      data: apiResponse.data ?? null,
    };
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    // Se o erro tem a estrutura do envelope
    if (error.response?.data && typeof error.response.data === 'object' && 'cod_retorno' in error.response.data) {
      const apiResponse = error.response.data as ApiResponse<unknown>;
      const errorMessage = apiResponse.mensagem || 'Erro desconhecido';
      const customError = new Error(errorMessage);
      (customError as any).response = error.response;
      return Promise.reject(customError);
    }
    
    // Erro de rede ou outro tipo
    return Promise.reject(error);
  }
);

export default apiClient;

