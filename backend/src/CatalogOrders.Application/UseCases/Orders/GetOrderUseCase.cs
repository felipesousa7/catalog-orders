using AutoMapper;
using CatalogOrders.Application.DTOs;
using CatalogOrders.Domain.Interfaces;

namespace CatalogOrders.Application.UseCases.Orders;

public class GetOrderUseCase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetOrderUseCase(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<OrderDto> Execute(int id, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Orders.GetByIdWithItemsAsync(id, cancellationToken);
        if (order == null)
        {
            throw new KeyNotFoundException($"Pedido com ID {id} não encontrado.");
        }

        return _mapper.Map<OrderDto>(order);
    }
}

