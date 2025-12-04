using CatalogOrders.Application.DTOs;
using System.Text;
using System.Text.Json;

namespace CatalogOrders.Api.Middleware;

public class EnvelopeMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public EnvelopeMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Ignora Swagger
        if (context.Request.Path.StartsWithSegments("/swagger"))
        {
            await _next(context);
            return;
        }

        // Captura a resposta original
        var originalBodyStream = context.Response.Body;
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        try
        {
            await _next(context);

            // Se a resposta já está no formato envelope (vem do Controller), não modifica
            if (context.Response.ContentType?.Contains("application/json") == true)
            {
                responseBody.Seek(0, SeekOrigin.Begin);
                var responseText = await new StreamReader(responseBody).ReadToEndAsync();

                // Verifica se já está no formato envelope
                if (!IsEnvelopeFormat(responseText))
                {
                    // Converte para envelope
                    var envelope = CreateEnvelope(responseText, context.Response.StatusCode);
                    var envelopeJson = JsonSerializer.Serialize(envelope, JsonOptions);

                    // Atualiza resposta
                    context.Response.ContentType = "application/json";
                    context.Response.ContentLength = Encoding.UTF8.GetByteCount(envelopeJson);

                    responseBody.SetLength(0);
                    await responseBody.WriteAsync(Encoding.UTF8.GetBytes(envelopeJson));
                }
            }

            // Copia resposta de volta para o stream original
            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalBodyStream);
        }
        finally
        {
            context.Response.Body = originalBodyStream;
        }
    }

    private static bool IsEnvelopeFormat(string responseText)
    {
        try
        {
            using var doc = JsonDocument.Parse(responseText);
            return doc.RootElement.TryGetProperty("cod_retorno", out _) &&
                   doc.RootElement.TryGetProperty("mensagem", out _) &&
                   doc.RootElement.TryGetProperty("data", out _);
        }
        catch
        {
            return false;
        }
    }

    private static object CreateEnvelope(string responseText, int statusCode)
    {
        // Se status code indica erro, cria envelope de erro
        if (statusCode >= 400)
        {
            try
            {
                // Tenta extrair mensagem de erro do JSON
                using var doc = JsonDocument.Parse(responseText);
                var message = doc.RootElement.TryGetProperty("title", out var title) 
                    ? title.GetString() 
                    : doc.RootElement.TryGetProperty("detail", out var detail) 
                        ? detail.GetString() 
                        : "Erro na requisição";

                return new
                {
                    cod_retorno = 1,
                    mensagem = message,
                    data = (object?)null
                };
            }
            catch
            {
                return new
                {
                    cod_retorno = 1,
                    mensagem = "Erro na requisição",
                    data = (object?)null
                };
            }
        }

        // Se sucesso, tenta parsear o JSON e colocar em data
        try
        {
            using var doc = JsonDocument.Parse(responseText);
            return new
            {
                cod_retorno = 0,
                mensagem = (string?)null,
                data = JsonSerializer.Deserialize<object>(responseText)
            };
        }
        catch
        {
            // Se não conseguir parsear, retorna como string
            return new
            {
                cod_retorno = 0,
                mensagem = (string?)null,
                data = responseText
            };
        }
    }
}

