using AutoMapper;
using CatalogOrders.Application.DTOs;
using CatalogOrders.Domain.Entities;
using CatalogOrders.Domain.Interfaces;

namespace CatalogOrders.Application.UseCases.Products;

public class CreateProductUseCase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateProductUseCase(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ProductDto> Execute(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        // Validar se SKU já existe
        var existingProduct = await _unitOfWork.Products.GetBySkuAsync(dto.Sku, cancellationToken);
        if (existingProduct != null)
        {
            throw new InvalidOperationException($"Produto com SKU '{dto.Sku}' já existe.");
        }

        // Converter DTO para Entity
        var product = _mapper.Map<Product>(dto);

        // Criar produto
        await _unitOfWork.Products.CreateAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Converter Entity para DTO
        return _mapper.Map<ProductDto>(product);
    }
}

