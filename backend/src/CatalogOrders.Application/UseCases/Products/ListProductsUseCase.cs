using AutoMapper;
using CatalogOrders.Application.DTOs;
using CatalogOrders.Domain.Interfaces;

namespace CatalogOrders.Application.UseCases.Products;

public class ListProductsUseCase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ListProductsUseCase(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<ProductListDto>> Execute(
        PaginationDto pagination,
        CancellationToken cancellationToken = default)
    {
        // Buscar todos os produtos
        var products = await _unitOfWork.Products.GetAllAsync(cancellationToken);

        // Aplicar filtro de busca (se houver)
        if (!string.IsNullOrWhiteSpace(pagination.SearchTerm))
        {
            products = products.Where(p =>
                p.Name.Contains(pagination.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                p.Sku.Contains(pagination.SearchTerm, StringComparison.OrdinalIgnoreCase)
            );
        }

        // Aplicar ordenação
        var queryable = products.AsQueryable();
        if (!string.IsNullOrWhiteSpace(pagination.SortBy))
        {
            queryable = pagination.SortBy.ToLower() switch
            {
                "name" => pagination.SortDescending
                    ? queryable.OrderByDescending(p => p.Name)
                    : queryable.OrderBy(p => p.Name),
                "price" => pagination.SortDescending
                    ? queryable.OrderByDescending(p => p.Price)
                    : queryable.OrderBy(p => p.Price),
                "sku" => pagination.SortDescending
                    ? queryable.OrderByDescending(p => p.Sku)
                    : queryable.OrderBy(p => p.Sku),
                _ => queryable.OrderBy(p => p.Name)
            };
        }
        else
        {
            queryable = queryable.OrderBy(p => p.Name);
        }

        // Paginação
        var totalCount = queryable.Count();
        var items = queryable
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToList();

        // Converter para DTOs
        var dtos = _mapper.Map<List<ProductListDto>>(items);

        return new PagedResultDto<ProductListDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }
}

