# Backend - Catalog Orders API

API REST desenvolvida em .NET 8 seguindo Clean Architecture e princípios SOLID.

## 📋 Índice

- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Executar](#como-executar)
- [Endpoints da API](#endpoints-da-api)
- [Use Cases Implementados](#use-cases-implementados)
- [Padrões e Decisões](#padrões-e-decisões)
- [Testes](#testes)

## 🛠 Stack Tecnológica

- **.NET 8** - Framework
- **ASP.NET Core Web API** - Framework web
- **Entity Framework Core 8.0** - ORM
- **PostgreSQL 16** - Banco de dados
- **Serilog** - Logs estruturados
- **AutoMapper 12.0.1** - Mapeamento DTO ↔ Entity
- **FluentValidation 11.3.1** - Validação de entrada
- **xUnit** - Framework de testes

## 🏗 Arquitetura

O backend segue **Clean Architecture** com 4 camadas:

```
┌─────────────────────────────────────┐
│         CatalogOrders.Api           │
│  Controllers, Middleware, Filters   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    CatalogOrders.Application        │
│  Use Cases, DTOs, Validators        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      CatalogOrders.Domain           │
│  Entities, Interfaces, Enums        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   CatalogOrders.Infrastructure      │
│  EF Core, Repositories, Services    │
└─────────────────────────────────────┘
```

### Camadas

#### 1. Domain
- **Entidades**: `Product`, `Customer`, `Order`, `OrderItem`
- **Interfaces**: `IProductRepository`, `ICustomerRepository`, `IOrderRepository`, `IUnitOfWork`
- **Enums**: `OrderStatus`
- **Sem dependências externas**

#### 2. Application
- **Use Cases**: 14 casos de uso implementados
- **DTOs**: Data Transfer Objects para entrada/saída
- **Validators**: FluentValidation para validação
- **Mappings**: AutoMapper profiles
- **Depende apenas do Domain**

#### 3. Infrastructure
- **DbContext**: `AppDbContext` com EF Core
- **Repositories**: Implementações dos repositórios
- **Unit of Work**: Gerenciamento de transações
- **Services**: `IdempotencyService`
- **Migrations**: EF Core migrations
- **Seed Data**: Dados iniciais

#### 4. Api
- **Controllers**: `ProductsController`, `CustomersController`, `OrdersController`
- **Middleware**: `IdempotencyMiddleware`, `EnvelopeMiddleware`
- **Filters**: `FluentValidationFilter`
- **Depende de Application e Infrastructure**

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── CatalogOrders.Api/              # Camada de apresentação
│   │   ├── Controllers/                 # Controllers REST
│   │   ├── Middleware/                 # Middlewares customizados
│   │   ├── Filters/                     # Action filters
│   │   ├── Program.cs                   # Entry point
│   │   └── appsettings.json            # Configurações
│   │
│   ├── CatalogOrders.Application/       # Camada de aplicação
│   │   ├── UseCases/                    # Casos de uso
│   │   │   ├── Products/                # 5 use cases
│   │   │   ├── Customers/               # 5 use cases
│   │   │   └── Orders/                  # 4 use cases
│   │   ├── DTOs/                        # Data Transfer Objects
│   │   ├── Validators/                  # FluentValidation
│   │   ├── Mappings/                    # AutoMapper profiles
│   │   └── Extensions/                  # Extension methods
│   │
│   ├── CatalogOrders.Domain/            # Camada de domínio
│   │   ├── Entities/                    # Entidades de domínio
│   │   ├── Interfaces/                  # Contratos de repositório
│   │   └── Enums/                       # Enumeradores
│   │
│   ├── CatalogOrders.Infrastructure/    # Camada de infraestrutura
│   │   ├── Data/                        # DbContext, Seed
│   │   ├── Repositories/                # Implementações
│   │   ├── Services/                    # Serviços de infra
│   │   ├── Migrations/                  # EF Core migrations
│   │   └── Extensions/                  # Extension methods
│   │
│   └── CatalogOrders.sln               # Solution file
│
├── tests/
│   └── CatalogOrders.Tests/            # Testes unitários
│
└── Dockerfile                          # Dockerfile do backend
```

## 🚀 Como Executar

### Opção 1: Docker Compose (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d backend
```

### Opção 2: Desenvolvimento Local

1. **Configure o PostgreSQL** (ou use Docker):
   ```bash
   docker-compose up -d postgres
   ```

2. **Configure a connection string** no `appsettings.json`

3. **Aplique as migrations**:
   ```bash
   cd src
   dotnet ef database update --project CatalogOrders.Infrastructure --startup-project CatalogOrders.Api
   ```

4. **Execute a API**:
   ```bash
   cd CatalogOrders.Api
   dotnet run
   ```

A API estará disponível em: `http://localhost:5171` (ou porta configurada)

## 🔌 Endpoints da API

### Produtos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/products` | Listar produtos (paginação, filtros, ordenação) |
| `GET` | `/api/products/{id}` | Buscar produto por ID |
| `POST` | `/api/products` | Criar produto |
| `PUT` | `/api/products/{id}` | Atualizar produto |
| `DELETE` | `/api/products/{id}` | Deletar produto |

**Query Parameters (GET /api/products):**
- `pageNumber` (int): Número da página (padrão: 1)
- `pageSize` (int): Itens por página (padrão: 10)
- `searchTerm` (string): Busca por nome ou SKU
- `sortBy` (string): Campo para ordenação (name, price, sku)
- `sortDescending` (bool): Ordenação decrescente

### Clientes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/customers` | Listar clientes (paginação, filtros, ordenação) |
| `GET` | `/api/customers/{id}` | Buscar cliente por ID |
| `POST` | `/api/customers` | Criar cliente |
| `PUT` | `/api/customers/{id}` | Atualizar cliente |
| `DELETE` | `/api/customers/{id}` | Deletar cliente |

**Query Parameters (GET /api/customers):**
- `pageNumber` (int): Número da página
- `pageSize` (int): Itens por página
- `searchTerm` (string): Busca por nome, email ou documento
- `sortBy` (string): Campo para ordenação (name, email)
- `sortDescending` (bool): Ordenação decrescente

### Pedidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/orders` | Listar pedidos (paginação, filtros, ordenação) |
| `GET` | `/api/orders/{id}` | Buscar pedido por ID (com itens) |
| `POST` | `/api/orders` | Criar pedido (requer `Idempotency-Key` header) |
| `PATCH` | `/api/orders/{id}/status` | Atualizar status do pedido |

**Headers (POST /api/orders):**
- `Idempotency-Key`: Chave única para garantir idempotência

**Body (POST /api/orders):**
```json
{
  "customerId": 1,
  "orderItems": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

## 📦 Use Cases Implementados

### Produtos (5 use cases)
- ✅ `CreateProductUseCase` - Criar produto
- ✅ `UpdateProductUseCase` - Atualizar produto
- ✅ `GetProductUseCase` - Buscar produto por ID
- ✅ `ListProductsUseCase` - Listar produtos com paginação/filtros
- ✅ `DeleteProductUseCase` - Deletar produto

### Clientes (5 use cases)
- ✅ `CreateCustomerUseCase` - Criar cliente (valida email/documento únicos)
- ✅ `UpdateCustomerUseCase` - Atualizar cliente
- ✅ `GetCustomerUseCase` - Buscar cliente por ID
- ✅ `ListCustomersUseCase` - Listar clientes com paginação/filtros
- ✅ `DeleteCustomerUseCase` - Deletar cliente

### Pedidos (4 use cases)
- ✅ `CreateOrderUseCase` - Criar pedido com transação atômica
  - Valida estoque
  - Atualiza estoque automaticamente
  - Calcula totais
- ✅ `GetOrderUseCase` - Buscar pedido por ID
- ✅ `ListOrdersUseCase` - Listar pedidos com paginação/filtros
- ✅ `UpdateOrderStatusUseCase` - Atualizar status (valida transições)

## 🎯 Padrões e Decisões

### 1. Clean Architecture
- Separação clara de responsabilidades
- Domain independente de frameworks
- Testabilidade facilitada

### 2. Use Cases
- Cada operação encapsulada em um Use Case
- Orquestram a lógica de negócio
- Fácil de testar e manter

### 3. Unit of Work
- Gerencia transações atômicas
- Acesso unificado aos repositórios
- Rollback automático em caso de erro

### 4. Repository Pattern
- Abstração de acesso a dados
- Facilita testes (mock)
- Implementação otimizada (AsNoTracking para leituras)

### 5. DTOs
- Separação entre camadas
- Não expõe entidades diretamente
- Controle sobre dados expostos

### 6. AutoMapper
- Reduz boilerplate
- Configurado para não expor campos sensíveis
- Ignora propriedades de navegação

### 7. FluentValidation
- Validação declarativa
- Mensagens de erro claras
- Integrado ao pipeline do ASP.NET Core

### 8. Idempotência
- Middleware que verifica `Idempotency-Key`
- Cache em memória (1 hora de expiração)
- Retorna resposta em cache se chave já processada

### 9. Envelope de Resposta
- Middleware que padroniza todas as respostas
- Formato: `{ cod_retorno, mensagem, data }`
- Tratamento de erros consistente

### 10. Logs Estruturados
- Serilog com enriquecimento de contexto
- Console e arquivo (rolling daily)
- Formato estruturado para análise

## 🧪 Testes

### Executar Testes

```bash
cd tests/CatalogOrders.Tests
dotnet test
```

### Testes Implementados

**11 testes unitários** cobrindo regras de negócio principais:

#### CreateOrderUseCase (5 testes)
- ✅ Cliente não encontrado
- ✅ Pedido sem itens
- ✅ Produto não encontrado
- ✅ Produto inativo
- ✅ Estoque insuficiente

#### UpdateOrderStatusUseCase (3 testes)
- ✅ Pedido não encontrado
- ✅ Tentativa de alterar pedido cancelado
- ✅ Tentativa de reverter pedido pago para criado

#### CreateCustomerUseCase (2 testes)
- ✅ Email já existe
- ✅ Documento já existe

#### CreateProductUseCase (1 teste)
- ✅ SKU já existe

### Cobertura

Os testes focam em:
- **Regras de negócio** (validação de estoque, criação de pedidos)
- **Validações de unicidade** (email, documento, SKU)
- **Transições de status** (validação de estados)
- **Use Cases principais** (cenários de erro)

## 🔧 Configuração

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=catalog_orders;Username=postgres;Password=postgres"
  },
  "Serilog": {
    "WriteTo": [
      { "Name": "Console" },
      { "Name": "File", "Args": { "path": "logs/catalog-orders-.log" } }
    ]
  }
}
```

### Variáveis de Ambiente (Docker)

- `ConnectionStrings__DefaultConnection` - Connection string do PostgreSQL
- `ASPNETCORE_ENVIRONMENT` - Ambiente (Development/Production)
- `ASPNETCORE_URLS` - URLs da API

## 📊 Banco de Dados

### Modelo de Dados

- **products**: Catálogo de produtos
- **customers**: Clientes
- **orders**: Pedidos
- **order_items**: Itens dos pedidos

### Migrations

Aplicadas automaticamente na inicialização. Para criar novas:

```bash
dotnet ef migrations add NomeDaMigration --project CatalogOrders.Infrastructure --startup-project CatalogOrders.Api
```

### Seed Data

Executado automaticamente na inicialização:
- 20 produtos
- 10 clientes

## 🔒 Segurança

- Validação de entrada em todas as requisições
- DTOs não expõem campos sensíveis (SKU, IDs internos)
- Connection strings via variáveis de ambiente
- CORS configurado para origens específicas

## 📝 Logs

Logs estruturados salvos em:
- **Console**: Formato legível
- **Arquivo**: `logs/catalog-orders-YYYYMMDD.log` (formato estruturado)

## 🐛 Troubleshooting

### Erro de conexão com PostgreSQL
- Verifique se o container está rodando
- Verifique a connection string
- Veja os logs: `docker-compose logs postgres`

### Erro ao aplicar migrations
- Certifique-se de que o PostgreSQL está acessível
- Verifique a connection string
- Veja os logs: `docker-compose logs backend`

---

**Última atualização**: Dezembro 2024

