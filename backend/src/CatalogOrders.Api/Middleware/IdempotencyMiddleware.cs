using CatalogOrders.Application.DTOs;
using CatalogOrders.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using System.Text;

namespace CatalogOrders.Api.Middleware;

public class IdempotencyMiddleware
{
    private readonly RequestDelegate _next;
    private const string IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";

    public IdempotencyMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Apenas processa métodos que modificam dados (POST, PUT, PATCH, DELETE)
        if (!IsIdempotentMethod(context.Request.Method))
        {
            await _next(context);
            return;
        }

        // Verifica se há header Idempotency-Key
        if (!context.Request.Headers.TryGetValue(IDEMPOTENCY_KEY_HEADER, out var idempotencyKey) ||
            string.IsNullOrWhiteSpace(idempotencyKey))
        {
            // Se não houver header, continua normalmente (não é obrigatório para todos os endpoints)
            await _next(context);
            return;
        }

        var key = idempotencyKey.ToString();

        // Resolve o serviço scoped do RequestServices
        var idempotencyService = context.RequestServices.GetRequiredService<IIdempotencyService>();

        // Verifica se já foi processado
        if (await idempotencyService.IsProcessedAsync(key))
        {
            // Retorna resposta em cache
            var cachedResponse = await idempotencyService.GetResponseAsync(key);
            if (!string.IsNullOrEmpty(cachedResponse))
            {
                context.Response.StatusCode = 200;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(cachedResponse);
                return;
            }
        }

        // Captura a resposta original
        var originalBodyStream = context.Response.Body;
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        try
        {
            await _next(context);

            // Se a resposta foi bem-sucedida (2xx), salva no cache
            if (context.Response.StatusCode >= 200 && context.Response.StatusCode < 300)
            {
                responseBody.Seek(0, SeekOrigin.Begin);
                var responseText = await new StreamReader(responseBody).ReadToEndAsync();
                
                // Salva resposta no cache
                await idempotencyService.SaveResponseAsync(key, responseText);

                // Copia resposta de volta para o stream original
                responseBody.Seek(0, SeekOrigin.Begin);
                await responseBody.CopyToAsync(originalBodyStream);
            }
            else
            {
                // Se houve erro, não salva no cache e retorna resposta original
                responseBody.Seek(0, SeekOrigin.Begin);
                await responseBody.CopyToAsync(originalBodyStream);
            }
        }
        finally
        {
            context.Response.Body = originalBodyStream;
        }
    }

    private static bool IsIdempotentMethod(string method)
    {
        return method.Equals("POST", StringComparison.OrdinalIgnoreCase) ||
               method.Equals("PUT", StringComparison.OrdinalIgnoreCase) ||
               method.Equals("PATCH", StringComparison.OrdinalIgnoreCase) ||
               method.Equals("DELETE", StringComparison.OrdinalIgnoreCase);
    }
}

