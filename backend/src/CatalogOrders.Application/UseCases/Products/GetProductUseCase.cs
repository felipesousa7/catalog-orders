using AutoMapper;
using CatalogOrders.Application.DTOs;
using CatalogOrders.Domain.Interfaces;

namespace CatalogOrders.Application.UseCases.Products;

public class GetProductUseCase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetProductUseCase(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ProductDto> Execute(int id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken);
        if (product == null)
        {
            throw new KeyNotFoundException($"Produto com ID {id} não encontrado.");
        }

        return _mapper.Map<ProductDto>(product);
    }
}

