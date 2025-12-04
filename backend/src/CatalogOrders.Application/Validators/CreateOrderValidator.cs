using CatalogOrders.Application.DTOs;
using FluentValidation;

namespace CatalogOrders.Application.Validators;

public class CreateOrderValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.CustomerId)
            .GreaterThan(0).WithMessage("ID do cliente deve ser maior que zero");

        RuleFor(x => x.OrderItems)
            .NotEmpty().WithMessage("Pedido deve conter pelo menos um item")
            .Must(items => items != null && items.Count > 0).WithMessage("Pedido deve conter pelo menos um item")
            .Must(items => items != null && items.Count <= 100).WithMessage("Pedido não pode conter mais de 100 itens");

        RuleForEach(x => x.OrderItems)
            .SetValidator(new CreateOrderItemValidator());
    }
}

