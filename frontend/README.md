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
│   │   ├── common/        # Componentes comuns (DataTable, SearchBar, etc)
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
├── e2e/                   # Testes end-to-end
│   ├── products.cy.ts     # Testes de produtos
│   ├── customers.cy.ts    # Testes de clientes
│   ├── orders.cy.ts       # Testes de pedidos
│   ├── support/           # Comandos customizados
│   └── cypress.config.ts  # Configuração do Cypress
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
- `npm run test:e2e` - Executa testes e2e em modo headless
- `npm run test:e2e:open` - Abre interface gráfica do Cypress

## 🧪 Testes E2E

### Pré-requisitos

Antes de executar os testes e2e, certifique-se de que:
- Backend está rodando em `http://localhost:8080`
- Frontend está rodando em `http://localhost:3000`
- Banco de dados tem dados de seed (20 produtos, 10 clientes)

### Executar Testes

**Modo headless (CI/CD):**
```bash
npm run test:e2e
```

**Modo interativo (desenvolvimento):**
```bash
npm run test:e2e:open
```

### Testes Implementados

**Produtos (`e2e/products.cy.ts`):**
- ✅ Exibição da lista de produtos
- ✅ Busca por nome e SKU
- ✅ Criação de produto
- ✅ Edição de produto
- ✅ Validação de campos obrigatórios
- ✅ Ordenação por nome e preço
- ✅ Filtro por status

**Clientes (`e2e/customers.cy.ts`):**
- ✅ Exibição da lista de clientes
- ✅ Busca por nome e email
- ✅ Criação de cliente
- ✅ Edição de cliente
- ✅ Validação de campos obrigatórios
- ✅ Validação de formato de email
- ✅ Ordenação por nome e email

**Pedidos (`e2e/orders.cy.ts`):**
- ✅ Exibição da lista de pedidos
- ✅ Filtro por status
- ✅ Ordenação por total e data
- ✅ Navegação para criar pedido
- ✅ Visualização de detalhes
- ✅ Criação de pedido completo
- ✅ Validação de seleção de cliente
- ✅ Busca e adição de produtos
- ✅ Cálculo de total
