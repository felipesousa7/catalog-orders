using CatalogOrders.Application.DTOs;
using CatalogOrders.Domain.Enums;
using FluentValidation;

namespace CatalogOrders.Application.Validators;

public class UpdateOrderStatusValidator : AbstractValidator<UpdateOrderStatusDto>
{
    public UpdateOrderStatusValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Status inválido")
            .Must(BeValidStatus).WithMessage("Status deve ser CREATED, PAID ou CANCELLED");
    }

    private bool BeValidStatus(OrderStatus status)
    {
        return status == OrderStatus.CREATED ||
               status == OrderStatus.PAID ||
               status == OrderStatus.CANCELLED;
    }
}

