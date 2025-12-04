using AutoMapper;
using CatalogOrders.Application.DTOs;
using CatalogOrders.Domain.Entities;
using CatalogOrders.Domain.Enums;
using CatalogOrders.Domain.Interfaces;

namespace CatalogOrders.Application.UseCases.Orders;

public class CreateOrderUseCase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateOrderUseCase(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<OrderDto> Execute(CreateOrderDto dto, CancellationToken cancellationToken = default)
    {
        // Validar cliente existe
        var customer = await _unitOfWork.Customers.GetByIdAsync(dto.CustomerId, cancellationToken);
        if (customer == null)
        {
            throw new KeyNotFoundException($"Cliente com ID {dto.CustomerId} não encontrado.");
        }

        // Validar que há itens no pedido
        if (dto.OrderItems == null || !dto.OrderItems.Any())
        {
            throw new InvalidOperationException("Pedido deve conter pelo menos um item.");
        }

        // Iniciar transação
        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            // Criar pedido
            var order = new Order
            {
                CustomerId = dto.CustomerId,
                Status = OrderStatus.CREATED
            };

            // Processar cada item do pedido
            foreach (var itemDto in dto.OrderItems)
            {
                // Buscar produto
                var product = await _unitOfWork.Products.GetByIdAsync(itemDto.ProductId, cancellationToken);
                if (product == null)
                {
                    throw new KeyNotFoundException($"Produto com ID {itemDto.ProductId} não encontrado.");
                }

                // Validar se produto está ativo
                if (!product.IsActive)
                {
                    throw new InvalidOperationException($"Produto '{product.Name}' não está ativo.");
                }

                // Validar estoque disponível
                if (product.StockQty < itemDto.Quantity)
                {
                    throw new InvalidOperationException(
                        $"Estoque insuficiente para o produto '{product.Name}'. " +
                        $"Disponível: {product.StockQty}, Solicitado: {itemDto.Quantity}");
                }

                // Criar item do pedido
                var orderItem = new OrderItem
                {
                    OrderId = order.Id, // Será atualizado após salvar o pedido
                    ProductId = product.Id,
                    UnitPrice = product.Price, // Preço atual do produto
                    Quantity = itemDto.Quantity
                };

                // Calcular total da linha
                orderItem.CalculateLineTotal();

                // Adicionar item ao pedido
                order.OrderItems.Add(orderItem);

                // Atualizar estoque do produto
                product.StockQty -= itemDto.Quantity;
                await _unitOfWork.Products.UpdateAsync(product, cancellationToken);
            }

            // Calcular total do pedido
            order.CalculateTotal();

            // Salvar pedido e itens
            await _unitOfWork.Orders.CreateAsync(order, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Commit da transação
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            // Buscar pedido completo com relacionamentos
            var savedOrder = await _unitOfWork.Orders.GetByIdWithItemsAsync(order.Id, cancellationToken);
            if (savedOrder == null)
            {
                throw new InvalidOperationException("Erro ao recuperar pedido criado.");
            }

            // Converter para DTO
            return _mapper.Map<OrderDto>(savedOrder);
        }
        catch
        {
            // Rollback em caso de erro
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}

