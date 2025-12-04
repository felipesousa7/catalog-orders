using Microsoft.Extensions.Caching.Memory;

namespace CatalogOrders.Infrastructure.Services;

public class IdempotencyService : IIdempotencyService
{
    private readonly IMemoryCache _cache;
    private const int CACHE_EXPIRATION_MINUTES = 60; // Cache por 1 hora

    public IdempotencyService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public Task<bool> IsProcessedAsync(string idempotencyKey, CancellationToken cancellationToken = default)
    {
        var cacheKey = GetCacheKey(idempotencyKey);
        var exists = _cache.TryGetValue(cacheKey, out _);
        return Task.FromResult(exists);
    }

    public Task SaveResponseAsync(string idempotencyKey, string response, CancellationToken cancellationToken = default)
    {
        var cacheKey = GetCacheKey(idempotencyKey);
        var options = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CACHE_EXPIRATION_MINUTES)
        };

        _cache.Set(cacheKey, response, options);
        return Task.CompletedTask;
    }

    public Task<string?> GetResponseAsync(string idempotencyKey, CancellationToken cancellationToken = default)
    {
        var cacheKey = GetCacheKey(idempotencyKey);
        _cache.TryGetValue(cacheKey, out string? response);
        return Task.FromResult(response);
    }

    private static string GetCacheKey(string idempotencyKey)
    {
        return $"Idempotency:{idempotencyKey}";
    }
}

