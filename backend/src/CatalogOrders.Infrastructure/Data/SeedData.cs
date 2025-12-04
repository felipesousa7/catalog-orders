using CatalogOrders.Domain.Entities;
using CatalogOrders.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CatalogOrders.Infrastructure.Data;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Garantir que o banco está criado
        await context.Database.EnsureCreatedAsync();

        // Verificar se já há dados
        if (await context.Products.AnyAsync() || await context.Customers.AnyAsync())
        {
            return; // Já tem dados, não precisa seedar novamente
        }

        // Seed de Produtos (20 produtos)
        var products = new List<Product>
        {
            new Product { Name = "Notebook Dell Inspiron", Sku = "NOTE-001", Price = 2999.90m, StockQty = 15, IsActive = true },
            new Product { Name = "Mouse Logitech MX Master", Sku = "MOUS-001", Price = 299.90m, StockQty = 50, IsActive = true },
            new Product { Name = "Teclado Mecânico RGB", Sku = "TECL-001", Price = 499.90m, StockQty = 30, IsActive = true },
            new Product { Name = "Monitor LG 27 polegadas", Sku = "MONI-001", Price = 1299.90m, StockQty = 20, IsActive = true },
            new Product { Name = "Webcam Logitech C920", Sku = "WEBC-001", Price = 399.90m, StockQty = 25, IsActive = true },
            new Product { Name = "Headset HyperX Cloud II", Sku = "HEAD-001", Price = 599.90m, StockQty = 40, IsActive = true },
            new Product { Name = "SSD Samsung 1TB", Sku = "SSD-001", Price = 699.90m, StockQty = 35, IsActive = true },
            new Product { Name = "Memória RAM 16GB DDR4", Sku = "RAM-001", Price = 449.90m, StockQty = 60, IsActive = true },
            new Product { Name = "Placa de Vídeo RTX 3060", Sku = "GPU-001", Price = 2499.90m, StockQty = 10, IsActive = true },
            new Product { Name = "Fonte 750W 80 Plus Gold", Sku = "FONT-001", Price = 599.90m, StockQty = 20, IsActive = true },
            new Product { Name = "Gabinete Gamer RGB", Sku = "GABI-001", Price = 399.90m, StockQty = 25, IsActive = true },
            new Product { Name = "Cooler CPU Water Cooler", Sku = "COOL-001", Price = 499.90m, StockQty = 15, IsActive = true },
            new Product { Name = "Placa Mãe B550M", Sku = "MB-001", Price = 899.90m, StockQty = 18, IsActive = true },
            new Product { Name = "Processador AMD Ryzen 5", Sku = "CPU-001", Price = 1199.90m, StockQty = 12, IsActive = true },
            new Product { Name = "Hub USB-C 7 Portas", Sku = "HUB-001", Price = 149.90m, StockQty = 45, IsActive = true },
            new Product { Name = "Cabo HDMI 2.1 2 metros", Sku = "CABO-001", Price = 79.90m, StockQty = 100, IsActive = true },
            new Product { Name = "Suporte para Monitor", Sku = "SUPO-001", Price = 199.90m, StockQty = 30, IsActive = true },
            new Product { Name = "Tapete para Mouse Gamer", Sku = "TAPE-001", Price = 49.90m, StockQty = 80, IsActive = true },
            new Product { Name = "Mesa Gamer Ajustável", Sku = "MESA-001", Price = 899.90m, StockQty = 8, IsActive = true },
            new Product { Name = "Cadeira Gamer Ergonômica", Sku = "CADE-001", Price = 1299.90m, StockQty = 5, IsActive = false } // Inativo para teste
        };

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();

        // Seed de Clientes (10 clientes)
        var customers = new List<Customer>
        {
            new Customer { Name = "João Silva", Email = "joao.silva@email.com", Document = "12345678901" },
            new Customer { Name = "Maria Santos", Email = "maria.santos@email.com", Document = "98765432100" },
            new Customer { Name = "Pedro Oliveira", Email = "pedro.oliveira@email.com", Document = "11122233344" },
            new Customer { Name = "Ana Costa", Email = "ana.costa@email.com", Document = "55566677788" },
            new Customer { Name = "Carlos Pereira", Email = "carlos.pereira@email.com", Document = "99988877766" },
            new Customer { Name = "Fernanda Lima", Email = "fernanda.lima@email.com", Document = "44433322211" },
            new Customer { Name = "Roberto Alves", Email = "roberto.alves@email.com", Document = "77788899900" },
            new Customer { Name = "Juliana Ferreira", Email = "juliana.ferreira@email.com", Document = "22211100099" },
            new Customer { Name = "Lucas Rodrigues", Email = "lucas.rodrigues@email.com", Document = "66655544433" },
            new Customer { Name = "Patricia Souza", Email = "patricia.souza@email.com", Document = "33344455566" }
        };

        await context.Customers.AddRangeAsync(customers);
        await context.SaveChangesAsync();
    }
}

