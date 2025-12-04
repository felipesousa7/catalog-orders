using CatalogOrders.Domain.Interfaces;

namespace CatalogOrders.Application.UseCases.Customers;

public class DeleteCustomerUseCase
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCustomerUseCase(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Execute(int id, CancellationToken cancellationToken = default)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id, cancellationToken);
        if (customer == null)
        {
            throw new KeyNotFoundException($"Cliente com ID {id} não encontrado.");
        }

        // Verificar se cliente tem pedidos
        var orders = await _unitOfWork.Orders.GetByCustomerIdAsync(id, cancellationToken);
        if (orders.Any())
        {
            throw new InvalidOperationException($"Não é possível excluir cliente com pedidos associados.");
        }

        var deleted = await _unitOfWork.Customers.DeleteAsync(id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return deleted;
    }
}

