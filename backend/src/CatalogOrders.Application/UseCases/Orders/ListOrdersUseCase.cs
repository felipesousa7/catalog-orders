using AutoMapper;
using CatalogOrders.Application.DTOs;
using CatalogOrders.Domain.Interfaces;

namespace CatalogOrders.Application.UseCases.Orders;

public class ListOrdersUseCase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ListOrdersUseCase(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<OrderListDto>> Execute(
        PaginationDto pagination,
        CancellationToken cancellationToken = default)
    {
        // Buscar todos os pedidos
        var orders = await _unitOfWork.Orders.GetAllAsync(cancellationToken);

        // Aplicar filtro de busca (se houver)
        if (!string.IsNullOrWhiteSpace(pagination.SearchTerm))
        {
            orders = orders.Where(o =>
                o.Customer != null && o.Customer.Name.Contains(pagination.SearchTerm, StringComparison.OrdinalIgnoreCase)
            );
        }

        // Aplicar ordenação
        var queryable = orders.AsQueryable();
        if (!string.IsNullOrWhiteSpace(pagination.SortBy))
        {
            queryable = pagination.SortBy.ToLower() switch
            {
                "createdat" => pagination.SortDescending
                    ? queryable.OrderByDescending(o => o.CreatedAt)
                    : queryable.OrderBy(o => o.CreatedAt),
                "totalamount" => pagination.SortDescending
                    ? queryable.OrderByDescending(o => o.TotalAmount)
                    : queryable.OrderBy(o => o.TotalAmount),
                "customername" => pagination.SortDescending
                    ? queryable.OrderByDescending(o => o.Customer != null ? o.Customer.Name : string.Empty)
                    : queryable.OrderBy(o => o.Customer != null ? o.Customer.Name : string.Empty),
                "itemscount" => pagination.SortDescending
                    ? queryable.OrderByDescending(o => o.OrderItems.Count)
                    : queryable.OrderBy(o => o.OrderItems.Count),
                _ => queryable.OrderByDescending(o => o.CreatedAt)
            };
        }
        else
        {
            queryable = queryable.OrderByDescending(o => o.CreatedAt);
        }

        // Paginação
        var totalCount = queryable.Count();
        var items = queryable
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToList();

        // Converter para DTOs
        var dtos = _mapper.Map<List<OrderListDto>>(items);

        return new PagedResultDto<OrderListDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }
}

