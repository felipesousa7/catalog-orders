using AutoMapper;
using CatalogOrders.Application.DTOs;
using CatalogOrders.Application.Mappings;
using CatalogOrders.Application.UseCases.Customers;
using CatalogOrders.Domain.Entities;
using CatalogOrders.Domain.Interfaces;
using Moq;
using Xunit;

namespace CatalogOrders.Tests.UseCases.Customers;

public class CreateCustomerUseCaseTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ICustomerRepository> _customerRepositoryMock;
    private readonly IMapper _mapper;

    public CreateCustomerUseCaseTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _customerRepositoryMock = new Mock<ICustomerRepository>();

        _unitOfWorkMock.Setup(u => u.Customers).Returns(_customerRepositoryMock.Object);

        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();
    }

    [Fact]
    public async Task Execute_EmailJaExiste_DeveLancarInvalidOperationException()
    {
        // Arrange
        var existingCustomer = new Customer 
        { 
            Id = 1, 
            Name = "Cliente Existente", 
            Email = "existente@email.com", 
            Document = "12345678901" 
        };

        var useCase = new CreateCustomerUseCase(_unitOfWorkMock.Object, _mapper);
        var dto = new CreateCustomerDto
        {
            Name = "Novo Cliente",
            Email = "existente@email.com",
            Document = "98765432100"
        };

        _customerRepositoryMock.Setup(r => r.GetByEmailAsync("existente@email.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingCustomer);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => useCase.Execute(dto));

        Assert.Contains("Cliente com email 'existente@email.com' já existe", exception.Message);
    }

    [Fact]
    public async Task Execute_DocumentoJaExiste_DeveLancarInvalidOperationException()
    {
        // Arrange
        var existingCustomer = new Customer 
        { 
            Id = 1, 
            Name = "Cliente Existente", 
            Email = "existente@email.com", 
            Document = "12345678901" 
        };

        var useCase = new CreateCustomerUseCase(_unitOfWorkMock.Object, _mapper);
        var dto = new CreateCustomerDto
        {
            Name = "Novo Cliente",
            Email = "novo@email.com",
            Document = "12345678901"
        };

        _customerRepositoryMock.Setup(r => r.GetByEmailAsync("novo@email.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Customer?)null);
        _customerRepositoryMock.Setup(r => r.GetByDocumentAsync("12345678901", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingCustomer);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => useCase.Execute(dto));

        Assert.Contains("Cliente com documento '12345678901' já existe", exception.Message);
    }
}

