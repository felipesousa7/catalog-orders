using CatalogOrders.Domain.Interfaces;
using CatalogOrders.Infrastructure.Data;
using CatalogOrders.Infrastructure.Repositories;
using CatalogOrders.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CatalogOrders.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configurar DbContext
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
                // Removido EnableRetryOnFailure porque não funciona com transações manuais
                // O retry pode ser implementado em nível de aplicação se necessário
            });

            // Desabilitar tracking em leituras (otimização)
            // Pode ser habilitado quando necessário usando AsTracking()
            options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
        });

        // Registrar MemoryCache (para IdempotencyService)
        services.AddMemoryCache();

        // Registrar Repositórios
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();

        // Registrar UnitOfWork
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Registrar Services
        services.AddScoped<IIdempotencyService, IdempotencyService>();

        return services;
    }
}

