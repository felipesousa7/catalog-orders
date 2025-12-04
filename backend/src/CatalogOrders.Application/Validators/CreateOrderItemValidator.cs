using CatalogOrders.Application.DTOs;
using FluentValidation;

namespace CatalogOrders.Application.Validators;

public class CreateOrderItemValidator : AbstractValidator<CreateOrderItemDto>
{
    public CreateOrderItemValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0).WithMessage("ID do produto deve ser maior que zero");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantidade deve ser maior que zero")
            .LessThanOrEqualTo(10000).WithMessage("Quantidade não pode ser maior que 10.000");
    }
}

