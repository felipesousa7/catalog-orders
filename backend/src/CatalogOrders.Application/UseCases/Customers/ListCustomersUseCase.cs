using AutoMapper;
using CatalogOrders.Application.DTOs;
using CatalogOrders.Domain.Interfaces;

namespace CatalogOrders.Application.UseCases.Customers;

public class ListCustomersUseCase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ListCustomersUseCase(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<CustomerListDto>> Execute(
        PaginationDto pagination,
        CancellationToken cancellationToken = default)
    {
        // Buscar todos os clientes
        var customers = await _unitOfWork.Customers.GetAllAsync(cancellationToken);

        // Aplicar filtro de busca (se houver)
        if (!string.IsNullOrWhiteSpace(pagination.SearchTerm))
        {
            customers = customers.Where(c =>
                c.Name.Contains(pagination.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                c.Email.Contains(pagination.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                c.Document.Contains(pagination.SearchTerm, StringComparison.OrdinalIgnoreCase)
            );
        }

        // Aplicar ordenação
        var queryable = customers.AsQueryable();
        if (!string.IsNullOrWhiteSpace(pagination.SortBy))
        {
            queryable = pagination.SortBy.ToLower() switch
            {
                "name" => pagination.SortDescending
                    ? queryable.OrderByDescending(c => c.Name)
                    : queryable.OrderBy(c => c.Name),
                "email" => pagination.SortDescending
                    ? queryable.OrderByDescending(c => c.Email)
                    : queryable.OrderBy(c => c.Email),
                _ => queryable.OrderBy(c => c.Name)
            };
        }
        else
        {
            queryable = queryable.OrderBy(c => c.Name);
        }

        // Paginação
        var totalCount = queryable.Count();
        var items = queryable
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToList();

        // Converter para DTOs
        var dtos = _mapper.Map<List<CustomerListDto>>(items);

        return new PagedResultDto<CustomerListDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pagination.PageNumber,
            PageSize = pagination.PageSize
        };
    }
}

