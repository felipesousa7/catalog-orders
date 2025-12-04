using CatalogOrders.Domain.Entities;
using CatalogOrders.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CatalogOrders.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aplicar todas as configurações
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Atualizar CreatedAt automaticamente para novas entidades
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is Product || e.Entity is Customer || e.Entity is Order)
            .Where(e => e.State == EntityState.Added);

        foreach (var entry in entries)
        {
            if (entry.Entity is Product product && product.CreatedAt == default)
            {
                product.CreatedAt = DateTime.UtcNow;
            }
            else if (entry.Entity is Customer customer && customer.CreatedAt == default)
            {
                customer.CreatedAt = DateTime.UtcNow;
            }
            else if (entry.Entity is Order order && order.CreatedAt == default)
            {
                order.CreatedAt = DateTime.UtcNow;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}

