using AutoMapper;
using CatalogOrders.Application.DTOs;
using CatalogOrders.Application.Mappings;
using CatalogOrders.Application.UseCases.Orders;
using CatalogOrders.Domain.Entities;
using CatalogOrders.Domain.Enums;
using CatalogOrders.Domain.Interfaces;
using Moq;
using Xunit;

namespace CatalogOrders.Tests.UseCases.Orders;

public class CreateOrderUseCaseTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ICustomerRepository> _customerRepositoryMock;
    private readonly Mock<IProductRepository> _productRepositoryMock;
    private readonly Mock<IOrderRepository> _orderRepositoryMock;
    private readonly IMapper _mapper;

    public CreateOrderUseCaseTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _customerRepositoryMock = new Mock<ICustomerRepository>();
        _productRepositoryMock = new Mock<IProductRepository>();
        _orderRepositoryMock = new Mock<IOrderRepository>();

        // Configurar UnitOfWork para retornar os repositórios mockados
        _unitOfWorkMock.Setup(u => u.Customers).Returns(_customerRepositoryMock.Object);
        _unitOfWorkMock.Setup(u => u.Products).Returns(_productRepositoryMock.Object);
        _unitOfWorkMock.Setup(u => u.Orders).Returns(_orderRepositoryMock.Object);

        // Configurar AutoMapper
        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();
    }

    [Fact]
    public async Task Execute_ClienteNaoEncontrado_DeveLancarKeyNotFoundException()
    {
        // Arrange
        var useCase = new CreateOrderUseCase(_unitOfWorkMock.Object, _mapper);
        var dto = new CreateOrderDto
        {
            CustomerId = 999,
            OrderItems = new List<CreateOrderItemDto>
            {
                new() { ProductId = 1, Quantity = 1 }
            }
        };

        _customerRepositoryMock.Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Customer?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
            () => useCase.Execute(dto));

        Assert.Contains("Cliente com ID 999 não encontrado", exception.Message);
    }

    [Fact]
    public async Task Execute_PedidoSemItens_DeveLancarInvalidOperationException()
    {
        // Arrange
        var customer = new Customer { Id = 1, Name = "Teste", Email = "teste@email.com", Document = "12345678901" };
        var useCase = new CreateOrderUseCase(_unitOfWorkMock.Object, _mapper);
        var dto = new CreateOrderDto
        {
            CustomerId = 1,
            OrderItems = new List<CreateOrderItemDto>()
        };

        _customerRepositoryMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customer);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => useCase.Execute(dto));

        Assert.Equal("Pedido deve conter pelo menos um item.", exception.Message);
    }

    [Fact]
    public async Task Execute_ProdutoNaoEncontrado_DeveLancarKeyNotFoundException()
    {
        // Arrange
        var customer = new Customer { Id = 1, Name = "Teste", Email = "teste@email.com", Document = "12345678901" };
        var useCase = new CreateOrderUseCase(_unitOfWorkMock.Object, _mapper);
        var dto = new CreateOrderDto
        {
            CustomerId = 1,
            OrderItems = new List<CreateOrderItemDto>
            {
                new() { ProductId = 999, Quantity = 1 }
            }
        };

        _customerRepositoryMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customer);
        _productRepositoryMock.Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
            () => useCase.Execute(dto));

        Assert.Contains("Produto com ID 999 não encontrado", exception.Message);
    }

    [Fact]
    public async Task Execute_ProdutoInativo_DeveLancarInvalidOperationException()
    {
        // Arrange
        var customer = new Customer { Id = 1, Name = "Teste", Email = "teste@email.com", Document = "12345678901" };
        var product = new Product 
        { 
            Id = 1, 
            Name = "Produto Inativo", 
            Sku = "TEST-001", 
            Price = 100m, 
            StockQty = 10,
            IsActive = false 
        };

        var useCase = new CreateOrderUseCase(_unitOfWorkMock.Object, _mapper);
        var dto = new CreateOrderDto
        {
            CustomerId = 1,
            OrderItems = new List<CreateOrderItemDto>
            {
                new() { ProductId = 1, Quantity = 1 }
            }
        };

        _customerRepositoryMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customer);
        _productRepositoryMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => useCase.Execute(dto));

        Assert.Contains("Produto 'Produto Inativo' não está ativo", exception.Message);
    }

    [Fact]
    public async Task Execute_EstoqueInsuficiente_DeveLancarInvalidOperationException()
    {
        // Arrange
        var customer = new Customer { Id = 1, Name = "Teste", Email = "teste@email.com", Document = "12345678901" };
        var product = new Product 
        { 
            Id = 1, 
            Name = "Produto Teste", 
            Sku = "TEST-001", 
            Price = 100m, 
            StockQty = 5,
            IsActive = true 
        };

        var useCase = new CreateOrderUseCase(_unitOfWorkMock.Object, _mapper);
        var dto = new CreateOrderDto
        {
            CustomerId = 1,
            OrderItems = new List<CreateOrderItemDto>
            {
                new() { ProductId = 1, Quantity = 10 } // Quantidade maior que estoque
            }
        };

        _customerRepositoryMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customer);
        _productRepositoryMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => useCase.Execute(dto));

        Assert.Contains("Estoque insuficiente", exception.Message);
        Assert.Contains("Disponível: 5", exception.Message);
        Assert.Contains("Solicitado: 10", exception.Message);
    }
}

