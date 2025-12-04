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

public class UpdateOrderStatusUseCaseTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IOrderRepository> _orderRepositoryMock;
    private readonly IMapper _mapper;

    public UpdateOrderStatusUseCaseTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _orderRepositoryMock = new Mock<IOrderRepository>();

        _unitOfWorkMock.Setup(u => u.Orders).Returns(_orderRepositoryMock.Object);

        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();
    }

    [Fact]
    public async Task Execute_PedidoNaoEncontrado_DeveLancarKeyNotFoundException()
    {
        // Arrange
        var useCase = new UpdateOrderStatusUseCase(_unitOfWorkMock.Object, _mapper);
        var dto = new UpdateOrderStatusDto { Status = OrderStatus.PAID };

        _orderRepositoryMock.Setup(r => r.GetByIdWithItemsAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Order?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
            () => useCase.Execute(999, dto));

        Assert.Contains("Pedido com ID 999 não encontrado", exception.Message);
    }

    [Fact]
    public async Task Execute_PedidoCancelado_DeveLancarInvalidOperationException()
    {
        // Arrange
        var order = new Order
        {
            Id = 1,
            CustomerId = 1,
            Status = OrderStatus.CANCELLED,
            TotalAmount = 100m
        };

        var useCase = new UpdateOrderStatusUseCase(_unitOfWorkMock.Object, _mapper);
        var dto = new UpdateOrderStatusDto { Status = OrderStatus.PAID };

        _orderRepositoryMock.Setup(r => r.GetByIdWithItemsAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => useCase.Execute(1, dto));

        Assert.Contains("Não é possível alterar status de um pedido cancelado", exception.Message);
    }

    [Fact]
    public async Task Execute_ReverterPedidoPagoParaCriado_DeveLancarInvalidOperationException()
    {
        // Arrange
        var order = new Order
        {
            Id = 1,
            CustomerId = 1,
            Status = OrderStatus.PAID,
            TotalAmount = 100m
        };

        var useCase = new UpdateOrderStatusUseCase(_unitOfWorkMock.Object, _mapper);
        var dto = new UpdateOrderStatusDto { Status = OrderStatus.CREATED };

        _orderRepositoryMock.Setup(r => r.GetByIdWithItemsAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => useCase.Execute(1, dto));

        Assert.Contains("Não é possível reverter pedido pago para criado", exception.Message);
    }
}

