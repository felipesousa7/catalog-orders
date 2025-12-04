using CatalogOrders.Domain.Interfaces;

namespace CatalogOrders.Application.UseCases.Products;

public class DeleteProductUseCase
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProductUseCase(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Execute(int id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken);
        if (product == null)
        {
            throw new KeyNotFoundException($"Produto com ID {id} não encontrado.");
        }

        // Verificar se produto está em algum pedido
        // (Pode ser implementado se necessário)

        var deleted = await _unitOfWork.Products.DeleteAsync(id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return deleted;
    }
}

