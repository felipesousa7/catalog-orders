# Frontend - Catalog Orders

Frontend desenvolvido em React 18+ com TypeScript, Vite e Material-UI.

## 📋 Índice

- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Executar](#como-executar)
- [Funcionalidades](#funcionalidades)
- [Decisões Técnicas](#decisões-técnicas)

## 🛠 Stack Tecnológica

- **React 19.2.0** - Biblioteca JavaScript para interfaces
- **TypeScript 5.9.3** - Superset tipado do JavaScript
- **Vite 7.2.4** - Build tool e dev server
- **Material-UI (MUI) 5.x** - Biblioteca de componentes
- **React Router DOM 6.x** - Roteamento
- **Axios** - Cliente HTTP

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   └── layout/        # Layout components (Navbar)
│   ├── pages/             # Páginas principais
│   │   ├── ProductsPage.tsx
│   │   ├── CustomersPage.tsx
│   │   ├── OrdersPage.tsx
│   │   └── CreateOrderPage.tsx
│   ├── services/          # Serviços de API
│   │   ├── api.ts         # Configuração do Axios
│   │   ├── productService.ts
│   │   ├── customerService.ts
│   │   └── orderService.ts
│   ├── types/             # Tipos TypeScript
│   │   └── api.ts         # Tipos da API
│   ├── theme/             # Tema do Material-UI
│   │   └── theme.ts
│   ├── App.tsx            # Componente principal
│   └── main.tsx           # Entry point
├── Dockerfile
└── README.md
```

## 🚀 Como Executar

### Desenvolvimento Local

1. Instalar dependências:
```bash
npm install
```

2. Executar em modo desenvolvimento:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

Os arquivos serão gerados em `dist/`

### Executar com Docker

```bash
docker-compose up frontend
```

## ✨ Funcionalidades

### Produtos
- ✅ Listagem com paginação
- ✅ Filtros por nome, SKU e status (ativo/inativo)
- ✅ Criação de produtos
- ✅ Edição de produtos
- ✅ Exclusão de produtos
- ✅ Validação de formulários

### Clientes
- ✅ Listagem com paginação
- ✅ Filtros por nome e email
- ✅ Criação de clientes
- ✅ Edição de clientes
- ✅ Exclusão de clientes
- ✅ Validação de formulários

### Pedidos
- ✅ Listagem com paginação
- ✅ Filtro por status
- ✅ Criação de pedidos com:
  - Busca de produtos (autocomplete/typeahead)
  - Seleção de cliente
  - Cálculo automático de totais
  - Validação de estoque
- ✅ Visualização de status (Criado, Pago, Cancelado)

## 🎨 Decisões Técnicas

### Material-UI
- Escolhido por ser uma biblioteca madura e completa
- Componentes acessíveis por padrão
- Suporte a temas customizáveis
- Documentação excelente

### Axios com Interceptors
- **Request Interceptor**: Adiciona automaticamente `Idempotency-Key` para requisições POST/PUT/PATCH
- **Response Interceptor**: Extrai `data` do envelope da API e trata erros padronizados

### TypeScript
- Tipagem forte para melhor DX e detecção de erros
- Tipos sincronizados com os DTOs do backend

### Roteamento
- React Router DOM para navegação SPA
- Rotas protegidas e navegação programática

### Autocomplete para Produtos
- Implementado com Material-UI Autocomplete
- Busca com debounce (300ms)
- Exibe informações relevantes (nome, SKU, preço, estoque)
- Validação de estoque antes de adicionar ao pedido

### Tratamento de Erros
- Interceptor global do Axios captura erros da API
- Exibição de mensagens de erro amigáveis
- Alertas do Material-UI para feedback visual

### Acessibilidade
- Componentes semânticos do Material-UI
- Labels e ARIA attributes
- Navegação por teclado suportada
- Contraste adequado de cores

## 🔧 Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

**Nota**: Em produção (Docker), o nginx faz proxy de `/api` para o backend automaticamente.

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa ESLint

## 🐳 Docker

O Dockerfile usa multi-stage build:
1. **Build stage**: Instala dependências e faz build
2. **Production stage**: Serve arquivos estáticos com nginx

Nginx configurado para:
- SPA routing (todas as rotas redirecionam para `index.html`)
- Proxy de `/api` para o backend
