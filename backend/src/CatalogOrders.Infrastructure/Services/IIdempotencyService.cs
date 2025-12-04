namespace CatalogOrders.Infrastructure.Services;

public interface IIdempotencyService
{
    Task<bool> IsProcessedAsync(string idempotencyKey, CancellationToken cancellationToken = default);
    Task SaveResponseAsync(string idempotencyKey, string response, CancellationToken cancellationToken = default);
    Task<string?> GetResponseAsync(string idempotencyKey, CancellationToken cancellationToken = default);
}

