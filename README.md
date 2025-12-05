# Catalog Orders - Sistema de Catálogo e Pedidos

Sistema full-stack para gestão de catálogo de produtos, clientes e pedidos, desenvolvido como desafio técnico.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Como Executar](#como-executar)
- [API Endpoints](#api-endpoints)
- [Testes](#testes)
- [Decisões Técnicas](#decisões-técnicas)
- [Uso de IA](#uso-de-ia)

## 🎯 Sobre o Projeto

Sistema completo de gestão de catálogo e pedidos que permite:
- **CRUD** de produtos e clientes
- **Criação de pedidos** com validação de estoque
- **Idempotência** via header `Idempotency-Key`
- **Transações atômicas** para garantia de consistência
- **Logs estruturados** para observabilidade

## 🛠 Stack Tecnológica

### Backend
- **.NET 8** - ASP.NET Core Web API
- **Entity Framework Core 8.0** - ORM para PostgreSQL
- **PostgreSQL 16** - Banco de dados relacional
- **Serilog** - Logs estruturados
- **AutoMapper** - Mapeamento DTO ↔ Entity
- **FluentValidation** - Validação de entrada
- **xUnit** - Framework de testes unitários

### Frontend
- **React 19.2.0** com TypeScript 5.9.3
- **Vite 7.2.4** - Build tool e dev server
- **Material-UI (MUI) 5.x** - Biblioteca de componentes
- **React Router DOM 6.x** - Roteamento
- **Axios** - Cliente HTTP com interceptors

### Infraestrutura
- **Docker** & **Docker Compose** - Containerização
- **PostgreSQL** - Banco de dados

## 🏗 Arquitetura

O projeto segue os princípios de **Clean Architecture** e **SOLID**:

```
┌─────────────────────────────────────┐
│         API Layer                   │
│  (Controllers, Middleware, Filters)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Application Layer               │
│  (Use Cases, DTOs, Validators)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Domain Layer                  │
│  (Entities, Interfaces, Enums)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Infrastructure Layer             │
│  (EF Core, Repositories, Services)  │
└─────────────────────────────────────┘
```

### Camadas

1. **Domain**: Entidades, interfaces de repositório, enums
   - Sem dependências externas
   - Regras de negócio puras

2. **Application**: Use Cases, DTOs, Validators, Mappings
   - Depende apenas do Domain
   - Orquestra a lógica de negócio

3. **Infrastructure**: Implementações concretas
   - EF Core, Repositories, DbContext
   - Implementa interfaces do Domain

4. **API**: Controllers, Middleware, Filters
   - Depende de Application e Infrastructure
   - Expõe endpoints HTTP

## 📁 Estrutura do Projeto

```
.
├── backend/
│   ├── src/
│   │   ├── CatalogOrders.Api/          # Camada de apresentação
│   │   ├── CatalogOrders.Application/   # Casos de uso, DTOs
│   │   ├── CatalogOrders.Domain/        # Entidades, interfaces
│   │   └── CatalogOrders.Infrastructure/ # EF Core, repositórios
│   ├── tests/
│   │   └── CatalogOrders.Tests/         # Testes unitários
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas principais
│   │   ├── services/     # Serviços de API
│   │   ├── types/         # Tipos TypeScript
│   │   └── theme/         # Tema Material-UI
│   ├── Dockerfile
│   └── README.md
├── docker-compose.yml
├── .env.example
└── README.md
```

## 📦 Pré-requisitos

- **Docker** e **Docker Compose** instalados
- **.NET 8 SDK** (opcional, para desenvolvimento local)
- **Node.js 18+** (opcional, para desenvolvimento local)

## 🚀 Como Executar

### Opção 1: Docker Compose (Recomendado)

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd catalog-orders
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite o .env se necessário (valores padrão já funcionam)
   ```

3. **Suba os serviços:**
   ```bash
   docker-compose up -d
   ```

4. **Acesse a aplicação:**
   - **Frontend**: http://localhost:3000
   - **API**: http://localhost:8080
   - **Swagger**: http://localhost:8080/swagger

5. **Ver logs:**
   ```bash
   docker-compose logs -f backend
   ```

6. **Parar os serviços:**
   ```bash
   docker-compose down
   ```

### Opção 2: Desenvolvimento Local

#### Backend

1. **Configure o PostgreSQL** (ou use Docker apenas para o banco):
   ```bash
   docker-compose up -d postgres
   ```

2. **Configure a connection string** no `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=catalog_orders;Username=postgres;Password=postgres"
     }
   }
   ```

3. **Aplique as migrations:**
   ```bash
   cd backend/src
   dotnet ef database update --project CatalogOrders.Infrastructure --startup-project CatalogOrders.Api
   ```

4. **Execute a API:**
   ```bash
   cd CatalogOrders.Api
   dotnet run
   ```

#### Frontend

1. **Instale as dependências:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure a URL da API** (opcional, padrão: `http://localhost:8080/api`):
   ```bash
   # Criar arquivo .env
   echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env
   ```

3. **Execute o frontend:**
   ```bash
   npm run dev
   ```
   
   A aplicação estará disponível em `http://localhost:5173`

## 🔌 API Endpoints

### Produtos

- `GET /api/products` - Listar produtos (com paginação)
- `GET /api/products/{id}` - Buscar produto por ID
- `POST /api/products` - Criar produto
- `PUT /api/products/{id}` - Atualizar produto
- `DELETE /api/products/{id}` - Deletar produto

### Clientes

- `GET /api/customers` - Listar clientes (com paginação)
- `GET /api/customers/{id}` - Buscar cliente por ID
- `POST /api/customers` - Criar cliente
- `PUT /api/customers/{id}` - Atualizar cliente
- `DELETE /api/customers/{id}` - Deletar cliente

### Pedidos

- `GET /api/orders` - Listar pedidos (com paginação)
- `GET /api/orders/{id}` - Buscar pedido por ID
- `POST /api/orders` - Criar pedido (requer header `Idempotency-Key`)
- `PATCH /api/orders/{id}/status` - Atualizar status do pedido

### Envelope de Resposta

Todas as respostas seguem o formato padrão:

```json
{
  "cod_retorno": 0,
  "mensagem": null,
  "data": { ... }
}
```

**Erro:**
```json
{
  "cod_retorno": 1,
  "mensagem": "Mensagem de erro",
  "data": null
}
```

## 🧪 Testes

### Executar Testes Unitários (Backend)

```bash
cd backend/tests/CatalogOrders.Tests
dotnet test
```

### Executar Testes E2E (Frontend)

**Pré-requisitos:**
- Backend e Frontend devem estar rodando
- Backend em `http://localhost:8080`
- Frontend em `http://localhost:3000`

**Executar testes em modo headless:**
```bash
cd frontend
npm run test:e2e
```

**Executar testes com interface gráfica:**
```bash
cd frontend
npm run test:e2e:open
```

### Cobertura de Testes

**Backend - Testes Unitários:**
- Regras de negócio (validação de estoque, criação de pedidos)
- Use Cases principais
- Validações de entrada

**Frontend - Testes E2E:**
- Fluxo completo de CRUD de produtos
- Fluxo completo de CRUD de clientes
- Criação e gerenciamento de pedidos
- Validações de formulários
- Busca e filtros
- Ordenação de tabelas

## 🎯 Decisões Técnicas

### 1. Clean Architecture
- **Motivo**: Separação clara de responsabilidades, testabilidade e manutenibilidade
- **Benefício**: Facilita evolução e testes

### 2. Use Cases ao invés de Services
- **Motivo**: Cada caso de uso encapsula uma operação específica
- **Benefício**: Código mais organizado e fácil de entender

### 3. EF Core apenas (sem Dapper)
- **Motivo**: Simplicidade para o escopo do projeto
- **Otimizações**: `AsNoTracking()` para leituras, projeções para reduzir dados transferidos

### 4. AutoMapper
- **Motivo**: Reduz boilerplate de mapeamento
- **Cuidado**: Configurado para não expor campos sensíveis ou navegação

### 5. FluentValidation
- **Motivo**: Validação declarativa e reutilizável
- **Benefício**: Mensagens de erro claras e consistentes

### 6. Idempotência via Middleware
- **Motivo**: Garantir que requisições duplicadas não causem efeitos colaterais
- **Implementação**: Cache em memória com expiração de 1 hora

### 7. Transações Atômicas
- **Motivo**: Garantir consistência na criação de pedidos
- **Implementação**: Unit of Work pattern com transações manuais

### 8. Logs Estruturados (Serilog)
- **Motivo**: Facilita análise e debugging
- **Formato**: JSON estruturado com contexto enriquecido

### 9. Migrations Automáticas
- **Motivo**: Aplicar schema automaticamente na inicialização
- **Benefício**: Facilita deploy e desenvolvimento

### 10. Seed Automático
- **Motivo**: Dados iniciais para testes e demonstração
- **Dados**: 20 produtos e 10 clientes

## 🤖 Uso de IA

Este projeto utilizou assistência de IA (Cursor/Claude) para:
- **Geração inicial de código**: Estrutura de projetos, entidades, DTOs
- **Refatoração**: Ajustes de arquitetura e padrões
- **Documentação**: Ajuda na criação deste README
- **Debugging**: Identificação e correção de erros

**Nota**: Todo o código foi revisado e ajustado manualmente, garantindo qualidade e entendimento completo da solução.

## 📝 Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e ajuste conforme necessário:

```bash
cp .env.example .env
```

**Variáveis disponíveis:**

- `POSTGRES_USER` - Usuário do PostgreSQL (padrão: postgres)
- `POSTGRES_PASSWORD` - Senha do PostgreSQL (padrão: postgres)
- `POSTGRES_DB` - Nome do banco de dados (padrão: catalog_orders)
- `POSTGRES_PORT` - Porta do PostgreSQL (padrão: 5432)
- `ASPNETCORE_ENVIRONMENT` - Ambiente da aplicação (Development/Production)
- `ASPNETCORE_URLS` - URLs da API (padrão: http://+:8080)
- `BACKEND_PORT` - Porta do backend (padrão: 8080)
- `FRONTEND_PORT` - Porta do frontend (padrão: 3000)
- `VITE_API_BASE_URL` - URL base da API (usado no build do frontend)

## 🔒 Segurança

- Validação de entrada em todas as requisições
- DTOs não expõem campos sensíveis
- Connection strings via variáveis de ambiente
- CORS configurado para frontend específico

## 📊 Banco de Dados

### Modelo de Dados

- **products**: Catálogo de produtos
- **customers**: Clientes do sistema
- **orders**: Pedidos realizados
- **order_items**: Itens de cada pedido

### Migrations

As migrations são aplicadas automaticamente na inicialização. Para criar novas:

```bash
cd backend/src
dotnet ef migrations add NomeDaMigration --project CatalogOrders.Infrastructure --startup-project CatalogOrders.Api
```

## 🐛 Troubleshooting

### Erro de conexão com PostgreSQL
- Verifique se o container está rodando: `docker ps`
- Verifique as variáveis de ambiente no `.env`
- Verifique os logs: `docker-compose logs postgres`

### Erro ao aplicar migrations
- Certifique-se de que o PostgreSQL está acessível
- Verifique a connection string
- Veja os logs: `docker-compose logs backend`