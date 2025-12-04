using CatalogOrders.Api.Filters;
using CatalogOrders.Api.Middleware;
using CatalogOrders.Application.Extensions;
using CatalogOrders.Application.UseCases.Customers;
using CatalogOrders.Application.UseCases.Orders;
using CatalogOrders.Application.UseCases.Products;
using CatalogOrders.Infrastructure.Data;
using CatalogOrders.Infrastructure.Extensions;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configurar Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers(options =>
{
    // Registrar filtro de validação customizado globalmente
    options.Filters.Add<FluentValidationFilter>();
})
    .ConfigureApiBehaviorOptions(options =>
    {
        // Desabilitar validação automática do ASP.NET Core (FluentValidation faz isso)
        options.SuppressModelStateInvalidFilter = true;
    });

// Configurar FluentValidation (nova API)
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();

// Configurar CORS para o frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configurar Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Catalog Orders API",
        Version = "v1",
        Description = "API para gestão de catálogo e pedidos"
    });
});

// Registrar camadas (Inversão de Dependência)
builder.Services.AddInfrastructure(builder.Configuration); // Infrastructure: DbContext, Repositories, UnitOfWork
builder.Services.AddApplication(); // Application: AutoMapper, FluentValidation

// Registrar Use Cases
builder.Services.AddScoped<CreateProductUseCase>();
builder.Services.AddScoped<UpdateProductUseCase>();
builder.Services.AddScoped<GetProductUseCase>();
builder.Services.AddScoped<ListProductsUseCase>();
builder.Services.AddScoped<DeleteProductUseCase>();

builder.Services.AddScoped<CreateCustomerUseCase>();
builder.Services.AddScoped<UpdateCustomerUseCase>();
builder.Services.AddScoped<GetCustomerUseCase>();
builder.Services.AddScoped<ListCustomersUseCase>();
builder.Services.AddScoped<DeleteCustomerUseCase>();

builder.Services.AddScoped<CreateOrderUseCase>();
builder.Services.AddScoped<GetOrderUseCase>();
builder.Services.AddScoped<ListOrdersUseCase>();
builder.Services.AddScoped<UpdateOrderStatusUseCase>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS deve vir antes de UseRouting
app.UseCors("AllowReactApp");

// Middlewares customizados
app.UseMiddleware<IdempotencyMiddleware>(); // Verifica idempotência antes do controller
app.UseMiddleware<EnvelopeMiddleware>();    // Padroniza respostas após o controller

app.UseAuthorization();

app.MapControllers();

// Aplicar migrations e seed de dados iniciais
try
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        // Aplicar migrations pendentes
        await context.Database.MigrateAsync();
        Log.Information("Migrations aplicadas com sucesso");
        
        // Executar seed
        await SeedData.SeedAsync(context);
        Log.Information("Seed de dados executado com sucesso");
    }
}
catch (Exception ex)
{
    Log.Warning(ex, "Erro ao aplicar migrations ou executar seed de dados. Continuando...");
}

try
{
    Log.Information("Iniciando aplicação Catalog Orders API");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Aplicação encerrada inesperadamente");
}
finally
{
    Log.CloseAndFlush();
}
