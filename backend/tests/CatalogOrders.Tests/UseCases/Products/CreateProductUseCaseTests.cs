using AutoMapper;
using CatalogOrders.Application.DTOs;
using CatalogOrders.Application.Mappings;
using CatalogOrders.Application.UseCases.Products;
using CatalogOrders.Domain.Entities;
using CatalogOrders.Domain.Interfaces;
using Moq;
using Xunit;

namespace CatalogOrders.Tests.UseCases.Products;

public class CreateProductUseCaseTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IProductRepository> _productRepositoryMock;
    private readonly IMapper _mapper;

    public CreateProductUseCaseTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _productRepositoryMock = new Mock<IProductRepository>();

        _unitOfWorkMock.Setup(u => u.Products).Returns(_productRepositoryMock.Object);

        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();
    }

    [Fact]
    public async Task Execute_SkuJaExiste_DeveLancarInvalidOperationException()
    {
        // Arrange
        var existingProduct = new Product 
        { 
            Id = 1, 
            Name = "Produto Existente", 
            Sku = "EXIST-001", 
            Price = 100m, 
            StockQty = 10,
            IsActive = true 
        };

        var useCase = new CreateProductUseCase(_unitOfWorkMock.Object, _mapper);
        var dto = new CreateProductDto
        {
            Name = "Novo Produto",
            Sku = "EXIST-001",
            Price = 200m,
            StockQty = 5
        };

        _productRepositoryMock.Setup(r => r.GetBySkuAsync("EXIST-001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingProduct);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => useCase.Execute(dto));

        Assert.Contains("Produto com SKU 'EXIST-001' já existe", exception.Message);
    }
}

