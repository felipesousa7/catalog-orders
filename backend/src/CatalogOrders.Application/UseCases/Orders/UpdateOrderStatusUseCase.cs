using AutoMapper;
using CatalogOrders.Application.DTOs;
using CatalogOrders.Domain.Enums;
using CatalogOrders.Domain.Interfaces;

namespace CatalogOrders.Application.UseCases.Orders;

public class UpdateOrderStatusUseCase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateOrderStatusUseCase(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<OrderDto> Execute(int id, UpdateOrderStatusDto dto, CancellationToken cancellationToken = default)
    {
        // Buscar pedido
        var order = await _unitOfWork.Orders.GetByIdWithItemsAsync(id, cancellationToken);
        if (order == null)
        {
            throw new KeyNotFoundException($"Pedido com ID {id} não encontrado.");
        }

        // Validar transição de status
        if (order.Status == OrderStatus.CANCELLED)
        {
            throw new InvalidOperationException("Não é possível alterar status de um pedido cancelado.");
        }

        if (order.Status == OrderStatus.PAID && dto.Status == OrderStatus.CREATED)
        {
            throw new InvalidOperationException("Não é possível reverter pedido pago para criado.");
        }

        // Atualizar status
        order.Status = dto.Status;

        // Salvar alterações
        await _unitOfWork.Orders.UpdateAsync(order, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Buscar pedido atualizado
        var updatedOrder = await _unitOfWork.Orders.GetByIdWithItemsAsync(id, cancellationToken);
        if (updatedOrder == null)
        {
            throw new InvalidOperationException("Erro ao recuperar pedido atualizado.");
        }

        // Converter para DTO
        return _mapper.Map<OrderDto>(updatedOrder);
    }
}

