using CatalogOrders.Application.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CatalogOrders.Api.Filters;

public class FluentValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // Verifica se há erros de validação do FluentValidation
        if (!context.ModelState.IsValid)
        {
            var errors = context.ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                );

            var errorMessages = errors
                .SelectMany(e => e.Value)
                .ToList();

            var response = ApiResponseDto<object?>.Error(
                string.Join("; ", errorMessages)
            );

            context.Result = new BadRequestObjectResult(response);
            return;
        }

        await next();
    }
}

